/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { toPng } from 'html-to-image';
import { Header } from './components/Header';
import { QuoteForm } from './components/QuoteForm';
import { CARD_FORMATS, QuoteCard } from './components/QuoteCard';
import { CardCustomizer } from './components/CardCustomizer';
import { ReflectionsPane } from './components/ReflectionsPane';
import { QuoteHistory } from './components/QuoteHistory';
import type { QuoteData, CardCustomization } from './types';
import { isRecord, readQuoteResponse, type QuoteRequest } from '../shared/quote.js';
import { LIBRARY_KEY, parseLibrary } from './data/library';
import { Sparkles, Layers } from 'lucide-react';

const INITIAL_QUOTE: QuoteData = {
  id: 'inaugural-01',
  quote:
    'Every summit begins in the quiet architecture of the mind: you do not conquer the wall by rushing the crux, but by trusting each deliberate hold you spent hours learning to read.',
  attribution: 'Generated for Elena · Software Architect & Rock Climber',
  reflection:
    'In software engineering, as in technical bouldering, breakthrough is never brute force. It is the discipline to read the complex structure before making your move, anchoring yourself in deliberate decisions while remaining fully adaptable to the rock ahead.',
  themeTag: 'Discipline & Elevation',
  occupation: 'Software Architect',
  hobbies: 'Rock Climbing & Bouldering',
  name: 'Elena',
  tone: 'empowering',
  createdAt: Date.UTC(2026, 0, 1, 12),
  mood: 'summit',
  source: 'sample',
};

const DEFAULT_CUSTOMIZATION: CardCustomization = {
  aspectRatio: '1:1',
  fontStyle: 'garamond',
  backdrop: 'summit',
  scrimOpacity: 0.62,
  showAttribution: true,
  showThemeTag: true,
  showBorder: true,
  fontSize: 'md',
};

export default function App() {
  const [currentQuote, setCurrentQuote] = useState<QuoteData>(INITIAL_QUOTE);
  const [customization, setCustomization] = useState<CardCustomization>(DEFAULT_CUSTOMIZATION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exportSnapshot, setExportSnapshot] = useState<{ quote: QuoteData; styling: CardCustomization } | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<QuoteData[]>(() => {
    try { return parseLibrary(localStorage.getItem(LIBRARY_KEY)); } catch { return []; }
  });
  const [generationError, setGenerationError] = useState('');
  const [generationConfigured, setGenerationConfigured] = useState<boolean>();
  const [actionError, setActionError] = useState('');
  const [libraryError, setLibraryError] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const currentRequest = useRef<AbortController | null>(null);
  const copyTimer = useRef<number | undefined>(undefined);
  const exportLock = useRef(false);
  const isSaved = savedQuotes.some((quote) => quote.id === currentQuote.id);

  useEffect(() => () => {
    currentRequest.current?.abort();
    window.clearTimeout(copyTimer.current);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/health', { signal: controller.signal })
      .then(async (response) => response.ok ? await response.json() as unknown : undefined)
      .then((data) => {
        if (!controller.signal.aborted && isRecord(data) && typeof data.generationConfigured === 'boolean') {
          setGenerationConfigured(data.generationConfigured);
        }
      }).catch(() => { /* A failed health check does not block generation. */ });
    return () => controller.abort();
  }, []);

  function showQuote(quote: QuoteData, styling?: CardCustomization) {
    setCurrentQuote(quote);
    setActionError('');
    setIsCopied(false);
    window.clearTimeout(copyTimer.current);
    if (styling) setCustomization(styling);
    else if (quote.mood) setCustomization((previous) => ({ ...previous, backdrop: quote.mood ?? previous.backdrop }));
  }

  function cancelGeneration() {
    currentRequest.current?.abort();
    currentRequest.current = null;
    setIsLoading(false);
    setGenerationError('');
  }

  async function handleGenerate({ name, ...inputs }: QuoteRequest & { name: string }) {
    if (currentRequest.current) return;
    const controller = new AbortController();
    currentRequest.current = controller;
    setGenerationError('');
    setIsLoading(true);
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const previousQuote = currentQuote.source === 'gemini'
        && inputs.occupation === currentQuote.occupation && inputs.hobbies === currentQuote.hobbies
        && inputs.tone === currentQuote.tone ? currentQuote.quote : undefined;
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, previousQuote }),
        signal: controller.signal,
      });
      const data: unknown = await response.json().catch(() => undefined);
      if (currentRequest.current !== controller) return;
      if (!response.ok) {
        setGenerationError(isRecord(data) && typeof data.error === 'string' ? data.error : 'Couldn’t generate a quote. Please try again.');
        return;
      }
      const generated = readQuoteResponse(data);
      if (!generated) {
        setGenerationError('The studio received an incomplete quote. Please try again.');
        return;
      }
      const { recommendedMood, ...content } = generated;
      showQuote({
        ...content, ...inputs, name, mood: recommendedMood,
        id: globalThis.crypto?.randomUUID?.() ?? `quote-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: Date.now(),
        attribution: name ? `For ${name} · ${inputs.occupation}` : `${inputs.occupation} · ${inputs.hobbies}`,
      });
      if (window.innerWidth < 1024) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        requestAnimationFrame(() => document.getElementById('card-preview')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' }));
      }
    } catch {
      if (currentRequest.current === controller) setGenerationError(controller.signal.aborted
        ? 'Generation took too long. Please try again.' : 'Couldn’t reach the studio. Check your connection and try again.');
    } finally {
      window.clearTimeout(timeout);
      if (currentRequest.current === controller) {
        currentRequest.current = null;
        setIsLoading(false);
      }
    }
  }

  async function exportCard(mode: 'png' | 'print') {
    if (!cardRef.current || exportLock.current) return;
    const card = cardRef.current;
    const quote = currentQuote;
    const format = CARD_FORMATS[customization.aspectRatio];
    exportLock.current = true;
    flushSync(() => setExportSnapshot({ quote, styling: customization }));
    setActionError('');
    try {
      await document.fonts.ready;
      await Promise.all(Array.from(card.querySelectorAll('img'), (image) => image.decode().catch(() => undefined)));
      if (mode === 'print') {
        window.print();
        return;
      }
      const dataUrl = await toPng(card, { width: format.width, height: format.height, pixelRatio: 2, preferredFontFormat: 'woff2' });
      const tag = quote.themeTag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'quote';
      const link = document.createElement('a');
      link.download = `AuraQuote-${tag}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setActionError('Couldn’t export this card. Please try again.');
    } finally {
      exportLock.current = false;
      setExportSnapshot(null);
    }
  }

  async function handleCopyQuote() {
    setActionError('');
    try {
      await navigator.clipboard.writeText(`“${currentQuote.quote}”\n\n— ${currentQuote.attribution}\n(${currentQuote.themeTag})`);
      setIsCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setIsCopied(false), 2400);
    } catch {
      setActionError('Couldn’t copy the quote. You can still select and copy the text manually.');
    }
  }

  function updateLibrary(updated: QuoteData[], fromDialog = false) {
    const setError = fromDialog ? setLibraryError : setActionError;
    setError('');
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
      setSavedQuotes(updated);
    } catch {
      setError('Couldn’t update the library. Browser storage may be full or blocked.');
    }
  }

  function handleSaveFavorite() {
    updateLibrary(isSaved ? savedQuotes.filter((quote) => quote.id !== currentQuote.id)
      : [{ ...currentQuote, savedCustomization: customization }, ...savedQuotes]);
  }

  return (
    <>
      <div className="studio-ui min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans-modern">
        {/* 3-Zone Header Contract */}
        <Header
          savedCount={savedQuotes.length}
          onOpenHistory={() => { setLibraryError(''); setIsHistoryOpen(true); }}
          onReset={() => {
            cancelGeneration();
            showQuote(INITIAL_QUOTE, DEFAULT_CUSTOMIZATION);
          }}
        />

        {/* Main Studio Viewport */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
          {/* Hero Section */}
          <section className="text-center max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Personalized Motivation Studio</span>
              <span aria-hidden="true">·</span>
              <span>Gemini AI Synthesis</span>
            </div>
            <h1 className="font-garamond text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight text-balance">
              Where Your Profession Meets Your Passion
            </h1>
            <p className="text-base sm:text-lg text-slate-400 text-balance leading-relaxed">
              Every profession has its quiet discipline; every hobby reveals a boundless joy.
              Generate evocative, tailor-made motivational cards that harmonize both worlds into a singular guiding quote.
            </p>
          </section>

          {/* Studio Layout: 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Reflections (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <QuoteForm
                isLoading={isLoading}
                onGenerate={handleGenerate}
                generationError={generationError}
                generationConfigured={generationConfigured}
              />

              {/* Mindset Reflections Section */}
              <ReflectionsPane quoteData={currentQuote} />
            </div>

            {/* Right Column: Card Preview & Customization (7 cols) */}
            <div id="card-preview" className="lg:col-span-7 space-y-8">
              {/* Visual Card Display Stage */}
              <div className="rounded-2xl border border-white/10 bg-[#121824]/90 p-4 sm:p-8 backdrop-blur-sm shadow-xl flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                    <Layers className="h-4 w-4" />
                    <span>Card Canvas Preview</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentQuote.source === 'sample' ? 'Sample card' : currentQuote.source === 'gemini' ? 'Written by Gemini' : 'Saved inscription'}
                  </div>
                </div>

                {/* The Rendered Card */}
                <div className="sr-only" role="status">{currentQuote.source === 'gemini' ? `Quote ready: ${currentQuote.quote}` : ''}</div>
                <QuoteCard quoteData={currentQuote} customization={customization} />
              </div>

              {/* Visual Card Customizer Controls */}
              <CardCustomizer
                customization={customization}
                onChange={(updated) =>
                  setCustomization((prev) => ({ ...prev, ...updated }))
                }
                onDownloadPng={() => void exportCard('png')}
                onPrintPdf={() => void exportCard('print')}
                actionError={actionError}
                onCopyQuote={handleCopyQuote}
                onSaveFavorite={handleSaveFavorite}
                isDownloading={exportSnapshot !== null}
                isCopied={isCopied}
                isSaved={isSaved}
              />
            </div>
          </div>
        </main>

        {/* Library Drawer/Modal */}
        <QuoteHistory
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          savedQuotes={savedQuotes}
          onSelectQuote={(quote) => { cancelGeneration(); showQuote(quote, quote.savedCustomization); }}
          onDeleteQuote={(id) => updateLibrary(savedQuotes.filter((quote) => quote.id !== id), true)}
          error={libraryError}
        />

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#070a10] py-8 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-garamond text-base text-slate-300">
              AuraQuote Studio
            </div>
            <div>
              Crafted with thoughtful typography, responsive contrast overlays, and Gemini intelligence.
            </div>
            <div className="tabular-nums">
              © 2026 · Personal Motivation Engine
            </div>
          </div>
        </footer>
      </div>
      <div className="export-surface" aria-hidden="true">
        <QuoteCard quoteData={exportSnapshot?.quote ?? currentQuote} customization={exportSnapshot?.styling ?? customization} cardRef={cardRef} exportLayout />
      </div>
    </>
  );
}
