import { useEffect, useRef } from 'react';
import type { QuoteData } from '../types';
import { X, Trash2, BookmarkCheck } from 'lucide-react';

interface QuoteHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuotes: QuoteData[];
  onSelectQuote: (quote: QuoteData) => void;
  onDeleteQuote: (id: string) => void;
  error: string;
}

export function QuoteHistory({ isOpen, onClose, savedQuotes, onSelectQuote, onDeleteQuote, error }: QuoteHistoryProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element || !isOpen) return;
    const trigger = document.activeElement;
    element.showModal();
    closeButton.current?.focus();
    return () => {
      element.close();
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [isOpen]);

  return (
    <dialog ref={dialog} aria-labelledby="library-title" onCancel={(event) => { event.preventDefault(); onClose(); }} className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-white/10 bg-[#121824] p-6 text-slate-100 shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm">
      <div className="flex max-h-[75vh] flex-col">
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-white/10 pb-4">
          <h3 id="library-title" className="flex items-center gap-2 font-garamond text-2xl font-semibold"><BookmarkCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-400" /> Saved Inscriptions Library <span className="text-xs text-slate-400">({savedQuotes.length})</span></h3>
          <button type="button" ref={closeButton} onClick={onClose} aria-label="Close library" className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><X aria-hidden="true" className="h-5 w-5" /></button>
        </div>
        {error && <p role="alert" className="mb-3 text-sm text-red-200">{error}</p>}
        <ul className="flex-1 space-y-3 overflow-y-auto p-1">
          {savedQuotes.length === 0 && <li className="py-10 text-center text-sm text-slate-400">No saved quotes yet. Use “Save to Library” to keep a card.</li>}
          {savedQuotes.map((quote) => (
            <li key={quote.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <button type="button" onClick={() => { onSelectQuote(quote); onClose(); }} className="min-w-0 flex-1 break-anywhere rounded text-left hover:text-amber-100">
                <span className="block text-xs font-medium text-amber-400">{quote.themeTag} · {quote.occupation}</span>
                <span className="mt-1 line-clamp-3 block font-editorial text-lg italic">“{quote.quote}”</span>
                <span className="mt-2 block text-[11px] text-slate-400">{quote.attribution}</span>
              </button>
              <button type="button" aria-label={`Remove ${quote.themeTag} from library`} onClick={() => { onDeleteQuote(quote.id); closeButton.current?.focus(); }} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
