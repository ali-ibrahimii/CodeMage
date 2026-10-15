'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Copy,
  FileText,
  Layers3,
  Menu,
  X,
} from 'lucide-react';
import type { PublicLesson } from '@/lib/content';
import { extractCode, markdownToHtml } from '@/lib/markdown';

type Props = {
  lesson: PublicLesson;
  allLessons: PublicLesson[];
  topicName: string;
  topicTitle: string;
  chapterTitle: string;
};

function number(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export default function LessonClient({ lesson, allLessons, topicName, topicTitle, chapterTitle }: Props) {
  const [activeTab, setActiveTab] = useState<'lesson' | 'code'>('lesson');
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);

  const renderedContent = useMemo(() => markdownToHtml(lesson.content || 'برای این درس هنوز محتوایی ثبت نشده است.'), [lesson.content]);
  const codeSnippets = useMemo(() => extractCode(lesson.content || ''), [lesson.content]);
  const currentIndex = allLessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const progress = allLessons.length > 1 ? Math.round(((currentIndex + 1) / allLessons.length) * 100) : 100;

  async function copySnippet(code: string, index: number) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSnippet(index);
      window.setTimeout(() => setCopiedSnippet(null), 1800);
    } catch {
      setCopiedSnippet(null);
    }
  }

  const lessonList = (
    <div className="space-y-1.5">
      {allLessons.map((item, index) => {
        const isActive = item.slug === lesson.slug;
        return (
          <Link
            key={item.id}
            href={`/tutorials/${topicName}/${item.slug}`}
            onClick={() => setMobileListOpen(false)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-2xl p-3 transition ${isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-black ${isActive ? 'bg-white/15 text-white' : 'bg-background text-muted-foreground'}`}>{number(index + 1)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold">{item.title}</span>
              <span className={`mt-1 block text-[10px] ${isActive ? 'text-white/65' : 'text-muted-foreground/75'}`}>{number(item.duration_minutes || 20)} دقیقه</span>
            </span>
            {isActive ? <Check size={15} /> : <ArrowLeft size={14} className="opacity-40" />}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="page-container pb-16 pt-7 sm:pt-10" dir="rtl">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
        <Link href="/tutorials" className="transition hover:text-primary">موضوع‌ها</Link><span>/</span>
        <Link href={`/tutorials/${topicName}`} className="transition hover:text-primary">{topicTitle}</Link><span>/</span>
        <span className="text-primary">{lesson.title}</span>
      </div>

      <div className="mb-4 lg:hidden">
        <button type="button" onClick={() => setMobileListOpen((open) => !open)} className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold">
          <span className="flex items-center gap-2"><Menu size={16} className="text-primary" /> فهرست درس‌ها <span className="text-xs font-medium text-muted-foreground">({number(allLessons.length)})</span></span>
          {mobileListOpen ? <X size={16} /> : <ChevronDown size={16} />}
        </button>
        {mobileListOpen && <div className="soft-card mt-2 p-2">{lessonList}</div>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="soft-card sticky top-24 hidden max-h-[calc(100dvh-7rem)] overflow-y-auto p-4 lg:block">
          <div className="mb-4 flex items-center justify-between border-b border-border/70 px-2 pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-black"><BookOpen size={17} className="text-primary" /> فهرست درس‌ها</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">{topicTitle} · {number(allLessons.length)} درس</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Layers3 size={16} /></span>
          </div>
          {lessonList}
          <div className="mt-4 rounded-2xl bg-muted/60 p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground"><span>پیشرفت این مسیر</span><span>{number(progress)}٪</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-gradient-to-l from-primary to-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        </aside>

        <article className="min-w-0">
          <header className="soft-card overflow-hidden">
            <div className="h-1.5 bg-gradient-to-l from-primary via-violet-400 to-emerald-300" />
            <div className="p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">{topicTitle}</span>
                <span className="rounded-full bg-muted px-3 py-1.5">{chapterTitle}</span>
              </div>
              <h1 className="mt-5 text-2xl font-black leading-relaxed tracking-tight text-foreground sm:text-4xl">{lesson.title}</h1>
              {lesson.summary && <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{lesson.summary}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock3 size={14} className="text-primary" /> زمان مطالعه: {number(lesson.duration_minutes || 20)} دقیقه</span>
                <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-primary" /> درس {number(Math.max(currentIndex + 1, 1))} از {number(allLessons.length)}</span>
              </div>
            </div>
          </header>

          <div className="soft-card mt-5 overflow-hidden">
            <div role="tablist" aria-label="نوع محتوای درس" className="flex border-b border-border/70 bg-muted/25 p-2">
              <button role="tab" type="button" onClick={() => setActiveTab('lesson')} aria-selected={activeTab === 'lesson'} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-black transition ${activeTab === 'lesson' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><FileText size={16} /> متن درس</button>
              <button role="tab" type="button" onClick={() => setActiveTab('code')} aria-selected={activeTab === 'code'} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-black transition ${activeTab === 'code' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Code2 size={16} /> نمونه‌کدها <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{number(codeSnippets.length)}</span></button>
            </div>

            <div className="p-5 sm:p-8">
              {activeTab === 'lesson' ? (
                <div className="lesson-prose" dangerouslySetInnerHTML={{ __html: renderedContent }} />
              ) : codeSnippets.length > 0 ? (
                <div className="space-y-4">
                  {codeSnippets.map((snippet, index) => (
                    <div key={`${snippet.language}-${index}`} className="overflow-hidden rounded-2xl border border-border bg-[#111827]">
                      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-slate-300">
                        <span className="font-mono uppercase tracking-wider">{snippet.language}</span>
                        <button type="button" onClick={() => void copySnippet(snippet.code, index)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 transition hover:bg-white/10 hover:text-white">
                          {copiedSnippet === index ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                          {copiedSnippet === index ? 'کپی شد' : 'کپی کد'}
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-5 text-left text-sm leading-7 text-slate-100" dir="ltr"><code>{snippet.code}</code></pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
                  <Code2 size={26} className="mx-auto text-muted-foreground/60" />
                  <h3 className="mt-3 font-black">هنوز نمونه‌کدی برای این درس ثبت نشده</h3>
                  <p className="mt-2 text-sm text-muted-foreground">اگر لازم است، نویسنده می‌تواند کد را در متن درس اضافه کند.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-3xl border border-primary/10 bg-gradient-to-l from-primary/[0.06] via-card to-emerald-400/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen size={18} /></span>
              <div><h2 className="text-sm font-black">یادگیری با تمرین کامل می‌شود</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">مثال‌های درس را خودت اجرا کن و نکته‌های مهم را برای مرور یادداشت کن.</p></div>
            </div>
            <Link href={`/tutorials/${topicName}`} className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-primary transition hover:bg-primary/5">بازگشت به سرفصل‌ها <ArrowLeft size={14} /></Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 border-t border-border pt-5">
            {previousLesson ? (
              <Link href={`/tutorials/${topicName}/${previousLesson.slug}`} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-md">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary"><ArrowLeft size={16} className="rotate-180" /></span>
                <span className="min-w-0"><span className="block text-[10px] font-bold text-muted-foreground">درس قبلی</span><span className="mt-1 block truncate text-xs font-black text-foreground group-hover:text-primary">{previousLesson.title}</span></span>
              </Link>
            ) : <span className="hidden sm:block" />}
            {nextLesson ? (
              <Link href={`/tutorials/${topicName}/${nextLesson.slug}`} className="group flex items-center justify-end gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 text-left transition hover:bg-primary/[0.08]">
                <span className="min-w-0 text-right"><span className="block text-[10px] font-bold text-primary">درس بعدی</span><span className="mt-1 block truncate text-xs font-black text-foreground group-hover:text-primary">{nextLesson.title}</span></span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ArrowLeft size={16} /></span>
              </Link>
            ) : (
              <Link href="/tutorials" className="group flex items-center justify-end gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 transition hover:bg-primary/[0.08]">
                <span className="text-right"><span className="block text-[10px] font-bold text-primary">پایان این مسیر</span><span className="mt-1 block text-xs font-black text-foreground group-hover:text-primary">انتخاب موضوع بعدی</span></span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ArrowLeft size={16} /></span>
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
