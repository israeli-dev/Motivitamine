import express, { type ErrorRequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { isRecord, readGeneratedQuote, readQuoteRequest } from '../shared/quote.js';
import type { QuoteGenerator } from './gemini.js';

interface AppOptions {
  generate?: QuoteGenerator;
  timeoutMs?: number;
  perIpLimit?: number;
  maxInFlight?: number;
  globalPerMinute?: number;
  trustProxyHops?: number;
}

class GenerationTimeout extends Error {}

export function createApp({
  generate, timeoutMs = 20_000, perIpLimit = 12, maxInFlight = 4, globalPerMinute = 60, trustProxyHops = 0,
}: AppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxyHops > 0 ? trustProxyHops : false);
  let inFlight = 0;
  let callsThisWindow = 0;
  let windowEndsAt = 0;

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', generationConfigured: Boolean(generate) });
  });

  app.post('/api/generate-quote',
    (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); },
    rateLimit({
      windowMs: 60_000,
      limit: perIpLimit,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many quote requests. Please wait a minute and try again.' },
    }),
    express.json({ limit: '4kb' }),
    async (req, res) => {
      const input = readQuoteRequest(req.body);
      if (!input) {
        res.status(400).json({ error: 'Enter a job or career and at least one hobby within the field limits, and choose a valid tone.' });
        return;
      }
      if (!generate) {
        res.status(503).json({ error: 'AI quote generation is not configured. The studio can still style and export the sample card.' });
        return;
      }
      if (inFlight >= maxInFlight) {
        res.set('Retry-After', '5').status(503).json({ error: 'The studio is busy. Please try again in a few seconds.' });
        return;
      }

      const now = Date.now();
      if (now >= windowEndsAt) {
        windowEndsAt = now + 60_000;
        callsThisWindow = 0;
      }
      if (callsThisWindow >= globalPerMinute) {
        res.set('Retry-After', String(Math.ceil((windowEndsAt - now) / 1000)))
          .status(503).json({ error: 'The studio has reached its short-term generation limit. Please try again in a minute.' });
        return;
      }

      callsThisWindow++;
      inFlight++;
      const controller = new AbortController();
      let deadline: ReturnType<typeof setTimeout> | undefined;
      const onClose = () => controller.abort();
      res.once('close', onClose);
      try {
        const timeout = new Promise<never>((_resolve, reject) => {
          deadline = setTimeout(() => {
            reject(new GenerationTimeout());
            controller.abort();
          }, timeoutMs);
        });
        const quote = readGeneratedQuote(await Promise.race([timeout, generate(input, controller.signal)]));
        if (res.destroyed) return;
        if (!quote || (input.previousQuote && normalizeQuote(quote.quote) === normalizeQuote(input.previousQuote))) {
          console.warn('Quote generation returned unusable content');
          res.status(502).json({ error: 'Gemini didn’t return a fresh, usable quote. Please try again.' });
          return;
        }
        res.json({ ...quote, source: 'gemini' });
      } catch (error) {
        if (res.destroyed) return;
        if (error instanceof GenerationTimeout) {
          console.warn('Quote generation timed out');
          res.status(504).json({ error: 'Gemini took too long to respond. Please try again.' });
          return;
        }
        const upstreamStatus = isRecord(error) && typeof error.status === 'number' ? error.status : undefined;
        console.warn('Gemini request failed', { status: upstreamStatus });
        const busy = upstreamStatus === 429 || upstreamStatus === 503;
        res.status(busy ? 503 : 502).json({ error: busy
          ? 'Gemini is temporarily busy. Please try again shortly.'
          : 'Gemini couldn’t generate a quote right now. Please try again.' });
      } finally {
        if (deadline !== undefined) clearTimeout(deadline);
        res.off('close', onClose);
        inFlight--;
      }
    },
  );

  const handleBodyError: ErrorRequestHandler = (error, _req, res, next) => {
    if (error.type === 'entity.too.large') {
      res.status(413).json({ error: 'The quote request is too large.' });
    } else if (error.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'The quote request must contain valid JSON.' });
    } else if (error.status === 415) {
      res.status(415).json({ error: 'The quote request uses an unsupported encoding.' });
    } else {
      next(error);
    }
  };
  app.use('/api', handleBodyError);
  app.use('/api', (_req, res) => { res.status(404).json({ error: 'API route not found.' }); });
  return app;
}

function normalizeQuote(quote: string) {
  return quote.normalize('NFKC').toLowerCase().replace(/[\p{P}\s]+/gu, ' ').trim();
}
