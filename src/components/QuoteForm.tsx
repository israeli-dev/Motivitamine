import { useState, type FormEvent } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { QUOTE_LIMITS, TONES, type QuoteRequest, type Tone } from '../../shared/quote.js';
import { INSPIRATIONAL_PRESETS } from '../data/presets';

interface QuoteFormProps {
  isLoading: boolean;
  generationError: string;
  generationConfigured?: boolean;
  onGenerate: (data: QuoteRequest & { name: string }) => void;
}

const toneDetails: Record<Tone, [string, string]> = {
  empowering: ['Empowering', 'Bold and encouraging'],
  philosophical: ['Philosophical', 'Deep and reflective'],
  witty: ['Witty', 'Bright and playful'],
  zen: ['Zen & Flow', 'Serene and mindful'],
  poetic: ['Poetic', 'Lyrical and evocative'],
};

const inputClass = 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400';

export function QuoteForm({ isLoading, generationError, generationConfigured, onGenerate }: QuoteFormProps) {
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [tone, setTone] = useState<Tone>('empowering');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || generationConfigured === false) return;
    if (!occupation.trim() || !hobbies.trim()) {
      setError('Enter a job or career and at least one hobby.');
      return;
    }
    setError('');
    onGenerate({ name: name.trim(), occupation: occupation.trim(), hobbies: hobbies.trim(), tone });
  }

  return (
    <div id="generator" className="rounded-2xl border border-white/10 bg-[#121824]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-400"><Compass aria-hidden="true" className="h-4 w-4" /> Work × Hobby</div>
        <h2 className="mt-1 font-garamond text-2xl sm:text-3xl font-semibold text-white">Harmonize Your Craft & Passion</h2>
        <p className="mt-1 text-sm text-slate-400">Tell Gemini what you do and what you love. It will write a short quote inspired by both.</p>
      </div>

      {generationConfigured === false && <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Gemini isn’t configured on this server. You can still customize, save, or export the sample card.</p>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset disabled={isLoading} className="min-w-0 space-y-5 disabled:opacity-85">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Inspirational Presets</p>
            <div className="flex flex-wrap gap-2">
              {INSPIRATIONAL_PRESETS.map((preset) => (
                <button key={preset.id} type="button" onClick={() => { setName(preset.name); setOccupation(preset.occupation); setHobbies(preset.hobbies); setTone(preset.tone); setError(''); }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-left text-xs text-slate-300 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10">
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2 text-xs font-medium text-slate-300">
              <span className="mb-1.5 block">Your name <span className="text-slate-400">(optional)</span></span>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Alex" maxLength={QUOTE_LIMITS.name} className={inputClass} />
            </label>
            <label className="block text-xs font-medium text-slate-300">
              <span className="mb-1.5 block">Job or career <span aria-hidden="true" className="text-amber-400">*</span></span>
              <input type="text" required value={occupation} onChange={(event) => setOccupation(event.target.value)} placeholder="e.g. Baker, nurse, student" maxLength={QUOTE_LIMITS.occupation} className={inputClass} />
            </label>
            <label className="block text-xs font-medium text-slate-300">
              <span className="mb-1.5 block">Hobby or hobbies <span aria-hidden="true" className="text-amber-400">*</span></span>
              <input type="text" required value={hobbies} onChange={(event) => setHobbies(event.target.value)} placeholder="e.g. Chess and gardening" maxLength={QUOTE_LIMITS.hobbies} className={inputClass} />
            </label>
          </div>
          <fieldset className="min-w-0">
            <legend className="mb-2 text-xs font-medium text-slate-300">Inspiration tone</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TONES.map((option) => (
                <label key={option} className="cursor-pointer">
                  <input type="radio" name="tone" className="peer sr-only" checked={tone === option} onChange={() => setTone(option)} value={option} />
                  <span className="block h-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 peer-checked:border-amber-400/80 peer-checked:bg-amber-400/15 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300">
                    <span className="block text-xs font-semibold">{toneDetails[option][0]}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{toneDetails[option][1]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </fieldset>
        <p className="text-xs text-slate-400">Gemini receives your job, hobbies, and tone to write the quote. Your optional name stays in this browser.</p>
        {(error || generationError) && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-200">{error || generationError}</p>}
        <p role="status" className="sr-only">{isLoading ? 'Gemini is writing your quote.' : ''}</p>
        <button type="submit" disabled={isLoading || generationConfigured === false} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-md transition-colors hover:from-amber-400 hover:to-amber-400 disabled:opacity-60">
          <Sparkles aria-hidden="true" className="h-4 w-4" /> {isLoading ? 'Writing your quote…' : 'Generate My Quote'}
        </button>
      </form>
    </div>
  );
}
