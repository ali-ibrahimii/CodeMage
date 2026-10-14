import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  ArrowLeft,
  Atom,
  BookOpen,
  Braces,
  Clock3,
  Code2,
  Layers3,
  Search,
  Sigma,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getPublicLessonIndex, getPublicSubjects } from '@/lib/content';

export const dynamic = 'force-dynamic';

const iconByName: Record<string, LucideIcon> = { Braces, Code2, Atom, Sigma, BookOpen };
const colors: Record<string, { first: string; second: string; ink: string }> = {
  blue: { first: '#cad8ff', second: '#eaf0ff', ink: '#5366d8' },
  cyan: { first: '#c4f2ed', second: '#e5faf7', ink: '#229b94' },
  violet: { first: '#e1d4ff', second: '#f3ecff', ink: '#7c5bd5' },
  emerald: { first: '#c9efd8', second: '#e7f8ed', ink: '#298b5c' },
  yellow: { first: '#f8e6ae', second: '#fcf5dc', ink: '#af842a' },
};

function number(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export default async function TutorialsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [{ q }, subjects, lessonIndex] = await Promise.all([
    searchParams,
    getPublicSubjects(),
    getPublicLessonIndex(),
  ]);
  const query = (Array.isArray(q) ? q[0] : q || '').trim();
  const needle = query.toLocaleLowerCase('fa-IR');
  const visibleSubjects = query
    ? subjects.filter((subject) => `${subject.title} ${subject.description || ''} ${subject.slug}`.toLocaleLowerCase('fa-IR').includes(needle))
    : subjects;
  const visibleLessons = query
    ? lessonIndex.filter((lesson) => `${lesson.title} ${lesson.summary || ''} ${lesson.subject_title || ''}`.toLocaleLowerCase('fa-IR').includes(needle))
    : lessonIndex.slice(0, 8);

  return (
    <div className="page-container page-shell" dir="rtl">
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-border/70 bg-gradient-to-br from-[#f2efff] via-white to-[#ebfaf5] px-5 py-8 dark:from-[#24213b] dark:via-[#20283d] dark:to-[#1b3438] sm:px-10 sm:py-12">
        <div className="absolute -left-10 -top-16 size-56 rounded-full bg-violet-300/25 blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] lg:items-end">
          <div>
            <span className="section-kicker"><BookOpen size={14} /> کتابخانه‌ی CodeMage</span>
            <h1 className="mt-4 max-w-2xl page-heading text-foreground">یادگیری را با موضوع دلخواهت شروع کن</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">درس‌های کوتاه و مرحله‌به‌مرحله، همراه با مثال‌های قابل فهم. جست‌وجو کن یا یکی از موضوع‌ها را انتخاب کن.</p>
          </div>
          <form action="/tutorials" method="get" className="flex min-w-0 flex-col gap-2 rounded-2xl border border-white/70 bg-white/85 p-2 shadow-lg shadow-violet-900/5 focus-within:border-primary/35 focus-within:ring-4 focus-within:ring-primary/10 min-[400px]:flex-row dark:border-white/10 dark:bg-slate-900/65">
            <label htmlFor="tutorial-search" className="sr-only">جست‌وجو بین موضوع‌ها و درس‌ها</label>
            <div className="relative min-w-0 flex-1">
              <Search size={19} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-primary" />
              <input id="tutorial-search" type="search" name="q" defaultValue={query} placeholder="مثلاً: متغیر، حد، زبان C..." className="min-h-12 w-full min-w-0 rounded-xl bg-transparent py-3 ps-10 pe-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white" />
            </div>
            <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-primary px-4 py-3 text-xs font-black text-primary-foreground transition hover:opacity-90">جست‌وجو</button>
          </form>
        </div>
      </section>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-primary">{query ? `نتایج جست‌وجو برای «${query}»` : 'موضوع‌های موجود'}</span>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">{query ? 'نتایج یادگیری' : 'یک مهارت تازه انتخاب کن'}</h2>
        </div>
        <span className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground">{number(visibleSubjects.length)} موضوع · {number(visibleLessons.length)} درس</span>
      </div>

      {visibleSubjects.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSubjects.map((subject, index) => {
            const colorset = colors[subject.color || 'violet'] || colors.violet;
            const Icon = iconByName[subject.icon || ''] || (subject.kind === 'physics' ? Atom : subject.kind === 'math' ? Sigma : Braces);
            return (
              <Link key={subject.id} href={`/tutorials/${subject.slug}`} className="group block h-full">
                <article className="soft-card card-hover flex h-full flex-col overflow-hidden">
                  <div className="relative flex h-40 shrink-0 items-center justify-between overflow-hidden px-6" style={{ '--art-start': colorset.first, '--art-end': colorset.second } as CSSProperties}>
                    <div className="subject-art absolute inset-0" />
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">TOPIC / {String(index + 1).padStart(2, '0')}</span>
                    <span className="relative z-10 flex size-16 items-center justify-center rounded-[1.4rem] border border-white/70 bg-white/75 text-[color:var(--topic-icon)] shadow-lg shadow-slate-500/10 backdrop-blur" style={{ '--topic-icon': colorset.ink } as CSSProperties}><Icon size={30} strokeWidth={1.7} /></span>
                    <span className="absolute bottom-4 right-6 z-10 rounded-full border border-white/60 bg-white/65 px-3 py-1 text-[11px] font-bold text-slate-700 backdrop-blur">{subject.level || 'همه‌ی سطح‌ها'}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">{subject.title}</h3>
                    <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">{subject.description || 'مجموعه‌ای از درس‌های کاربردی و مرحله‌به‌مرحله.'}</p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs font-bold text-muted-foreground">
                      <span className="flex items-center gap-1.5"><BookOpen size={14} /> {number(subject.lessons_count || 0)} درس</span>
                      <span className="flex items-center gap-1.5"><Layers3 size={14} /> {number(subject.chapters_count || 0)} فصل</span>
                      <span className="flex items-center gap-1 text-primary transition-transform group-hover:-translate-x-1">مشاهده <ArrowLeft size={14} /></span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="soft-card mt-5 px-6 py-12 text-center">
          <Search size={28} className="mx-auto text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-black">چیزی پیدا نکردیم</h3>
          <p className="mt-2 text-sm text-muted-foreground">عبارت دیگری را امتحان کن یا همه‌ی موضوع‌ها را ببین.</p>
          <Link href="/tutorials" className="button-primary mt-5">پاک‌کردن جست‌وجو <ArrowLeft size={15} /></Link>
        </div>
      )}

      {visibleLessons.length > 0 && (
        <section className="mt-14">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-primary"><Sparkles size={14} /> {query ? 'درس‌های مرتبط' : 'برای ادامه‌ی مسیر'}</span>
              <h2 className="mt-2 text-2xl font-black tracking-tight">{query ? 'درس‌های پیدا شده' : 'درس‌های محبوب'}</h2>
            </div>
            {!query && <Link href="/learning-paths" className="inline-flex items-center gap-2 text-xs font-extrabold text-primary">مسیرهای یادگیری <ArrowLeft size={14} /></Link>}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {visibleLessons.slice(0, 8).map((lesson) => (
              <Link key={lesson.id} href={`/tutorials/${lesson.subject_slug || 'c'}/${lesson.slug}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-md">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Code2 size={19} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-foreground group-hover:text-primary">{lesson.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"><span>{lesson.subject_title}</span><span>·</span><span>{number(lesson.duration_minutes || 20)} دقیقه</span><Clock3 size={12} /></span>
                </span>
                <ArrowLeft size={16} className="shrink-0 text-muted-foreground transition group-hover:-translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
