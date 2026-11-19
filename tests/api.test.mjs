import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { createApp } from '../dist-server/server/app.js';
import { createGeminiGenerator } from '../dist-server/server/gemini.js';

const input = { occupation: 'Welder', hobbies: 'Birdwatching', tone: 'poetic' };
const output = {
  quote: 'You know when to touch the spark to steel, and when to stand still long enough for wings to open.',
  reflection: 'Welding and birdwatching each reward an eye for the moment when waiting should turn into action.',
  themeTag: 'Spark and Wing',
  recommendedMood: 'summit',
};

async function listen(t, server) {
  server.listen(0, '0.0.0.0');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

async function api(t, options) {
  const base = await listen(t, createServer(createApp(options)));
  return {
    base,
    post: (value) => fetch(`${base}/api/generate-quote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: typeof value === 'string' ? value : JSON.stringify(value),
    }),
  };
}

test('normalizes the request, forwards the tone and never sends the name to the provider', async (t) => {
  const { post } = await api(t, { generate: async (request, signal) => {
    assert.deepEqual(request, { ...input, previousQuote: 'Something older' });
    assert.ok(signal instanceof AbortSignal);
    return { ...output, attribution: 'Not part of the output contract' };
  } });
  const response = await post({ ...input, occupation: '  Welder ', name: 'Private Name', previousQuote: ' Something older ' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ...output, source: 'gemini' });
});

test('rejects malformed, whitespace-only, non-string, oversized and unsupported requests without billing the provider', async (t) => {
  let calls = 0;
  const { post } = await api(t, { generate: async () => { calls++; return output; } });
  for (const value of ['{', null, [], {}, { ...input, occupation: ' ' }, { ...input, hobbies: 123 }, { ...input, tone: 'other' }, { ...input, hobbies: 'a'.repeat(121) }, { ...input, previousQuote: false }]) {
    const response = await post(value);
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, 'string');
  }
  assert.equal((await post({ ...input, hobbies: 'x'.repeat(4200) })).status, 413);
  assert.equal(calls, 0);
});

test('no-key mode and unknown API routes return honest JSON responses', async (t) => {
  const { base, post } = await api(t);
  assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { status: 'ok', generationConfigured: false });
  const response = await post(input);
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not configured/);
  assert.equal((await fetch(`${base}/api/missing`)).status, 404);
});

test('rejects malformed provider output and near-identical regenerations without a fake success', async (t) => {
  const { post } = await api(t, { generate: async (request) => request.previousQuote ? output : { ...output, recommendedMood: 'unknown' } });
  for (const data of [input, { ...input, previousQuote: `“${output.quote.toUpperCase()}”` }]) {
    const response = await post(data);
    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /fresh, usable quote/);
  }
});

test('does not expose provider error details', async (t) => {
  const { post } = await api(t, { generate: async () => { throw Object.assign(new Error('private provider detail'), { status: 429 }); } });
  const response = await post(input);
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private provider detail/);
});

test('enforces per-IP quota', async (t) => {
  const { post } = await api(t, { generate: async () => output, perIpLimit: 1 });
  assert.equal((await post(input)).status, 200);
  const response = await post(input);
  assert.equal(response.status, 429);
  assert.ok(response.headers.has('retry-after'));
});

test('caps the total number of outbound generations in a window', async (t) => {
  let calls = 0;
  const { post } = await api(t, { globalPerMinute: 1, generate: async () => { calls++; return output; } });
  assert.equal((await post({ ...input, occupation: '' })).status, 400);
  assert.equal((await post(input)).status, 200);
  const limited = await post(input);
  assert.equal(limited.status, 503);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
  assert.equal(calls, 1);
});

test('rejects excess concurrency, aborts on deadline, and frees capacity', async (t) => {
  let start;
  const started = new Promise((resolve) => { start = resolve; });
  let firstSignal;
  const { post } = await api(t, { maxInFlight: 1, timeoutMs: 200, generate: async (_request, signal) => {
    if (firstSignal) return output;
    firstSignal = signal;
    start();
    await new Promise((resolve) => signal.addEventListener('abort', resolve, { once: true }));
    return output;
  } });
  const first = post(input);
  await started;
  assert.equal((await post(input)).status, 503);
  assert.equal((await first).status, 504);
  assert.equal(firstSignal.aborted, true);
  assert.equal((await post(input)).status, 200);
});

test('Gemini adapter sends structured generation to the configured model through the real SDK', async (t) => {
  let upstream;
  const fakeGemini = createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    upstream = { path: req.url, key: req.headers['x-goog-api-key'], body: JSON.parse(raw) };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify(output) }] }, finishReason: 'STOP' }] }));
  });
  const prior = process.env.GOOGLE_GEMINI_BASE_URL;
  process.env.GOOGLE_GEMINI_BASE_URL = await listen(t, fakeGemini);
  t.after(() => { if (prior === undefined) delete process.env.GOOGLE_GEMINI_BASE_URL; else process.env.GOOGLE_GEMINI_BASE_URL = prior; });
  const { post } = await api(t, { generate: createGeminiGenerator('test-only-key', 'gemini-3.8-flash-test') });
  const response = await post({ ...input, name: 'Not for Gemini' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ...output, source: 'gemini' });
  assert.match(upstream.path, /models\/gemini-3\.8-flash-test:generateContent/);
  assert.equal(upstream.key, 'test-only-key');
  assert.deepEqual(JSON.parse(upstream.body.contents[0].parts[0].text), input);
  assert.equal(upstream.body.generationConfig.responseMimeType, 'application/json');
  assert.equal(upstream.body.generationConfig.maxOutputTokens, 1024);
  assert.deepEqual(upstream.body.generationConfig.responseJsonSchema.properties.recommendedMood.enum, ['summit', 'studio', 'cosmos', 'zen']);
});
