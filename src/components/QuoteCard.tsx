import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';
import type { QuoteData, CardCustomization } from '../types';
import { BACKDROP_OPTIONS } from '../data/backdrops';
import { Compass, Sparkles } from 'lucide-react';

interface QuoteCardProps {
  quoteData: QuoteData;
  customization: CardCustomization;
  cardRef?: RefObject<HTMLDivElement | null>;
  exportLayout?: boolean;
}

export const CARD_FORMATS = {
  '1:1': { className: 'card-square', width: 600, height: 600 },
  '9:16': { className: 'card-story', width: 540, height: 960 },
  '16:9': { className: 'card-banner', width: 800, height: 450 },
} as const;

export function QuoteCard({ quoteData, customization, cardRef, exportLayout }: QuoteCardProps) {
  const area = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const format = CARD_FORMATS[customization.aspectRatio];
  const backdrop = BACKDROP_OPTIONS.find((option) => option.id === customization.backdrop) ?? BACKDROP_OPTIONS[0];
  const fontClass = { garamond: 'font-garamond', editorial: 'font-editorial', sans: 'font-sans-modern', cinzel: 'font-cinzel tracking-wide' }[customization.fontStyle];
  const size = { sm: 4.1, md: 5.1, lg: 6, xl: 7 }[customization.fontSize];

  useLayoutEffect(() => {
    const box = area.current;
    const text = content.current;
    if (!box || !text) return;
    const fit = () => {
      if (!box.clientHeight) return;
      // Fit the actual glyphs and attribution, not a character-count estimate.
      let scale = 1;
      box.style.setProperty('--content-scale', '1');
      while (text.offsetHeight > box.clientHeight && scale > 0.25) {
        scale *= 0.85;
        box.style.setProperty('--content-scale', String(scale));
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    document.fonts.addEventListener('loadingdone', fit);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', fit);
    };
  }, [quoteData, customization]);

  return (
    <div className={`card-shell ${format.className} ${exportLayout ? 'card-shell-export' : 'card-shell-preview'}`} style={{ '--export-width': `${format.width}px` } as CSSProperties}>
      <div
        ref={cardRef}
        className={`quote-card relative isolate overflow-hidden flex flex-col justify-between text-white ${customization.showBorder ? 'ring-1 ring-inset ring-amber-400/40' : ''}`}
        style={{ background: backdrop.gradient || '#0c1017', '--quote-size': `${size}cqw` } as CSSProperties}
      >
        {backdrop.imageUrl && (
          <img key={backdrop.id} src={backdrop.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-center -z-20" onError={(event) => { event.currentTarget.hidden = true; }} />
        )}
        <div className="absolute inset-0 -z-10" style={{ backgroundColor: `rgba(9, 13, 22, ${customization.scrimOpacity})`, backgroundImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2), rgba(0,0,0,0.7))' }} />

        <div className="card-edge flex shrink-0 items-center justify-between gap-2 uppercase tracking-wider">
          {customization.showThemeTag ? <span className="flex min-w-0 items-center gap-1 text-amber-300"><Sparkles aria-hidden="true" className="card-icon shrink-0" /><span className="break-anywhere">{quoteData.themeTag}</span></span> : <span />}
          <span className="text-white/80 shrink-0">AuraQuote · Est. 2026</span>
        </div>

        <div ref={area} className="card-content flex flex-1 min-h-0 flex-col text-center">
          <div ref={content} className="my-auto shrink-0">
            <div aria-hidden="true" className="card-glyph font-editorial text-amber-400/80 select-none">“</div>
            <blockquote className={`card-quote font-semibold text-balance ${fontClass}`}>{quoteData.quote}</blockquote>
            <div aria-hidden="true" className="card-divider mx-auto bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            {customization.showAttribution && <p className="card-attribution text-amber-200">{quoteData.attribution}</p>}
          </div>
        </div>

        <div className="card-edge flex shrink-0 items-center justify-between gap-2 text-white/80">
          <span className="flex items-center gap-1"><Compass aria-hidden="true" className="card-icon shrink-0 text-amber-400" />Mindset Inscription</span>
          <span className="shrink-0">{new Date(quoteData.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
