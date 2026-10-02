import React from 'react';
import { QuoteData, CardCustomization } from '../types';
import { BACKDROP_OPTIONS } from '../data/backdrops';
import { Compass, Sparkles } from 'lucide-react';

interface QuoteCardProps {
  quoteData: QuoteData;
  customization: CardCustomization;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quoteData,
  customization,
  cardRef,
}) => {
  const currentBackdrop =
    BACKDROP_OPTIONS.find((b) => b.id === customization.backdrop) ||
    BACKDROP_OPTIONS[0];

  // Font family mapping
  const fontClass = {
    garamond: 'font-garamond',
    editorial: 'font-editorial',
    sans: 'font-sans-modern',
    cinzel: 'font-cinzel tracking-wider',
  }[customization.fontStyle];

  // Aspect ratio mapping
  const aspectClass = {
    '1:1': 'aspect-square max-w-[620px]',
    '9:16': 'aspect-[9/16] max-w-[420px]',
    '16:9': 'aspect-[16/9] max-w-[760px]',
  }[customization.aspectRatio];

  // Font size scaling depending on aspect ratio and user selection
  const quoteSizeClass = {
    sm: 'text-lg sm:text-xl md:text-2xl',
    md: 'text-xl sm:text-2xl md:text-3xl leading-snug',
    lg: 'text-2xl sm:text-3xl md:text-4xl leading-tight',
    xl: 'text-3xl sm:text-4xl md:text-5xl leading-tight',
  }[customization.fontSize];

  return (
    <div className="flex w-full justify-center">
      {/* Target export card container */}
      <div
        ref={cardRef}
        className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 flex flex-col justify-between ${
          customization.showBorder
            ? 'border border-amber-400/30 ring-1 ring-amber-400/20'
            : 'border border-white/10'
        }`}
        style={{
          backgroundColor: '#0c1017',
          background: currentBackdrop.gradient || undefined,
        }}
      >
        {/* Background Image if available */}
        {currentBackdrop.imageUrl && (
          <img
            src={currentBackdrop.imageUrl}
            alt={currentBackdrop.name}
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover object-center select-none"
            onError={(e) => {
              // Graceful fallback to rich dark gradient
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* Ambient Dark Overlay Scrim for Guaranteed WCAG Legibility */}
        <div
          className="absolute inset-0 transition-opacity duration-200 pointer-events-none"
          style={{
            backgroundColor: `rgba(9, 13, 22, ${customization.scrimOpacity})`,
            backgroundImage:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
          }}
        />

        {/* Elegant Card Header Area */}
        <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
          {customization.showThemeTag ? (
            <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-amber-300/90 [text-shadow:_0_1px_8px_rgba(0,0,0,0.9)]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{quoteData.themeTag || 'Synchronized Purpose'}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase text-white/50 [text-shadow:_0_1px_6px_rgba(0,0,0,0.9)]">
            <span>AuraQuote</span>
            <span aria-hidden="true">·</span>
            <span>Est. 2026</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 px-6 sm:px-10 py-4 my-auto flex flex-col justify-center text-center">
          {/* Subtle Decorative Quotation Glyph */}
          <div className="mx-auto mb-2 text-amber-400/60 font-editorial text-4xl sm:text-5xl select-none leading-none [text-shadow:_0_2px_12px_rgba(0,0,0,0.8)]">
            “
          </div>

          {/* Quote Body with high contrast & balance */}
          <blockquote
            className={`font-semibold text-white tracking-tight ${fontClass} ${quoteSizeClass} [text-shadow:_0_2px_18px_rgba(0,0,0,0.95),_0_1px_4px_rgba(0,0,0,0.9)] text-balance mx-auto max-w-2xl`}
          >
            {quoteData.quote}
          </blockquote>

          {/* Decorative Divider */}
          <div className="mx-auto my-4 h-[1px] w-16 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          {/* Attribution Tagline */}
          {customization.showAttribution && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs sm:text-sm font-medium tracking-wide text-amber-200/90 [text-shadow:_0_1px_8px_rgba(0,0,0,0.95)]">
                {quoteData.attribution}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300/80 [text-shadow:_0_1px_6px_rgba(0,0,0,0.9)]">
                <span>{quoteData.occupation}</span>
                <span aria-hidden="true">·</span>
                <span>{quoteData.hobbies}</span>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Brand & Date */}
        <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between text-[11px] text-white/40 [text-shadow:_0_1px_6px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-1.5">
            <Compass className="h-3 w-3 text-amber-400/70" />
            <span>Harmonic Mindset Inscription</span>
          </div>
          <div>
            {new Date(quoteData.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
