import Link from 'next/link';
import { ArrowLeft, BookOpen, Check, Clock3, Compass, Layers3, Sparkles, Target } from 'lucide-react';
import { getPublicSubject, getPublicSubjects } from '@/lib/content';

export const dynamic = 'force-dynamic';

function faNumber(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

export default async function LearningPathsPage() {
  const subjects = await getPublicSubjects();
  const paths = await Promise.all(subjects.map(async (subject) => ({
    subject,
    content: await getPublicSubject(subject.slug),
  })));

  return (
    <div className="page-container page-shell" dir="rtl">
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-[#121d32] px-5 py-8 text-white sm:px-10 sm:py-14">
        <div className="absolute -left-16 -top-20 size-72 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 size-56 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative z-10 grid gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-bold text-white/80"><Compass size={14} className="text-[#b7f486]" /> نقشه‌ی راه تو</span>
            <h1 className="mt-5 max-w-2xl page-heading">یادگیریِ هدفمند، با مسیر روشن</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/65 sm:text-base">هر موضوع را به فصل‌های کوتاه و قابل‌پیشرفت تقسیم کرده‌ایم. از اولین قدم شروع کن و با ریتم خودت جلو برو.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5 backdrop-blur">
              <span className="flex size-10 items-center justify-center rounded-xl bg-violet-300/15 text-violet-200"><Layers3 size={19} /></span>
              <span className="mt-4 block text-2xl font-black">{faNumber(subjects.length)}</span>
              <span className="mt-1 block text-xs font-semibold text-white/55">مسیر برای انتخاب</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 sm:p-5 backdrop-blur">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#b7f486]/15 text-[#b7f486]"><Target size={19} /></span>
              <span className="mt-4 block text-xl font-black sm:text-2xl">قدم‌به‌قدم</span>
              <span className="mt-1 block text-xs font-semibold text-white/55">بدون عجله و فشار</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="section-kicker"><Sparkles size={14} /> مسیرهای پیشنهادی</span>
            <h2 className="section-title">بر اساس موضوع مورد علاقه‌ات</h2>
            <p className="section-copy">این نقشه‌ها از فصل‌ها و درس‌های منتشرشده‌ی سایت ساخته می‌شوند و با محتوای تازه به‌روز می‌مانند.</p>
          </div>
          <Link href="/tutorials" className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-3 text-sm font-extrabold text-primary transition hover:gap-3 sm:self-auto">همه‌ی موضوع‌ها <ArrowLeft size={16} /></Link>
        </div>

        {paths.length > 0 ? (
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {paths.map(({ subject, content }, pathIndex) => {
              const chapters = content?.chapters || [];
              const lessons = content?.lessons || [];
              const totalMinutes = subject.total_minutes || lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0);
              const stepCount = Math.max(chapters.length, 1);
              const firstLesson = lessons[0];

              return (
                <article key={subject.id} className="soft-card overflow-hidden">
                  <div className="relative overflow-hidden bg-gradient-to-l from-primary/10 via-primary/[0.04] to-emerald-400/10 p-5 sm:p-7">
                    <div className="absolute -left-8 -top-10 size-36 rounded-full border border-primary/10" />
                    <div className="relative flex flex-col items-start gap-5">
                      <div className="flex items-start gap-4">
                        <span className="flex size-11 shrink-0 sm:size-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm dark:bg-slate-800"><Compass size={25} /></span>
                        <div>
                          <span className="text-[10px] font-black tracking-[0.18em] text-primary">PATH {String(pathIndex + 1).padStart(2, '0')}</span>
                          <h3 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">{subject.title}</h3>
                          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{subject.description || `مسیر یادگیری ${subject.title}، از پایه تا قدم‌های پیشرفته‌تر.`}</p>
                        </div>
                      </div>
                      <Link href={firstLesson ? `/tutorials/${subject.slug}/${firstLesson.slug}` : `/tutorials/${subject.slug}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground transition hover:gap-3">شروع مسیر <ArrowLeft size={14} /></Link>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2 border-t border-primary/10 pt-4 text-xs font-bold text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-card/75 px-3 py-1.5"><Layers3 size={13} className="text-primary" /> {faNumber(stepCount)} فصل</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-card/75 px-3 py-1.5"><BookOpen size={13} className="text-primary" /> {faNumber(lessons.length || subject.lessons_count || 0)} درس</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-card/75 px-3 py-1.5"><Clock3 size={13} className="text-primary" /> حدود {faNumber(Math.ceil(totalMinutes / 60))} ساعت</span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7">
                    {chapters.length > 0 ? (
                      <div className="relative space-y-4">
                        {chapters.map((chapter, chapterIndex) => {
                          const chapterLessons = lessons.filter((lesson) => lesson.chapter_id === chapter.id);
                          return (
                            <div key={chapter.id} className="relative flex gap-4">
                              {chapterIndex < chapters.length - 1 && <span className="absolute right-[17px] bottom-[-1rem] top-9 w-px bg-primary/15" />}
                              <span className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${chapterIndex === 0 ? 'bg-primary text-primary-foreground' : 'border border-primary/15 bg-primary/5 text-primary'}`}>{faNumber(chapterIndex + 1)}</span>
                              <div className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-background/70 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-black text-foreground">{chapter.title}</h4>
                                    {chapter.description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{chapter.description}</p>}
                                  </div>
                                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">{faNumber(chapterLessons.length)} درس</span>
                                </div>
                                {chapterLessons.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {chapterLessons.slice(0, 3).map((lesson) => (
                                      <Link key={lesson.id} href={`/tutorials/${subject.slug}/${lesson.slug}`} className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-primary/[0.06] px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"><Check size={12} /><span className="truncate">{lesson.title}</span></Link>
                                    ))}
                                    {chapterLessons.length > 3 && <span className="px-1 py-1.5 text-[10px] font-bold text-muted-foreground">+{faNumber(chapterLessons.length - 3)} درس دیگر</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm leading-7 text-muted-foreground">فصل‌های این موضوع به‌زودی اضافه می‌شوند. فعلاً می‌توانی فهرست درس‌های منتشرشده را ببینی.</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="soft-card mt-7 p-10 text-center">
            <BookOpen className="mx-auto text-muted-foreground" size={30} />
            <p className="mt-3 text-sm text-muted-foreground">هنوز مسیر یادگیری منتشر نشده است.</p>
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-4 rounded-3xl sm:rounded-[2rem] border border-border/70 bg-card p-6 sm:grid-cols-3 sm:p-8">
        {[
          { title: 'یک موضوع انتخاب کن', text: 'از میان موضوع‌های در دسترس، مورد علاقه‌ات را بردار.', icon: Compass },
          { title: 'فصل‌ها را دنبال کن', text: 'محتوا به بخش‌های کوچک تقسیم شده تا راحت‌تر پیش بروی.', icon: Layers3 },
          { title: 'با تمرین تثبیت کن', text: 'مثال‌ها را خودت اجرا کن و آموخته‌ها را مرور کن.', icon: Target },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className={`rounded-2xl p-4 ${index === 1 ? 'bg-primary/[0.045] sm:border-x sm:border-border/70' : ''}`}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={18} /></span>
              <h3 className="mt-4 text-sm font-black">{item.title}</h3>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.text}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
