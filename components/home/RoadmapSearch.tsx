'use client';

// Smart roadmap search: type a language or topic («پایتون», «فرانت‌اند», «python»)
// and jump straight to its roadmap. Exact matches navigate automatically while
// typing; Enter always goes to the best match — no extra click needed.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Compass, Search, Sparkles } from 'lucide-react';
import {
  ROADMAP_CATEGORY_LABELS,
  getRoadmaps,
  matchRoadmaps,
  normalizeText,
  type Roadmap,
} from '@/lib/roadmaps';

function isExactMatch(query: string, roadmap: Roadmap) {
  const needle = normalizeText(query);
  return [roadmap.title, roadmap.slug, ...roadmap.aliases].map(normalizeText).includes(needle);
}

export default function RoadmapSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo(() => matchRoadmaps(query).slice(0, 6).map((match) => match.roadmap), [query]);
  const allRoadmaps = useMemo(() => getRoadmaps(), []);

  function goTo(roadmap: Roadmap) {
    setOpen(false);
    router.push(`/learning-paths/${roadmap.slug}`);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push('/learning-paths#roadmap-catalog');
      return;
    }
    const [best] = matchRoadmaps(trimmed);
    if (best) goTo(best.roadmap);
  }

  // Auto-jump when the typed query is exactly a known language/topic name.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    debounceRef.current = setTimeout(() => {
      const exact = allRoadmaps.find((roadmap) => isExactMatch(trimmed, roadmap));
      if (exact) goTo(exact);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full">
      <form role="search" onSubmit={submit} className="flex min-w-0 flex-col gap-2 rounded-2xl border border-white/70 bg-white/90 p-2 shadow-lg shadow-violet-900/5 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 min-[420px]:flex-row dark:border-white/10 dark:bg-slate-900/70">
        <label htmlFor="roadmap-search-input" className="sr-only">جست‌وجوی نقشه‌ی راه: زبان یا موضوع</label>
        <div className="relative min-w-0 flex-1">
          <Search size={19} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-primary" />
          <input
            id="roadmap-search-input"
            type="search"
            name="topic"
            autoComplete="off"
            autoFocus={autoFocus}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setHighlight(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setHighlight((index) => Math.min(index + 1, Math.max(matches.length - 1, 0)));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setHighlight((index) => Math.max(index - 1, 0));
              } else if (event.key === 'Escape') {
                setOpen(false);
              } else if (event.key === 'Enter' && open && matches[highlight] && query.trim()) {
                event.preventDefault();
                goTo(matches[highlight]);
              }
            }}
            placeholder="زبان یا موضوع را بنویس: مثلاً پایتون، فرانت‌اند، ریاضی..."
            className="min-h-12 w-full min-w-0 rounded-xl bg-transparent py-3 ps-10 pe-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
            aria-expanded={open}
            aria-controls="roadmap-search-suggestions"
            role="combobox"
            aria-autocomplete="list"
          />
        </div>
        <button type="submit" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-primary-foreground transition hover:opacity-90">
          برو به نقشه‌ی راه
          <ArrowLeft size={15} />
        </button>
      </form>

      {open && query.trim().length > 0 && (
        <ul id="roadmap-search-suggestions" role="listbox" className="absolute inset-x-0 top-[calc(100%+0.55rem)] z-40 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-slate-900/15">
          {matches.length > 0 ? matches.map((roadmap, index) => (
            <li key={roadmap.slug} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(index)}
                onClick={() => goTo(roadmap)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-right transition ${index === highlight ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Compass size={16} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-foreground">{roadmap.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{ROADMAP_CATEGORY_LABELS[roadmap.category]} · {roadmap.level}</span>
                </span>
                {isExactMatch(query, roadmap) && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"><Sparkles size={11} /> دقیقاً همین</span>
                )}
                <ArrowLeft size={15} className="shrink-0 text-muted-foreground" />
              </button>
            </li>
          )) : (
            <li className="px-4 py-6 text-center text-xs font-bold text-muted-foreground">
              نقشه‌ی راهی با این نام پیدا نکردیم. «پایتون»، «بک‌اند» یا «فیزیک» را امتحان کن.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
