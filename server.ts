import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface QuoteRequest {
  name?: string;
  occupation: string;
  hobbies: string;
  tone?: 'philosophical' | 'empowering' | 'witty' | 'zen' | 'poetic';
  themeMood?: string;
}

// Fallback generator for resiliency
function generateFallbackQuote(req: QuoteRequest) {
  const { name, occupation, hobbies, tone = 'empowering' } = req;
  const userRef = name ? name : `a dedicated ${occupation}`;
  
  const fallbacks: Record<string, { quote: string; reflection: string; themeTag: string }> = {
    empowering: {
      quote: `Mastery is the quiet intersection where the discipline of your craft as a ${occupation} meets the boundless freedom you discover in ${hobbies}. Both remind you that great heights are climbed one deliberate hold at a time.`,
      reflection: `Your devotion to ${occupation} sharpens your focus, while ${hobbies} keeps your spirit curious and resilient.`,
      themeTag: 'Discipline & Freedom',
    },
    philosophical: {
      quote: `In every endeavor of a ${occupation}, and every rhythm found in ${hobbies}, we learn the same timeless truth: the journey is not shaped by the tools we hold, but by the presence we bring to each stroke.`,
      reflection: `When work and passion speak the same quiet language, purpose ceases to be a destination and becomes your natural state.`,
      themeTag: 'Mindful Synergy',
    },
    witty: {
      quote: `Treat your career as a ${occupation} with the same unapologetic enthusiasm you bring to ${hobbies}: solve the puzzle, enjoy the unexpected detours, and never forget to take five for the view.`,
      reflection: `The secret to lasting brilliance is carrying the pure joy of your hobby straight into your professional arena.`,
      themeTag: 'Joyful Precision',
    },
    zen: {
      quote: `Like water shaping stone, the steady hands of a ${occupation} and the patient devotion of ${hobbies} move together in silent harmony. Breathe into the craft; trust the unfolding.`,
      reflection: `True flow arrives when the tension of achievement dissolves into the effortless beauty of creation.`,
      themeTag: 'Effortless Flow',
    },
    poetic: {
      quote: `Between the meticulous architecture of a ${occupation} and the wild, open cadence of ${hobbies}, your soul writes its authentic symphony—half calculated courage, half pure wonder.`,
      reflection: `You are both the architect and the dreamer, building towers by day and dancing among the stars by night.`,
      themeTag: 'Symphony of Craft',
    },
  };

  const selected = fallbacks[tone] || fallbacks.empowering;
  return {
    quote: selected.quote,
    attribution: name ? `Generated for ${name} · ${occupation}` : `Generated for a ${occupation} & ${hobbies} enthusiast`,
    reflection: selected.reflection,
    themeTag: selected.themeTag,
    recommendedMood: 'summit',
  };
}

// API endpoint for generating personalized motivation
app.post('/api/generate-quote', async (req, res) => {
  try {
    const { name, occupation, hobbies, tone = 'empowering', themeMood } = req.body as QuoteRequest;

    if (!occupation || !hobbies) {
      res.status(400).json({ error: 'Occupation and hobbies are required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY missing, using curated intelligent fallback generator');
      const fallback = generateFallbackQuote({ name, occupation, hobbies, tone, themeMood });
      res.json(fallback);
      return;
    }

    const systemInstruction = `You are a world-class philosophical motivational writer and creative thinker.
Your specialty is inventing deeply resonant, original, evocative motivational quotes tailored to individuals by intimately weaving together their professional career (occupation) and their personal passions/hobbies.

Rules for the Quote:
1. Avoid generic clichés like "work hard play hard" or "follow your dreams".
2. Cleverly harmonize the specific metaphors, cognitive rhythms, technical craftsmanship, physical motions, or emotional states common to their occupation AND their hobbies.
3. Tone requested: ${tone} (e.g. empowering, philosophical, witty, zen, poetic).
4. The quote must feel deeply personal, uplifting, and profound—like an inscription on a bespoke artifact.
5. Provide a short reflection (1-2 sentences) elucidating the profound connection.
6. Provide an attribution line: if a user name is provided ("${name || ''}"), use "Generated for ${name || ''} · ${occupation}". If no name, use "Generated for ${occupation} & ${hobbies} enthusiast".
7. Pick a themeTag (2-3 words, e.g. "Precision & Cadence", "Architect of Flow", "Silent Elevation").
8. Choose a recommendedMood backdrop from: "summit", "studio", "cosmos", or "zen".`;

    const userPrompt = `Create a personalized motivational quote for:
Name: ${name || 'N/A'}
Occupation: ${occupation}
Hobbies / Passions: ${hobbies}
Tone: ${tone}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.STRING,
              description: 'The bespoke personalized motivational quote blending occupation and hobby.',
            },
            attribution: {
              type: Type.STRING,
              description: 'Attribution tagline, e.g., "Generated for Alex · Software Engineer" or clean label.',
            },
            reflection: {
              type: Type.STRING,
              description: 'A 1-2 sentence thoughtful reflection on how these two worlds empower each other.',
            },
            themeTag: {
              type: Type.STRING,
              description: '2 to 3 words theme concept (e.g. "Precision in Flow").',
            },
            recommendedMood: {
              type: Type.STRING,
              description: 'One of: summit, studio, cosmos, zen.',
            },
          },
          required: ['quote', 'attribution', 'reflection', 'themeTag', 'recommendedMood'],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating quote with Gemini:', error);
    // Graceful fallback to keep UI functional and positive
    const fallback = generateFallbackQuote(req.body);
    res.json(fallback);
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (prod=${isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
