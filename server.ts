import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { createServer as createHttpServer } from 'node:http';
import { createApp } from './server/app.js';
import { createGeminiGenerator, DEFAULT_MODEL } from './server/gemini.js';

async function startServer() {
  const isDev = process.argv.includes('--dev');
  const port = Number(process.env.PORT ?? 3000);
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) throw new Error('TRUST_PROXY_HOPS must be a nonnegative integer.');

  if (!isDev) process.env.NODE_ENV = 'production';
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const app = createApp({ trustProxyHops, generate: apiKey ? createGeminiGenerator(apiKey, model) : undefined });
  if (!apiKey) console.warn('GEMINI_API_KEY is missing; only the sample card and library are available.');

  const server = createHttpServer(app);

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: { server }, ws: { server } }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const dist = path.resolve(import.meta.dirname, '../dist');
    app.use(express.static(dist));
    app.get('/', (_req, res) => { res.sendFile(path.join(dist, 'index.html')); });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`AuraQuote listening on port ${port} (${isDev ? 'development' : 'production'})`);
  });
}

startServer().catch((err: unknown) => {
  console.error('Failed to start AuraQuote:', err);
  process.exitCode = 1;
});
