import React from 'react';
import { QuoteData } from '../types';
import { Lightbulb, Compass, Sparkles, Feather } from 'lucide-react';

interface ReflectionsPaneProps {
  quoteData: QuoteData;
}

export const ReflectionsPane: React.FC<ReflectionsPaneProps> = ({ quoteData }) => {
  return (
    <div id="reflections" className="rounded-2xl border border-white/10 bg-[#121824]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-2">
        <Feather className="h-4 w-4" />
        <span>Philosophical Synthesis</span>
        <span aria-hidden="true">·</span>
        <span>Mindset Commentary</span>
      </div>

      <h3 className="font-garamond text-2xl font-semibold text-white tracking-tight mb-4">
        The Synergy of Your Two Worlds
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reflection narrative */}
        <div className="md:col-span-2 space-y-3">
          <p className="text-sm sm:text-base leading-relaxed text-slate-300">
            {quoteData.reflection}
          </p>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-400">
            <span className="font-semibold text-amber-300">Why this resonance matters: </span>
            A career in <span className="text-white font-medium">{quoteData.occupation}</span> demands rigorous intentionality and specialized competence. Engaging in <span className="text-white font-medium">{quoteData.hobbies}</span> provides the cognitive counterweight—an arena of creative discovery where play, flow, and intuition rejuvenate your professional resilience.
          </div>
        </div>

        {/* Breakdown highlights */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Guiding Principle
            </div>
            <div className="font-garamond text-xl font-bold text-amber-300">
              {quoteData.themeTag}
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="text-[11px] text-slate-400">Dual Spectrum</div>
            <div className="text-xs font-medium text-slate-200 mt-0.5">
              {quoteData.occupation} × {quoteData.hobbies}
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="text-[11px] text-slate-400">Created For</div>
            <div className="text-xs font-medium text-slate-200 mt-0.5">
              {quoteData.name ? `${quoteData.name} (${quoteData.occupation})` : quoteData.occupation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
