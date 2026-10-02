import React, { useState } from 'react';
import { Sparkles, Compass, Lightbulb, User, Briefcase, HeartHandshake } from 'lucide-react';
import { INSPIRATIONAL_PRESETS, PresetPairing } from '../data/presets';

interface QuoteFormProps {
  isLoading: boolean;
  onGenerate: (data: {
    name: string;
    occupation: string;
    hobbies: string;
    tone: 'empowering' | 'philosophical' | 'zen' | 'poetic' | 'witty';
  }) => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  isLoading,
  onGenerate,
}) => {
  const [name, setName] = useState('Alex');
  const [occupation, setOccupation] = useState('Software Architect');
  const [hobbies, setHobbies] = useState('Rock Climbing & Mountain Bouldering');
  const [tone, setTone] = useState<'empowering' | 'philosophical' | 'zen' | 'poetic' | 'witty'>('empowering');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occupation.trim()) {
      setError('Please provide your occupation or career field.');
      return;
    }
    if (!hobbies.trim()) {
      setError('Please provide at least one hobby or creative passion.');
      return;
    }
    setError(null);
    onGenerate({
      name: name.trim(),
      occupation: occupation.trim(),
      hobbies: hobbies.trim(),
      tone,
    });
  };

  const handleApplyPreset = (preset: PresetPairing) => {
    setName(preset.name);
    setOccupation(preset.occupation);
    setHobbies(preset.hobbies);
    setTone(preset.tone);
    setError(null);
  };

  const toneOptions: Array<{ id: typeof tone; label: string; desc: string }> = [
    { id: 'empowering', label: 'Empowering', desc: 'Driven, courageous, and bold' },
    { id: 'philosophical', label: 'Philosophical', desc: 'Deep, reflective, and timeless' },
    { id: 'zen', label: 'Zen & Flow', desc: 'Serene, mindful, and centered' },
    { id: 'poetic', label: 'Poetic', desc: 'Lyrical, metaphorical, and evocative' },
    { id: 'witty', label: 'Witty', desc: 'Sharp, spirited, and playful' },
  ];

  return (
    <div id="generator" className="rounded-2xl border border-white/10 bg-[#121824]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
      {/* Editorial Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
          <Compass className="h-4 w-4" />
          <span>Bespoke Synthesis</span>
          <span aria-hidden="true">·</span>
          <span>Occupation × Hobby</span>
        </div>
        <h2 className="mt-1 font-garamond text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Harmonize Your Craft & Passion
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter what you do by trade and what sets your spirit free. Gemini weaves their shared discipline into a singular quote.
        </p>
      </div>

      {/* Preset Quick Starters */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Inspirational Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {INSPIRATIONAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* User Name (Optional) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Your Name <span className="text-slate-500 font-normal">(optional, for personalized attribution)</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Dr. Harper, Jordan"
                maxLength={40}
                className="w-full rounded-xl border border-white/15 bg-white/[0.05] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Occupation / Profession <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Briefcase className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer, Surgeon, Chef"
                required
                maxLength={60}
                className="w-full rounded-xl border border-white/15 bg-white/[0.05] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Hobbies */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Hobby / Hobbies <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                placeholder="e.g. Rock Climbing, Pottery, Marathon"
                required
                maxLength={80}
                className="w-full rounded-xl border border-white/15 bg-white/[0.05] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Inspiration Tone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {toneOptions.map((opt) => {
              const isSelected = tone === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTone(opt.id)}
                  className={`rounded-xl border px-3 py-2 text-left transition-all ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-400/15 text-white shadow-sm'
                      : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error notice if any */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Weaving Custom Inspiration...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-slate-950 transition-transform group-hover:scale-110" />
                <span>Generate Motivation</span>
              </>
            )}
          </button>
          <div className="mt-2 text-center text-[11px] text-slate-500">
            Synthesizes unique metaphorical parallels between your trade and pastime.
          </div>
        </div>
      </form>
    </div>
  );
};
