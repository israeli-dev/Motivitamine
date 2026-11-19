export const TONES = ['empowering', 'philosophical', 'witty', 'zen', 'poetic'] as const;
export const MOODS = ['summit', 'studio', 'cosmos', 'zen'] as const;
export const QUOTE_LIMITS = { name: 40, occupation: 80, hobbies: 120, quote: 220, reflection: 360, themeTag: 40 } as const;

export type Tone = typeof TONES[number];
export type Mood = typeof MOODS[number];
export interface QuoteRequest {
  occupation: string;
  hobbies: string;
  tone: Tone;
  previousQuote?: string;
}
export interface GeneratedQuote {
  quote: string;
  reflection: string;
  themeTag: string;
  recommendedMood: Mood;
}
export type QuoteResponse = GeneratedQuote & { source: 'gemini' };

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isTone(value: unknown): value is Tone {
  return TONES.some((tone) => tone === value);
}

function isMood(value: unknown): value is Mood {
  return MOODS.some((mood) => mood === value);
}

function readText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  return text && text.length <= maxLength ? text : undefined;
}

export function readQuoteRequest(value: unknown): QuoteRequest | undefined {
  if (!isRecord(value)) return undefined;
  const occupation = readText(value.occupation, QUOTE_LIMITS.occupation);
  const hobbies = readText(value.hobbies, QUOTE_LIMITS.hobbies);
  const tone = value.tone === undefined ? 'empowering' : value.tone;
  const previousQuote = readText(value.previousQuote, QUOTE_LIMITS.quote);
  if (!occupation || !hobbies || !isTone(tone) || (value.previousQuote !== undefined && !previousQuote)) return undefined;
  return { occupation, hobbies, tone, ...(previousQuote && { previousQuote }) };
}

export function readGeneratedQuote(value: unknown): GeneratedQuote | undefined {
  if (!isRecord(value)) return undefined;
  const quote = readText(value.quote, QUOTE_LIMITS.quote);
  const reflection = readText(value.reflection, QUOTE_LIMITS.reflection);
  const themeTag = readText(value.themeTag, QUOTE_LIMITS.themeTag);
  if (!quote || !reflection || !themeTag || !isMood(value.recommendedMood)) return undefined;
  return { quote, reflection, themeTag, recommendedMood: value.recommendedMood };
}

export function readQuoteResponse(value: unknown): QuoteResponse | undefined {
  if (!isRecord(value) || value.source !== 'gemini') return undefined;
  const quote = readGeneratedQuote(value);
  return quote && { ...quote, source: 'gemini' };
}
