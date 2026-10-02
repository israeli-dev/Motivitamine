/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Header } from './components/Header';
import { QuoteForm } from './components/QuoteForm';
import { QuoteCard } from './components/QuoteCard';
import { CardCustomizer } from './components/CardCustomizer';
import { ReflectionsPane } from './components/ReflectionsPane';
import { QuoteHistory } from './components/QuoteHistory';
import { QuoteData, CardCustomization, BackdropId } from './types';
import { Sparkles, Layers, Quote, ArrowDown } from 'lucide-react';

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
  createdAt: Date.now(),
  mood: 'summit',
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
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [savedQuotes, setSavedQuotes] = useState<QuoteData[]>([]);

  const cardRef = useRef<HTMLDivElement>(null);

  // Load saved quotes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aura_quotes_library');
      if (stored) {
        setSavedQuotes(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Check if current quote is saved
  useEffect(() => {
    const found = savedQuotes.some(
      (q) => q.quote === currentQuote.quote && q.occupation === currentQuote.occupation
    );
    setIsSaved(found);
  }, [currentQuote, savedQuotes]);

  // Handle Generating Quote via server API
  const handleGenerate = async (formData: {
    name: string;
    occupation: string;
    hobbies: string;
    tone: 'empowering' | 'philosophical' | 'zen' | 'poetic' | 'witty';
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const newQuote: QuoteData = {
        id: `quote-${Date.now()}`,
        quote: data.quote,
        attribution: data.attribution,
        reflection: data.reflection,
        themeTag: data.themeTag,
        occupation: formData.occupation,
        hobbies: formData.hobbies,
        name: formData.name,
        tone: formData.tone,
        createdAt: Date.now(),
        mood: data.recommendedMood,
      };

      setCurrentQuote(newQuote);

      // Auto-adapt backdrop if recommended
      if (
        data.recommendedMood &&
        ['summit', 'studio', 'cosmos', 'zen'].includes(data.recommendedMood)
      ) {
        setCustomization((prev) => ({
          ...prev,
          backdrop: data.recommendedMood as BackdropId,
        }));
      }

      // Smooth scroll to card preview on small devices
      if (window.innerWidth < 1024) {
        const previewEl = document.getElementById('card-preview');
        if (previewEl) {
          previewEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error('Failed to generate quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // High-Resolution PNG Download
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      // 2.5x pixel ratio guarantees crystal sharp output for retina & print
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        quality: 0.98,
      });

      const sanitizedTag = (currentQuote.themeTag || 'AuraQuote')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      const filename = `AuraQuote-${sanitizedTag}-${Date.now()}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG Export failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Print or PDF export
  const handlePrintPdf = () => {
    window.print();
  };

  // Copy Quote Text
  const handleCopyQuote = async () => {
    try {
      const fullText = `"${currentQuote.quote}"\n\n— ${currentQuote.attribution}\n(${currentQuote.themeTag})`;
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2400);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // Save / Toggle Favorite in Library
  const handleSaveFavorite = () => {
    try {
      let updated: QuoteData[];
      if (isSaved) {
        updated = savedQuotes.filter((q) => q.quote !== currentQuote.quote);
      } else {
        updated = [currentQuote, ...savedQuotes];
      }
      setSavedQuotes(updated);
      localStorage.setItem('aura_quotes_library', JSON.stringify(updated));
    } catch (err) {
      console.error('Save to localStorage failed', err);
    }
  };

  // Delete quote from library
  const handleDeleteFromLibrary = (id: string) => {
    try {
      const updated = savedQuotes.filter((q) => q.id !== id);
      setSavedQuotes(updated);
      localStorage.setItem('aura_quotes_library', JSON.stringify(updated));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans-modern">
      {/* 3-Zone Header Contract */}
      <Header
        savedCount={savedQuotes.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={() => {
          setCurrentQuote(INITIAL_QUOTE);
          setCustomization(DEFAULT_CUSTOMIZATION);
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
                  Ready for 2.5× High-Res Export
                </div>
              </div>

              {/* The Rendered Card */}
              <QuoteCard
                quoteData={currentQuote}
                customization={customization}
                cardRef={cardRef}
              />
            </div>

            {/* Visual Card Customizer Controls */}
            <CardCustomizer
              customization={customization}
              onChange={(updated) =>
                setCustomization((prev) => ({ ...prev, ...updated }))
              }
              onDownloadPng={handleDownloadPng}
              onPrintPdf={handlePrintPdf}
              onCopyQuote={handleCopyQuote}
              onSaveFavorite={handleSaveFavorite}
              isDownloading={isDownloading}
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
        onSelectQuote={(q) => setCurrentQuote(q)}
        onDeleteQuote={handleDeleteFromLibrary}
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
  );
}
