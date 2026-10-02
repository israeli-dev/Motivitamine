import React from 'react';
import { CardCustomization, AspectRatioType, FontStyleType, BackdropId } from '../types';
import { BACKDROP_OPTIONS } from '../data/backdrops';
import {
  Download,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Maximize2,
  Type,
  Sliders,
  Sparkles,
  Printer,
} from 'lucide-react';

interface CardCustomizerProps {
  customization: CardCustomization;
  onChange: (updated: Partial<CardCustomization>) => void;
  onDownloadPng: () => void;
  onPrintPdf: () => void;
  onCopyQuote: () => void;
  onSaveFavorite: () => void;
  isDownloading: boolean;
  isCopied: boolean;
  isSaved: boolean;
}

export const CardCustomizer: React.FC<CardCustomizerProps> = ({
  customization,
  onChange,
  onDownloadPng,
  onPrintPdf,
  onCopyQuote,
  onSaveFavorite,
  isDownloading,
  isCopied,
  isSaved,
}) => {
  const aspectRatios: Array<{ id: AspectRatioType; label: string; iconLabel: string }> = [
    { id: '1:1', label: 'Square (1:1)', iconLabel: '1:1 Post' },
    { id: '9:16', label: 'Story (9:16)', iconLabel: '9:16 Wallpaper' },
    { id: '16:9', label: 'Banner (16:9)', iconLabel: '16:9 Desktop' },
  ];

  const fontOptions: Array<{ id: FontStyleType; label: string; preview: string }> = [
    { id: 'garamond', label: 'Cormorant Garamond', preview: 'Editorial Serif' },
    { id: 'editorial', label: 'Instrument Serif', preview: 'Avant-Garde' },
    { id: 'sans', label: 'Jakarta Modern', preview: 'Clean Sans' },
    { id: 'cinzel', label: 'Cinzel Roman', preview: 'Monumental' },
  ];

  const fontSizes: Array<{ id: CardCustomization['fontSize']; label: string }> = [
    { id: 'sm', label: 'Small' },
    { id: 'md', label: 'Balanced' },
    { id: 'lg', label: 'Large' },
    { id: 'xl', label: 'Heroic' },
  ];

  return (
    <div id="customizer" className="space-y-6 rounded-2xl border border-white/10 bg-[#121824]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
      {/* Action Buttons Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-garamond text-xl font-semibold text-white">
            Export & Actions
          </h3>
          <span className="text-xs text-slate-400">High-Resolution Studio</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Download PNG */}
          <button
            type="button"
            onClick={onDownloadPng}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-60 transition-all shadow-md shadow-amber-500/20"
          >
            {isDownloading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Rendering...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-slate-950" />
                <span>Download PNG</span>
              </>
            )}
          </button>

          {/* Copy Text */}
          <button
            type="button"
            onClick={onCopyQuote}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.1] hover:text-white active:scale-95 transition-all"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Quote</span>
              </>
            )}
          </button>

          {/* Save to Favorites */}
          <button
            type="button"
            onClick={onSaveFavorite}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.1] hover:text-white active:scale-95 transition-all"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-300">Saved in Library</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                <span>Save to Library</span>
              </>
            )}
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={onPrintPdf}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.1] hover:text-white active:scale-95 transition-all"
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-white/10" />

      {/* Backdrop Theme Gallery */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Backdrop Atmosphere
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {BACKDROP_OPTIONS.map((bg) => {
            const isSelected = customization.backdrop === bg.id;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => onChange({ backdrop: bg.id })}
                className={`group relative h-20 rounded-xl overflow-hidden border text-left transition-all ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]'
                    : 'border-white/15 hover:border-white/40 opacity-80 hover:opacity-100'
                }`}
              >
                {bg.imageUrl ? (
                  <img
                    src={bg.imageUrl}
                    alt={bg.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div
                    className="absolute inset-0 h-full w-full"
                    style={{ background: bg.gradient }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2">
                  <p className="text-[11px] font-semibold text-white truncate">
                    {bg.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio & Typography Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Aspect Ratio */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Card Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {aspectRatios.map((ar) => (
              <button
                key={ar.id}
                type="button"
                onClick={() => onChange({ aspectRatio: ar.id })}
                className={`rounded-xl border px-3 py-2 text-center text-xs font-medium transition-all ${
                  customization.aspectRatio === ar.id
                    ? 'border-amber-400 bg-amber-400/15 text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                {ar.iconLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Typography Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fontOptions.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => onChange({ fontStyle: font.id })}
                className={`rounded-xl border px-3 py-2 text-left transition-all ${
                  customization.fontStyle === font.id
                    ? 'border-amber-400 bg-amber-400/15 text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                <div className="text-xs font-semibold truncate">{font.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{font.preview}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Font Size & Overlay Scrim */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        {/* Font Size */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Text Scale
          </label>
          <div className="grid grid-cols-4 gap-2">
            {fontSizes.map((fs) => (
              <button
                key={fs.id}
                type="button"
                onClick={() => onChange({ fontSize: fs.id })}
                className={`rounded-xl border px-2 py-1.5 text-center text-xs font-medium transition-all ${
                  customization.fontSize === fs.id
                    ? 'border-amber-400 bg-amber-400/15 text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                {fs.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contrast Scrim Opacity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Legibility Scrim
            </label>
            <span className="text-xs text-amber-300 font-mono">
              {Math.round(customization.scrimOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.3}
            max={0.88}
            step={0.02}
            value={customization.scrimOpacity}
            onChange={(e) => onChange({ scrimOpacity: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Translucent (30%)</span>
            <span>Balanced (60%)</span>
            <span>Ultra-Deep (88%)</span>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={customization.showAttribution}
            onChange={(e) => onChange({ showAttribution: e.target.checked })}
            className="accent-amber-400 rounded h-4 w-4"
          />
          <span>Show Attribution & Role</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={customization.showThemeTag}
            onChange={(e) => onChange({ showThemeTag: e.target.checked })}
            className="accent-amber-400 rounded h-4 w-4"
          />
          <span>Show Theme Capsule</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={customization.showBorder}
            onChange={(e) => onChange({ showBorder: e.target.checked })}
            className="accent-amber-400 rounded h-4 w-4"
          />
          <span>Gold Framing Inlay</span>
        </label>
      </div>
    </div>
  );
};
