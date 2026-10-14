// app/tutorials/[name]/page.tsx
import { CheckCircle, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function TutorialListPage({ params }: { params: { name: string } }) {
  const { name } = await params;
  const topicName = name.toLowerCase();

  // ۱) موضوع را از جدول subjects بگیر (اسکیمای جدید)
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', topicName)
    .eq('is_published', true)
    .single();

  // اگر موضوع پیدا نشد، تلاش کن اسکیمای قدیمی را هم چک کنی (tech_slug)
  let lessons: any[] = [];
  let chapters: any[] = [];
  let meta: any = null;

  if (subject) {
    meta = {
      title: subject.title,
      description: subject.description,
      color: subject.color || 'blue',
      kind: subject.kind,
    };

    // سرفصل‌ها
    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', subject.id)
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    chapters = chaptersData || [];

    // درس‌ها
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject_id', subject.id)
      .eq('status', 'published')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    lessons = lessonsData || [];
  } else {
    // fallback قدیمی: اگر subjects نبود، از lessons با tech_slug استفاده کن
    const { data: legacyLessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('tech_slug', topicName)
      .order('id', { ascending: true });

    if (legacyLessons && legacyLessons.length > 0) {
      lessons = legacyLessons.map((l: any) => ({
        id: l.id,
        slug: l.lesson_slug,
        title: l.title,
        summary: l.module,
        duration_minutes: parseInt(l.duration) || 20,
        chapter_id: null,
      }));
      meta = {
        title: topicName.charAt(0).toUpperCase() + topicName.slice(1),
        description: 'دوره آموزشی',
        color: 'yellow',
      };
    }
  }

  if (!meta || (!lessons.length && !subjectError)) {
    // اگر واقعاً چیزی نیست، صفحه not found دوستانه
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-card/30 px-4 py-20" dir="ltr">
        <div className="max-w-6xl mx-auto text-center">
          <BookOpen className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h1 className="text-4xl font-bold text-foreground mb-4">Tutorial Not Found</h1>
          <p className="text-muted-foreground mb-2">موضوع "{topicName}" پیدا نشد یا هنوز درسی برایش منتشر نشده.</p>
          {subjectError && (
            <p className="text-xs text-muted-foreground mb-8">Supabase error: {subjectError.message}</p>
          )}
          <div className="bg-card border border-border rounded-lg p-6 text-left max-w-xl mx-auto mb-8">
            <h3 className="font-bold mb-2">برای رفع مشکل:</h3>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>مطمئن شو <code>supabase/schema.sql</code> را اجرا کرده‌ای</li>
              <li>بعد <code>supabase/seed.sql</code> را اجرا کن تا داده نمونه (c, math, physics) بیاید</li>
              <li>یا اگر داده قدیمی (javascript, react...) داری، از اسکریپت seed جدید استفاده کن</li>
              <li>چک کن RLS برای anon اجازه خواندن lessons و subjects را می‌دهد</li>
            </ol>
          </div>
          <Link href="/" className="text-primary hover:text-primary/80">← Back to Home</Link>
        </div>
      </main>
    );
  }

  // گروه‌بندی درس‌ها بر اساس chapter
  const grouped: Record<string, { chapter: any; lessons: any[] }> = {};

  if (chapters.length > 0) {
    chapters.forEach((ch) => {
      grouped[ch.id] = { chapter: ch, lessons: [] };
    });
    lessons.forEach((ls) => {
      const chId = ls.chapter_id;
      if (chId && grouped[chId]) {
        grouped[chId].lessons.push(ls);
      } else {
        // اگر chapter_id نداشت، بریز در گروه اول یا گروه بدون سرفصل
        const firstKey = Object.keys(grouped)[0];
        if (firstKey) grouped[firstKey].lessons.push(ls);
        else {
          if (!grouped['no-chapter']) grouped['no-chapter'] = { chapter: { title: 'عمومی', slug: 'general' }, lessons: [] };
          grouped['no-chapter'].lessons.push(ls);
        }
      }
    });
  } else {
    // اگر سرفصلی نبود، همه را بر اساس module یا یک گروه بریز
    const byModule: Record<string, any[]> = {};
    lessons.forEach((l: any) => {
      const mod = l.summary || l.module || 'General';
      if (!byModule[mod]) byModule[mod] = [];
      byModule[mod].push(l);
    });
    Object.entries(byModule).forEach(([mod, items]) => {
      grouped[mod] = { chapter: { title: mod, slug: mod }, lessons: items };
    });
  }

  const topics = Object.values(grouped)
    .filter((g) => g.lessons.length > 0)
    .map((g) => ({
      level: g.chapter.title,
      slug: g.chapter.slug,
      description: g.chapter.description,
      items: g.lessons.map((item: any) => ({
        id: item.slug || item.lesson_slug,
        title: item.title,
        duration: item.duration_minutes ? `${item.duration_minutes} دقیقه` : item.duration || '20 دقیقه',
      })),
    }));

  const colorClasses: Record<string, string> = {
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/20 text-yellow-500',
    cyan: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/20 text-cyan-500',
    gray: 'from-gray-500/20 to-gray-700/20 border-gray-500/20 text-gray-500',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-500',
    violet: 'from-violet-500/20 to-purple-600/20 border-violet-500/20 text-violet-500',
    emerald: 'from-emerald-500/20 to-green-600/20 border-emerald-500/20 text-emerald-500',
    orange: 'from-orange-500/20 to-red-600/20 border-orange-500/20 text-orange-500',
  };

  const colors = colorClasses[meta.color] || colorClasses.blue;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-card/30" dir="ltr">
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
              Master <span className={`${colors.split(' ')[3]}`}>{meta.title}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">{meta.description}</p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><BookOpen size={16} /> {lessons.length} درس</span>
              <span className="flex items-center gap-2"><Clock size={16} /> {chapters.length} سرفصل</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-12">
            {topics.map((section: any, idx: number) => (
              <div key={idx}>
                <h2 className="text-2xl font-bold text-foreground mb-2">{section.level}</h2>
                {section.description && <p className="text-muted-foreground mb-6">{section.description}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item: any) => (
                    <Link key={item.id} href={`/tutorials/${topicName}/${item.id}`}>
                      <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group h-full">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Lesson</span>
                          <span>{item.duration}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
