import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowUpLeft,
  Atom,
  BookOpen,
  Braces,
  Check,
  Clock3,
  Code2,
  Compass,
  GraduationCap,
  Layers3,
  Play,
  Rocket,
  Sparkles,
  Sigma,
  Terminal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getLatestLessons, getPublicSettings, getPublicStats, getPublicSubjects } from '@/lib/content';
import type { PublicLesson, PublicSubject } from '@/lib/content';

export const dynamic = 'force-dynamic';

const iconByName: Record<string, LucideIcon> = {
  Braces,
  Code2,
  Atom,
  Sigma,
  BookOpen,
  Rocket,
  GraduationCap,
};

const artByColor: Record<string, { start: string; end: string; icon: string }> = {
  blue: { start: '#c8d8ff', end: '#e6eaff', icon: '#4f62db' },
  cyan: { start: '#c4f0ee', end: '#e4f8fa', icon: '#219c9c' },
  violet: { start: '#ded2ff', end: '#f0e9ff', icon: '#7c5cda' },
  emerald: { start: '#c5efd9', end: '#e8f8ee', icon: '#258c62' },
  yellow: { start: '#f8e6ad', end: '#fbf5d9', icon: '#b88923' },
  orange: { start: '#ffd7c2', end: '#fff0e6', icon: '#d57a4a' },
  gray: { start: '#d9e0ec', end: '#f0f2f7', icon: '#6c778a' },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function safeHref(value: string | undefined, fallback: string) {
  return value?.startsWith('/') ? value : fallback;
}

function LessonCard({ lesson, index }: { lesson: PublicLesson; index: number }) {
  const art = artByColor[lesson.subject_color || 'violet'] || artByColor.violet;
  const Icon = iconByName[lesson.subject_icon || ''] || Code2;

  return (
    <Link href={`/tutorials/${lesson.subject_slug || 'c'}/${lesson.slug}`} className="group block h-full">
      <article className="soft-card card-hover h-full overflow-hidden">
        <div
          className="subject-art relative flex h-36 items-end justify-between overflow-hidden p-5"
          style={{ '--art-start': art.start, '--art-end': art.end } as CSSProperties}
        >
          <div className="absolute -left-5 -top-10 size-36 rounded-full border border-white/40 opacity-60" />
          <div className="absolute -left-1 top-1 size-24 rounded-full border border-white/50 opacity-50" />
          <div className="relative flex size-12 items-center justify-center rounded-2xl bg-white/75 text-[color:var(--lesson-icon)] shadow-sm backdrop-blur" style={{ '--lesson-icon': art.icon } as CSSProperties}>
            <Icon size={23} strokeWidth={1.8} />
          </div>
          <span className="relative rounded-full border border-white/50 bg-white/65 px-3 py-1 text-[11px] font-bold text-slate-700 backdrop-blur">
            {lesson.subject_title || 'درس تازه'}
          </span>
          <span className="absolute right-5 top-5 text-[10px] font-bold tracking-[0.22em] text-slate-500/75">LESSON {String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> {formatNumber(lesson.duration_minutes || 20)} دقیقه</span>
            {lesson.is_featured && <span className="rounded-full bg-[#b7f486]/35 px-2.5 py-1 font-bold text-emerald-800 dark:text-emerald-200">پیشنهاد CodeMage</span>}
          </div>
          <h3 className="text-lg font-black leading-8 tracking-tight text-foreground transition-colors group-hover:text-primary">{lesson.title}</h3>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">{lesson.summary || 'یک درس تازه برای ادامه‌ی مسیر یادگیری.'}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-primary">
            خواندن درس <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
          </span>
        </div>
      </article>
    </Link>
  );
}

function SubjectCard({ subject, index }: { subject: PublicSubject; index: number }) {
  const art = artByColor[subject.color || 'violet'] || artByColor.violet;
  const Icon = iconByName[subject.icon || ''] || (subject.kind === 'math' ? Sigma : subject.kind === 'physics' ? Atom : Braces);
  const chapterCount = subject.chapters_count || 0;
  const lessonCount = subject.lessons_count || 0;

  return (
    <Link href={`/tutorials/${subject.slug}`} className="group block h-full">
      <article className="soft-card card-hover flex h-full flex-col overflow-hidden">
        <div
          className="subject-art relative flex h-44 items-center justify-center overflow-hidden"
          style={{ '--art-start': art.start, '--art-end': art.end } as CSSProperties}
        >
          <div className="absolute -left-9 -top-12 size-44 rounded-full border border-white/55" />
          <div className="absolute -left-1 top-4 size-28 rounded-full border border-white/60" />
          <div className="absolute -bottom-12 right-6 size-36 rounded-full bg-white/25 blur-xl" />
          <div className="relative flex size-[76px] items-center justify-center rounded-[1.7rem] border border-white/60 bg-white/65 text-[color:var(--subject-icon)] shadow-lg shadow-slate-700/10 backdrop-blur-md transition duration-300 group-hover:-rotate-6 group-hover:scale-105" style={{ '--subject-icon': art.icon } as CSSProperties}>
            <Icon size={36} strokeWidth={1.65} />
          </div>
          <span className="absolute left-5 top-5 rounded-full border border-white/50 bg-white/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 backdrop-blur">{String(index + 1).padStart(2, '0')} / SUBJECT</span>
          <span className="absolute bottom-4 right-5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-700 backdrop-blur">{subject.level || 'برای همه'}</span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">{subject.title}</h3>
          <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">{subject.description || 'مجموعه‌ای از درس‌های کوتاه و کاربردی برای یادگیری این موضوع.'}</p>
          <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><BookOpen size={14} /> {formatNumber(lessonCount)} درس</span>
            <span className="inline-flex items-center gap-1.5"><Layers3 size={14} /> {formatNumber(chapterCount)} فصل</span>
            <span className="inline-flex items-center gap-1 text-primary transition-transform group-hover:-translate-x-1">ورود <ArrowLeft size={14} /></span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function HomePage() {
  const [settings, subjects, lessons, stats] = await Promise.all([
    getPublicSettings(),
    getPublicSubjects(),
    getLatestLessons(4),
    getPublicStats(),
  ]);

  const primaryHref = safeHref(settings.hero.primary_href, '/tutorials');
  const secondaryHref = safeHref(settings.hero.secondary_href, '/learning-paths');
  const ctaHref = safeHref(settings.cta.href, '/tutorials');

  return (
    <div dir="rtl">
      <section className="page-container pt-5 sm:pt-8">
        <div className="hero-panel px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-[4.5rem]">
          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1fr_0.88fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-bold text-white/80 backdrop-blur">
                <Sparkles size={14} className="text-[#b7f486]" />
                <span>یادگیریِ عمیق، ساده و فارسی</span>
                <span className="size-1 rounded-full bg-[#b7f486]" />
                <span className="text-white/50">CodeMage</span>
              </div>
              <h1 className="max-w-2xl text-[2.6rem] font-black leading-[1.35] tracking-tight text-white sm:text-5xl lg:text-[3.55rem]">
                {settings.hero.title}{' '}
                <span className="hero-highlight">{settings.hero.highlight}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/65 sm:text-lg sm:leading-9">{settings.hero.subtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={primaryHref} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#b7f486] px-6 py-3.5 text-sm font-black text-[#17233a] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#c7f89c]">
                  {settings.hero.primary_cta}<ArrowLeft size={17} />
                </Link>
                <Link href={secondaryHref} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/10">
                  <Compass size={17} />{settings.hero.secondary_cta}
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-white/60">
                <span className="inline-flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-[#b7f486]/15 text-[#b7f486]"><Check size={12} /></span>رایگان و همیشه در دسترس</span>
                <span className="inline-flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-[#b7f486]/15 text-[#b7f486]"><Check size={12} /></span>محتوای فارسی و کاربردی</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[490px] px-2 py-4 sm:px-5">
              <div className="absolute -right-2 top-2 size-24 rounded-full bg-violet-400/35 blur-3xl" />
              <div className="absolute -bottom-2 left-0 size-28 rounded-full bg-emerald-300/25 blur-3xl" />
              <div className="hero-window relative z-10">
                <div className="hero-window-top" dir="ltr">
                  <span className="flex items-center gap-2"><Terminal size={13} /> learning-path.ts</span>
                  <span className="flex gap-1.5"><i className="size-2 rounded-full bg-rose-400" /><i className="size-2 rounded-full bg-amber-300" /><i className="size-2 rounded-full bg-emerald-400" /></span>
                </div>
                <div className="hero-code" dir="ltr">
                  <div><span className="code-muted">01</span> <span className="code-violet">const</span> <span className="code-mint">yourJourney</span> = {'{'}</div>
                  <div><span className="code-muted">02</span> &nbsp; curious: <span className="code-yellow">true</span>,</div>
                  <div><span className="code-muted">03</span> &nbsp; learn: <span className="code-mint">&quot;one step at a time&quot;</span>,</div>
                  <div><span className="code-muted">04</span> &nbsp; practice: <span className="code-yellow">() =&gt; grow()</span></div>
                  <div><span className="code-muted">05</span> {'}'}</div>
                  <div className="mt-2 border-t border-white/10 pt-3 text-[#b7f486]"><span className="code-muted">06</span> <span className="code-violet">await</span> yourJourney.start(); <span className="animate-pulse">▍</span></div>
                </div>
              </div>
              <div className="float-card absolute -bottom-3 -right-1 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 sm:-right-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#b7f486]/15 text-[#b7f486]"><BookOpen size={17} /></span>
                <span><span className="block text-xs font-black text-white">قدم‌به‌قدم تا مهارت</span><span className="mt-1 block text-[10px] text-white/55">هر درس، یک پیشرفت واقعی</span></span>
              </div>
              <div className="float-card absolute -left-1 top-0 z-20 flex items-center gap-2 rounded-2xl px-3.5 py-3 sm:-left-4">
                <span className="flex size-8 items-center justify-center rounded-xl bg-violet-400/15 text-violet-200"><Play size={15} fill="currentColor" /></span>
                <span className="text-xs font-bold text-white">شروع از همین‌جا</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container -mt-1 pt-5">
        <div className="grid gap-3 rounded-[1.75rem] border border-border/75 bg-card p-4 shadow-[0_20px_50px_-40px_rgba(31,41,75,0.3)] sm:grid-cols-3 sm:p-5">
          <div className="flex items-center gap-4 rounded-2xl px-4 py-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BookOpen size={22} /></span>
            <span><span className="block text-2xl font-black tracking-tight text-foreground">{formatNumber(stats.lessons_count)}</span><span className="mt-0.5 block text-xs font-semibold text-muted-foreground">درس منتشرشده</span></span>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border-y border-border/70 px-4 py-3 sm:border-y-0 sm:border-x">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-600 dark:text-emerald-300"><Layers3 size={22} /></span>
            <span><span className="block text-2xl font-black tracking-tight text-foreground">{formatNumber(stats.subjects_count)}</span><span className="mt-0.5 block text-xs font-semibold text-muted-foreground">موضوع برای یادگیری</span></span>
          </div>
          <div className="flex items-center gap-4 rounded-2xl px-4 py-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-600 dark:text-amber-300"><Clock3 size={22} /></span>
            <span><span className="block text-2xl font-black tracking-tight text-foreground">{formatNumber(stats.total_minutes)} <small className="text-sm font-bold">دقیقه</small></span><span className="mt-0.5 block text-xs font-semibold text-muted-foreground">محتوای آموزشی برای مطالعه</span></span>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="page-container">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="section-kicker"><Sparkles size={14} /> موضوع‌های منتخب</span>
              <h2 className="section-title">از کجا شروع کنیم؟</h2>
              <p className="section-copy">موضوعی را انتخاب کن که همین حالا به آن علاقه داری؛ مسیرت را از همان‌جا می‌سازیم.</p>
            </div>
            <Link href="/tutorials" className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-3 text-sm font-extrabold text-primary transition hover:gap-3 sm:self-auto">همه‌ی موضوع‌ها <ArrowLeft size={16} /></Link>
          </div>
          {subjects.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.slice(0, 6).map((subject, index) => <SubjectCard key={subject.id} subject={subject} index={index} />)}
            </div>
          ) : (
            <div className="soft-card mt-8 p-8 text-center text-sm text-muted-foreground">هنوز موضوعی منتشر نشده است.</div>
          )}
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="page-container">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="section-kicker"><Clock3 size={14} /> تازه‌های یادگیری</span>
              <h2 className="section-title">درس بعدی‌ات منتظر توست</h2>
              <p className="section-copy">درس‌های تازه و منتخب را ببین و بدون معطلی ادامه بده.</p>
            </div>
            <Link href="/tutorials" className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-3 text-sm font-extrabold text-primary transition hover:gap-3 sm:self-auto">رفتن به کتابخانه <ArrowLeft size={16} /></Link>
          </div>
          {lessons.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {lessons.map((lesson, index) => <LessonCard key={lesson.id} lesson={lesson} index={index} />)}
            </div>
          ) : (
            <div className="soft-card mt-8 p-8 text-center text-sm text-muted-foreground">به‌زودی درس‌های تازه به این بخش اضافه می‌شوند.</div>
          )}
        </div>
      </section>

      <section className="pb-20 sm:pb-24">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-primary to-[#5545c6] px-6 py-9 text-white shadow-xl shadow-primary/20 sm:px-10 sm:py-11">
            <div className="absolute -left-14 -top-24 size-64 rounded-full border border-white/15" />
            <div className="absolute -left-2 -top-12 size-40 rounded-full border border-white/10" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><Rocket size={14} /> مسیر تو از همین حالا شروع می‌شود</span>
                <h2 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">{settings.cta.title}</h2>
                <p className="mt-2 text-sm leading-7 text-white/75 sm:text-base">{settings.cta.text}</p>
              </div>
              <Link href={ctaHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-primary transition hover:-translate-y-0.5 hover:bg-[#f1f0ff]">
                {settings.cta.button}<ArrowUpLeft size={17} />
              </Link>
            </div>
          </div>
          <div className="mt-5 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-emerald-500" /> محتوا قابل ویرایش و همیشه به‌روز</span>
            <Link href="/learning-paths" className="inline-flex items-center gap-1 font-bold text-primary">آشنایی با مسیرهای یادگیری <ArrowLeft size={14} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
