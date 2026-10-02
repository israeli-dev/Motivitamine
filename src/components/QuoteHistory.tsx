import React from 'react';
import { QuoteData } from '../types';
import { X, Trash2, ArrowUpRight, BookmarkCheck, Calendar, Briefcase } from 'lucide-react';

interface QuoteHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuotes: QuoteData[];
  onSelectQuote: (quote: QuoteData) => void;
  onDeleteQuote: (id: string) => void;
}

export const QuoteHistory: React.FC<QuoteHistoryProps> = ({
  isOpen,
  onClose,
  savedQuotes,
  onSelectQuote,
  onDeleteQuote,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#121824] p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2 text-white">
            <BookmarkCheck className="h-5 w-5 text-amber-400" />
            <h3 className="font-garamond text-2xl font-semibold">
              Saved Inscriptions Library
            </h3>
            <span className="text-xs text-slate-400 tabular-nums">
              ({savedQuotes.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedQuotes.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BookmarkCheck className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-medium">No saved quotes yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Click &ldquo;Save to Library&rdquo; after generating a quote to keep it here.
              </p>
            </div>
          ) : (
            savedQuotes.map((q) => (
              <div
                key={q.id}
                className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-amber-400/40 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    onClick={() => {
                      onSelectQuote(q);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium mb-1">
                      <span>{q.themeTag}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">{q.occupation}</span>
                    </div>

                    <blockquote className="font-editorial text-base sm:text-lg text-slate-100 italic line-clamp-3">
                      &ldquo;{q.quote}&rdquo;
                    </blockquote>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{q.attribution}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {new Date(q.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        onSelectQuote(q);
                        onClose();
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-amber-400/10 hover:text-amber-300 transition-colors"
                      title="Load quote on canvas"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteQuote(q.id)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Remove from library"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
