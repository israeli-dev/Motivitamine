import { isRecord, isTone } from '../../shared/quote.js';
import type { BackdropId, CardCustomization, QuoteData } from '../types';

export const LIBRARY_KEY = 'aura_quotes_library';
const backdrops: BackdropId[] = ['summit', 'studio', 'cosmos', 'zen', 'obsidian', 'midnight'];

function isBackdrop(value: unknown): value is BackdropId {
  return backdrops.some((backdrop) => backdrop === value);
}

function isCustomization(value: unknown): value is CardCustomization {
  if (!isRecord(value)) return false;
  return ['1:1', '9:16', '16:9'].some((option) => option === value.aspectRatio)
    && ['garamond', 'editorial', 'sans', 'cinzel'].some((option) => option === value.fontStyle)
    && ['sm', 'md', 'lg', 'xl'].some((option) => option === value.fontSize)
    && isBackdrop(value.backdrop)
    && typeof value.scrimOpacity === 'number' && value.scrimOpacity >= 0.3 && value.scrimOpacity <= 0.88
    && ['showAttribution', 'showThemeTag', 'showBorder'].every((key) => typeof value[key] === 'boolean');
}

export function parseLibrary(raw: string | null): QuoteData[] {
  let parsed: unknown;
  try { parsed = raw === null ? [] : JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  return parsed.flatMap((item): QuoteData[] => {
    if (!isRecord(item)) return [];
    const { id, quote, attribution, reflection, themeTag, occupation, hobbies, name, tone, createdAt, mood, source, savedCustomization } = item;
    if (typeof id !== 'string' || !id || seen.has(id) || typeof quote !== 'string' || !quote.trim()
      || typeof attribution !== 'string' || typeof reflection !== 'string' || typeof themeTag !== 'string'
      || typeof occupation !== 'string' || typeof hobbies !== 'string' || !isTone(tone)
      || typeof createdAt !== 'number' || !Number.isFinite(new Date(createdAt).getTime())) return [];
    seen.add(id);
    return [{ id, quote, attribution, reflection, themeTag, occupation, hobbies, tone, createdAt,
      name: typeof name === 'string' ? name : undefined,
      mood: isBackdrop(mood) ? mood : undefined,
      source: source === 'gemini' || source === 'sample' ? source : undefined,
      savedCustomization: isCustomization(savedCustomization) ? savedCustomization : undefined,
    }];
  });
}
