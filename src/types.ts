import type { Tone } from '../shared/quote.js';

export interface QuoteData {
  id: string;
  quote: string;
  attribution: string;
  reflection: string;
  themeTag: string;
  occupation: string;
  hobbies: string;
  name?: string;
  tone: Tone;
  createdAt: number;
  mood?: BackdropId;
  source?: 'gemini' | 'sample';
  savedCustomization?: CardCustomization;
}

export type AspectRatioType = '1:1' | '9:16' | '16:9';
export type FontStyleType = 'garamond' | 'editorial' | 'sans' | 'cinzel';
export type BackdropId = 'summit' | 'studio' | 'cosmos' | 'zen' | 'obsidian' | 'midnight';

export interface CardCustomization {
  aspectRatio: AspectRatioType;
  fontStyle: FontStyleType;
  backdrop: BackdropId;
  scrimOpacity: number;
  showAttribution: boolean;
  showThemeTag: boolean;
  showBorder: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
}
