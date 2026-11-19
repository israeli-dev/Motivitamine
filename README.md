# AuraQuote — Personalized Motivational Cards

AuraQuote uses Gemini to write a short motivational quote and reflection connecting your work with something you love doing. Enter any job, career, or role and one or more hobbies, pick a tone, then style the card, save it in your browser, or export it.

- **Generation:** Gemini writes the text on demand. Generate again with the same inputs to ask for a different image and wording; the app rejects a repeat of the quote currently on the canvas. It does not promise globally unique text.
- **Card exports:** Square PNG (1200 × 1200), Story PNG (1080 × 1920), or Banner PNG (1600 × 900). **Print / PDF** opens a card-only print view; select **Save as PDF** in the browser to download a PDF.
- **Library:** Saved cards include their styling and are stored in the current browser. Clearing site data removes the library; it does not sync across devices.

## Local setup

Requirements: Node.js 22.12+ on the 22.x line (or Node.js 24+), and npm. The repository uses `package-lock.json`; `nvm use` selects the Node 22 line used by CI.

```sh
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. Set `GEMINI_API_KEY` in your local `.env` or in the hosting provider’s server environment, then restart the server to enable generation. Do not commit the key or expose it through a `VITE_*` variable. Without a key, the sample card, styling, library, and export remain available. The app does not substitute a template for a failed AI request.

| Variable | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Unset | Required for live quote generation. |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Use a Gemini model available to your API project that supports structured JSON output. |
| `PORT` | `3000` | Express port. |
| `TRUST_PROXY_HOPS` | `0` | Leave at `0` for direct connections; configure only when every path to Express passes through that exact number of trusted proxies. This controls IP-based rate limiting. |

## Production

```sh
npm ci
npm run build
npm prune --omit=dev  # Optional if the build and runtime share the same environment
npm start
```

Deploy both `dist/` and `dist-server/` plus the npm runtime dependencies. Express serves both the frontend and the same-origin API; a Vite-only static preview cannot generate quotes. The `/api/health` endpoint reports that the process is up and whether a key is configured, not whether Gemini has accepted the key. After deployment, generate a test quote to verify provider access and quota.

The API defaults to 12 requests per minute per IP, 60 provider calls per minute per process, four concurrent calls, and a 20-second deadline. The limits are in memory and are not shared across replicas. For a public or multi-instance deployment, configure edge limits and Gemini project quotas/budget alerts separately.

## Privacy

Gemini receives the job/role, hobbies, tone, and, when regenerating the current quote, the previous generated text. Your optional display name is added to the card in the browser and is not sent to the server or Gemini. Avoid putting private information in the job or hobby fields. Names and inputs are included in locally saved cards; visible attribution can be hidden before exporting.

## Checks

```sh
npm run typecheck
npm test                         # API tests with mocked provider responses; no key needed
npm run build
npx playwright install chromium  # On Linux, add --with-deps if system libraries are missing
npm run test:e2e                  # Browser tests use the built app and a local test provider
```

GitHub Actions runs the type check, API and browser tests, build, and a production-only startup check.
