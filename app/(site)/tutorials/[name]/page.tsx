import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Atom,
  BookOpen,
  Braces,
  CheckCircle2,
  Clock3,
  Code2,
  Cpu,
  GraduationCap,
  Layers3,
  Monitor,
  Play,
  Server,
  Sigma,
  Sparkles,
  Terminal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getPublicSubject } from '@/lib/content';

export const dynamic = 'force-dynamic';

const iconByName: Record<string, LucideIcon> = { Braces, Code2, Atom, Sigma, BookOpen, GraduationCap, Terminal, Cpu, Monitor, Server };

function number(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export default async function TutorialListPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const data = await getPublicSubject(name.toLowerCase());
  if (!data) notFound();

  const { subject, chapters, lessons } = data;
  const SubjectIcon = iconByName[subject.icon || ''] || (subject.kind === 'physics' ? Atom : subject.kind === 'math' ? Sigma : Braces);
  const totalMinutes = lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0);
  const firstLesson = lessons[0];
  const lessonsForChapter = (chapterId: string) => lessons.filter((lesson) => lesson.chapter_id === chapterId);
  const colors: Record<string, string> = {
    blue: 'from-blue-500/25 to-cyan-400/10',
    cyan: 'from-cyan-400/25 to-teal-300/10',
    violet: 'from-violet-500/30 to-fuchsia-400/10',
    emerald: 'from-emerald-400/25 to-teal-300/10',
    yellow: 'from-amber-300/30 to-orange-300/10',
    orange: 'from-orange-400/25 to-rose-300/10',
    gray: 'from-slate-400/25 to-slate-200/10',
  };
  const theme = colors[subject.color || 'violet'] || colors.violet;

  return (
    <div className="page-container page-shell" dir="rtl">
      <section className={`relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-border/60 bg-gradient-to-br ${theme} px-5 py-8 sm:px-10 sm:py-11`}>
        <div className="absolute -left-12 -top-16 size-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
              <Link href="/tutorials" className="transition hover:text-primary">همه‌ی موضوع‌ها</Link>
              <span>/</span><span className="text-primary">{subject.title}</span>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/60 bg-card/60 px-3 py-1.5 text-[11px] font-black text-primary shadow-sm backdrop-blur"><Sparkles size={13} /> مسیر یادگیری CodeMage</span>
            <h1 className="mt-4 page-heading text-foreground">{subject.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">{subject.description || `از پایه تا قدم‌های بعدی، ${subject.title} را با مثال‌های ساده یاد بگیر.`}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3.5 py-2"><BookOpen size={14} className="text-primary" />{number(lessons.length)} درس منتشرشده</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3.5 py-2"><Layers3 size={14} className="text-primary" />{number(chapters.length)} فصل</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3.5 py-2"><Clock3 size={14} className="text-primary" />حدود {number(Math.ceil(totalMinutes / 60))} ساعت مطالعه</span>
              {subject.level && <span className="rounded-full border border-border/70 bg-card/75 px-3.5 py-2">{subject.level}</span>}
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col">
            <span className="flex size-28 items-center justify-center rounded-3xl sm:rounded-[2rem] border border-white/70 bg-card/70 text-primary shadow-xl shadow-primary/10 backdrop-blur"><SubjectIcon size={48} strokeWidth={1.5} /></span>
            {firstLesson ? (
              <Link href={`/tutorials/${subject.slug}/${firstLesson.slug}`} className="button-primary w-full sm:w-auto lg:w-full"><Play size={16} fill="currentColor" /> شروع اولین درس</Link>
            ) : (
              <span className="rounded-2xl border border-border bg-card/75 px-5 py-3 text-center text-xs font-bold text-muted-foreground">درس‌ها به‌زودی منتشر می‌شوند</span>
            )}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="section-kicker"><Layers3 size={14} /> فهرست درس‌ها</span>
            <h2 className="section-title">مسیر این موضوع</h2>
            <p className="section-copy">درس‌ها بر اساس فصل مرتب شده‌اند؛ هرجا خواستی می‌توانی ادامه بدهی.</p>
          </div>
          <Link href="/learning-paths" className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-3 text-sm font-extrabold text-primary transition hover:gap-3 sm:self-auto">مسیر یادگیری <ArrowLeft size={16} /></Link>
        </div>

        {chapters.length > 0 ? (
          <div className="mt-7 space-y-5">
            {chapters.map((chapter, chapterIndex) => {
              const chapterLessons = lessonsForChapter(chapter.id);
              return (
                <section key={chapter.id} className="soft-card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/35 px-5 py-4 sm:px-7">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary">{number(chapterIndex + 1)}</span>
                      <div>
                        <h3 className="text-base font-black tracking-tight sm:text-lg">{chapter.title}</h3>
                        {chapter.description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{chapter.description}</p>}
                      </div>
                    </div>
                    <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground">{number(chapterLessons.length)} درس</span>
                  </div>

                  <div className="divide-y divide-border/65 px-4 sm:px-6">
                    {chapterLessons.length > 0 ? chapterLessons.map((lesson, lessonIndex) => (
                      <Link key={lesson.id} href={`/tutorials/${subject.slug}/${lesson.slug}`} className="group flex items-center gap-3 py-4 sm:gap-4 sm:py-5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground"><span className="text-xs font-black">{number(lessonIndex + 1)}</span></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black text-foreground transition-colors group-hover:text-primary sm:text-base">{lesson.title}</span>
                          {lesson.summary && <span className="mt-1 line-clamp-1 block text-xs leading-5 text-muted-foreground">{lesson.summary}</span>}
                        </span>
                        <span className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:inline-flex"><Clock3 size={13} /> {number(lesson.duration_minutes || 20)} دقیقه</span>
                        {lesson.is_featured && <span className="hidden rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 sm:inline-flex">ویژه</span>}
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-primary transition group-hover:bg-primary/10"><ArrowLeft size={17} /></span>
                      </Link>
                    )) : (
                      <div className="flex items-center gap-3 py-5 text-sm text-muted-foreground"><CheckCircle2 size={17} className="text-primary/60" /> درس‌های این فصل در حال آماده‌سازی هستند.</div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="soft-card mt-7 p-10 text-center">
            <BookOpen className="mx-auto text-muted-foreground/60" size={32} />
            <h3 className="mt-4 font-black">فصل‌ها به‌زودی اضافه می‌شوند</h3>
            <p className="mt-2 text-sm text-muted-foreground">برای دیدن مسیرهای دیگر به کتابخانه برگرد.</p>
            <Link href="/tutorials" className="button-primary mt-5">مشاهده‌ی موضوع‌ها <ArrowLeft size={15} /></Link>
          </div>
        )}
      </section>
    </div>
  );
}
