import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Atom,
  BookOpen,
  Braces,
  CheckCircle2,
  Clock3,
  Compass,
  Cpu,
  ExternalLink,
  Layers3,
  Monitor,
  Route,
  Server,
  Sigma,
  Sparkles,
  Target,
  Terminal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getPublicSubject } from '@/lib/content';
import { countRoadmapSteps, getRoadmap, getRoadmaps, ROADMAP_CATEGORY_LABELS } from '@/lib/roadmaps';

export const dynamic = 'force-dynamic';

const iconByName: Record<string, LucideIcon> = {
  Monitor, Server, Terminal, Braces, Cpu, Sigma, Atom, BookOpen, Compass,
};

function faNumber(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

const heroColors: Record<string, string> = {
  violet: 'from-violet-500/30 to-fuchsia-400/10',
  emerald: 'from-emerald-400/25 to-teal-300/10',
  yellow: 'from-amber-300/30 to-orange-300/10',
  blue: 'from-blue-500/25 to-cyan-400/10',
};

export default async function RoadmapDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roadmap = getRoadmap(slug.toLowerCase());
  if (!roadmap) notFound();

  const subject = await getPublicSubject(roadmap.slug);
  const Icon = iconByName[roadmap.icon] || Compass;
  const steps = countRoadmapSteps(roadmap);
  const firstLinked = roadmap.stages.flatMap((stage) => stage.steps).find((step) => step.lesson);
  const allRoadmaps = getRoadmaps();
  const related = allRoadmaps.filter((item) => item.category === roadmap.category && item.slug !== roadmap.slug).slice(0, 3);
  const theme = heroColors[roadmap.color] || heroColors.violet;

  return (
    <div className="page-container page-shell" dir="rtl">
      <section className={`relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-border/60 bg-gradient-to-br ${theme} px-5 py-8 sm:px-10 sm:py-11`}>
        <div className="absolute -left-12 -top-16 size-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
              <Link href="/learning-paths" className="transition hover:text-primary">نقشه‌ی راه‌ها</Link>
              <span>/</span>
              <span className="text-primary">{roadmap.title}</span>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/60 bg-card/60 px-3 py-1.5 text-[11px] font-black text-primary shadow-sm backdrop-blur"><Sparkles size={13} /> {ROADMAP_CATEGORY_LABELS[roadmap.category]} · نقشه‌ی راه CodeMage</span>
            <h1 className="mt-4 page-heading text-foreground">{roadmap.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">{roadmap.description}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3.5 py-2"><Layers3 size={14} className="text-primary" />{faNumber(roadmap.stages.length)} مرحله</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3.5 py-2"><Route size={14} className="text-primary" />{faNumber(steps)} گام عملی</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-3.5 py-2"><Clock3 size={14} className="text-primary" />حدود {faNumber(roadmap.estimatedHours)} ساعت</span>
              <span className="rounded-full border border-border/70 bg-card/75 px-3.5 py-2">{roadmap.level}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col">
            <span className="flex size-28 items-center justify-center rounded-3xl sm:rounded-[2rem] border border-white/70 bg-card/70 text-primary shadow-xl shadow-primary/10 backdrop-blur"><Icon size={48} strokeWidth={1.5} /></span>
            {firstLinked?.lesson ? (
              <Link href={`/tutorials/${firstLinked.lesson.subject}/${firstLinked.lesson.slug}`} className="button-primary w-full text-center sm:w-auto lg:w-full">
                <Target size={16} /> شروع اولین گام
              </Link>
            ) : (
              <a href="#stages" className="button-primary w-full text-center sm:w-auto lg:w-full"><Target size={16} /> دیدن مراحل</a>
            )}
            {subject && (
              <Link href={`/tutorials/${subject.subject.slug}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-card/70 px-5 py-3 text-xs font-black text-primary transition hover:gap-3">
                <BookOpen size={15} /> درس‌های «{subject.subject.title}»
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="stages" className="mt-12">
        <div>
          <span className="section-kicker"><Route size={14} /> مسیر قدم‌به‌قدم</span>
          <h2 className="section-title">از کجا شروع کنیم و به کجا برسیم؟</h2>
          <p className="section-copy">هر مرحله یک هدف روشن دارد؛ گام‌ها را به ترتیب برو یا هر کدام را که لازم داری بردار. گام‌های متصل به درس، مستقیم به محتوای سایت می‌روند.</p>
        </div>

        <div className="relative mt-8 space-y-6">
          {roadmap.stages.map((stage, stageIndex) => (
            <div key={stage.title} className="relative">
              {stageIndex < roadmap.stages.length - 1 && (
                <span className="absolute right-[27px] top-[4.2rem] bottom-[-1.5rem] hidden w-px bg-primary/15 sm:block" />
              )}
              <div className="soft-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-muted/35 px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${stageIndex === 0 ? 'bg-primary text-primary-foreground' : 'border border-primary/20 bg-primary/5 text-primary'}`}>{faNumber(stageIndex + 1)}</span>
                    <div>
                      <h3 className="text-base font-black tracking-tight sm:text-lg">{stage.title}</h3>
                      <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">{stage.goal}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold text-muted-foreground"><Clock3 size={12} className="text-primary" /> {stage.duration}</span>
                </div>

                <div className="divide-y divide-border/65 px-4 sm:px-6">
                  {stage.steps.map((step, stepIndex) => (
                    <div key={step.title} className="flex flex-wrap items-start gap-3 py-4 sm:gap-4 sm:py-5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-[11px] font-black text-muted-foreground shadow-sm">
                        {faNumber(stageIndex + 1)}.{faNumber(stepIndex + 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        {step.lesson ? (
                          <Link href={`/tutorials/${step.lesson.subject}/${step.lesson.slug}`} className="group inline-flex items-center gap-2 text-sm font-black text-foreground transition hover:text-primary sm:text-base">
                            {step.title}
                            <ExternalLink size={13} className="opacity-50 transition group-hover:opacity-100" />
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">درس در سایت</span>
                          </Link>
                        ) : (
                          <h4 className="text-sm font-black text-foreground sm:text-base">{step.title}</h4>
                        )}
                        <p className="mt-1 text-xs leading-6 text-muted-foreground">{step.description}</p>
                        {step.skills.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {step.skills.map((skill) => (
                              <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-primary/[0.07] px-2.5 py-1 text-[10px] font-bold text-primary"><CheckCircle2 size={11} /> {skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl sm:rounded-[2rem] border border-border/70 bg-card p-6 sm:p-9">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <span className="section-kicker"><Compass size={14} /> مسیرهای هم‌خانواده</span>
            <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">ادامه بده؛ مسیرهای دیگر هم منتظرند</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">هر وقت خواستی شاخه‌ی دیگری را هم امتحان کن، از همین‌جا شروع کن.</p>
          </div>
          <Link href="/learning-paths" className="button-primary shrink-0"><ArrowLeft size={16} /> همه‌ی نقشه‌ی راه‌ها</Link>
        </div>
        {related.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {related.map((item) => {
              const RelatedIcon = iconByName[item.icon] || Compass;
              return (
                <Link key={item.slug} href={`/learning-paths/${item.slug}`} className="group flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-4 transition hover:border-primary/30 hover:shadow-md">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><RelatedIcon size={17} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-foreground group-hover:text-primary">{item.title}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{ROADMAP_CATEGORY_LABELS[item.category]} · {faNumber(item.stages.length)} مرحله</span>
                  </span>
                  <ArrowLeft size={15} className="shrink-0 text-muted-foreground transition group-hover:-translate-x-1 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
