import React from 'react';
import { Sparkles, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenHistory: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenHistory,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0f17]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark as single text element */}
        <button
          onClick={onReset}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-garamond text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-amber-300">
            AuraQuote
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a
            href="#generator"
            className="hover:text-white transition-colors"
          >
            Generator
          </a>
          <a
            href="#card-preview"
            className="hover:text-white transition-colors"
          >
            Studio Canvas
          </a>
          <a
            href="#customizer"
            className="hover:text-white transition-colors"
          >
            Styling
          </a>
          <a
            href="#reflections"
            className="hover:text-white transition-colors"
          >
            Mindset Notes
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
            title="View saved quotes gallery"
          >
            <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Saved Library</span>
            {savedCount > 0 && (
              <span className="ml-1 text-[11px] tabular-nums text-amber-300 font-semibold">
                ({savedCount})
              </span>
            )}
          </button>

          <a
            href="#generator"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition-all whitespace-nowrap active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-950" />
            <span>Craft Quote</span>
          </a>
        </div>
      </div>
    </header>
  );
};
