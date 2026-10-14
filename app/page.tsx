// app/page.tsx
import { Search, ArrowRight, Star, Clock, BookOpen, Code2, Rocket, Users } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function HomePage() {
  // تلاش اول: از ویو v_lessons_full بخوانیم (جدید)
  // اگر ویو وجود نداشت یا خالی بود، از lessons مستقیم
  let latestLessons: any[] | null = null;
  let latestError: any = null;

  const { data: fromView, error: viewError } = await supabase
    .from('v_lessons_full')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('updated_at', { ascending: false })
    .limit(4);

  if (fromView && fromView.length > 0) {
    latestLessons = fromView;
  } else {
    // fallback: جدول lessons با اسکیمای جدید
    const { data: fromLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id, slug, title, summary, duration_minutes, status, is_featured, published_at, updated_at,
        subject_id,
        subjects!lessons_subject_id_fkey ( slug, title ),
        chapters!lessons_chapter_id_fkey ( slug, title )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(4);

    if (fromLessons && fromLessons.length > 0) {
      // نرمال‌سازی به شکل v_lessons_full
      latestLessons = fromLessons.map((l: any) => ({
        ...l,
        subject_slug: l.subjects?.slug || l.subject_slug || 'c',
        subject_title: l.subjects?.title || l.subject_title || '',
        chapter_slug: l.chapters?.slug || l.chapter_slug || '',
      }));
    } else {
      latestError = viewError || lessonsError;
      // آخرین تلاش: اسکیمای قدیمی با tech_slug / lesson_slug (برای سازگاری)
      const { data: legacy } = await supabase
        .from('lessons')
        .select('*')
        .order('id', { ascending: false })
        .limit(4);
      if (legacy && legacy.length > 0 && legacy[0].tech_slug) {
        latestLessons = legacy.map((l: any) => ({
          id: l.id,
          title: l.title,
          slug: l.lesson_slug,
          subject_slug: l.tech_slug,
          summary: l.module,
          duration_minutes: parseInt(l.duration) || 20,
          status: 'published',
        }));
      }
    }
  }

  // موضوعات (subjects) را از دیتابیس بگیر - اگر نبود fallback به هاردکد
  let dbSubjects: any[] = [];
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (subjectsData && subjectsData.length > 0) {
    dbSubjects = subjectsData;
  }

  // اگر دیتابیس موضوع داشت، از آن برای کارت‌های دسته‌بندی استفاده کن
  const categories = dbSubjects.length > 0
    ? dbSubjects.map((s: any) => {
        const iconMap: Record<string, any> = {
          programming: Code2,
          math: BookOpen,
          physics: Rocket,
          other: BookOpen,
        };
        const colorMap: Record<string, string> = {
          blue: 'from-blue-500/20 to-blue-600/20',
          cyan: 'from-cyan-500/20 to-blue-600/20',
          gray: 'from-gray-500/20 to-gray-700/20',
          yellow: 'from-yellow-500/20 to-yellow-600/20',
          violet: 'from-violet-500/20 to-purple-600/20',
          emerald: 'from-emerald-500/20 to-green-600/20',
          orange: 'from-orange-500/20 to-red-600/20',
        };
        return {
          icon: iconMap[s.kind] || Code2,
          title: s.title,
          slug: s.slug,
          description: s.description || '',
          color: colorMap[s.color] || 'from-blue-500/20 to-cyan-600/20',
          kind: s.kind,
        };
      })
    : [
        {
          icon: Code2,
          title: 'زبان C',
          slug: 'c',
          description: 'از صفر تا اشاره‌گرها؛ یادداشت‌های یادگیری زبان C',
          color: 'from-blue-500/20 to-blue-600/20',
        },
        {
          icon: BookOpen,
          title: 'ریاضی',
          slug: 'math',
          description: 'حد، مشتق و انتگرال با فرمول‌نویسی',
          color: 'from-violet-500/20 to-purple-600/20',
        },
        {
          icon: Rocket,
          title: 'فیزیک',
          slug: 'physics',
          description: 'مکانیک و الکتریسیته با مثال',
          color: 'from-emerald-500/20 to-green-600/20',
        },
        {
          icon: Code2,
          title: 'JavaScript',
          slug: 'javascript',
          description: 'Master vanilla JS from basics to advanced concepts',
          color: 'from-yellow-500/20 to-yellow-600/20',
        },
        {
          icon: Rocket,
          title: 'React.js',
          slug: 'react',
          description: 'Build interactive UIs with React components and hooks',
          color: 'from-cyan-500/20 to-blue-600/20',
        },
        {
          icon: BookOpen,
          title: 'Next.js',
          slug: 'nextjs',
          description: 'Full-stack framework for production apps',
          color: 'from-gray-500/20 to-gray-700/20',
        },
      ];

  const featuredTutorials =
    latestLessons && latestLessons.length > 0
      ? latestLessons.map((lesson: any, index: number) => {
          const bgColors = ['bg-yellow-100', 'bg-cyan-100', 'bg-gray-200', 'bg-blue-100', 'bg-violet-100', 'bg-emerald-100'];
          const subjectSlug = lesson.subject_slug || lesson.subjects?.slug || lesson.tech_slug || 'c';
          const lessonSlug = lesson.slug || lesson.lesson_slug;
          const duration = lesson.duration_minutes
            ? `${lesson.duration_minutes} دقیقه`
            : lesson.duration || '20 دقیقه';

          return {
            id: lesson.id,
            title: lesson.title,
            category: lesson.subject_title || subjectSlug,
            level: lesson.summary ? lesson.summary.slice(0, 30) : 'مقدماتی',
            rating: 4.9,
            students: 1200 + index * 400,
            duration,
            image: bgColors[index % bgColors.length],
            href: `/tutorials/${subjectSlug}/${lessonSlug}`,
          };
        })
      : [];

  const learningPaths = [
    {
      title: 'Frontend Developer',
      steps: ['HTML & CSS', 'JavaScript', 'React.js', 'Next.js'],
      duration: '24 weeks',
    },
    {
      title: 'Full-Stack Developer',
      steps: ['Web Basics', 'JavaScript', 'React.js', 'Next.js', 'Backend'],
      duration: '32 weeks',
    },
    {
      title: 'React Expert',
      steps: ['JavaScript', 'React.js', 'State Management', 'Testing'],
      duration: '16 weeks',
    },
  ];

  const hasSupabaseError = !!latestError && (!latestLessons || latestLessons.length === 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-card/30" dir="ltr">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                Learn to Code, <span className="text-primary">Master Web Dev</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Comprehensive tutorials and notes on JavaScript, React, Next.js, and more. From beginner to advanced, learn at your own pace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                  Start Learning <ArrowRight size={18} />
                </button>
                <button className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-card transition-colors">
                  Browse Courses
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-12 border border-border h-80 flex items-center justify-center">
                <div className="text-center">
                  <Code2 size={64} className="text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">Complete Web Development Learning Hub</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 bg-card border border-border rounded-xl p-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">150+</div>
              <p className="text-muted-foreground">Tutorials & Notes</p>
            </div>
            <div className="text-center border-l border-r border-border">
              <div className="text-3xl font-bold text-primary mb-1">50k+</div>
              <p className="text-muted-foreground">Students Learning</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{dbSubjects.length || 6}</div>
              <p className="text-muted-foreground">Topics Covered</p>
            </div>
          </div>

          {hasSupabaseError && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 text-sm text-yellow-700 dark:text-yellow-300">
              <strong>هشدار:</strong> اتصال به Supabase برقرار نشد یا داده‌ای برنگشت. <br />
              بررسی کن: <code className="bg-black/10 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> و{' '}
              <code className="bg-black/10 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> در <code>.env.local</code> ست شده باشد،
              و RLS و seed.sql اجرا شده باشد. خطا: {latestError?.message || 'no data'}
            </div>
          )}
        </div>
      </section>

      {/* Search Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-12">
        <div className="mx-auto max-w-6xl">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tutorials, topics, or keywords..."
              className="w-full pl-12 pr-6 py-3 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-12">Learning Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link href={`/tutorials/${cat.slug}`} key={idx}>
                  <div
                    className={`h-full bg-gradient-to-br ${cat.color} border border-border rounded-xl p-8 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Icon className="text-primary" size={24} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{cat.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{cat.description}</p>
                    <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:translate-x-1 transition-transform mt-auto">
                      Explore <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Tutorials (Dynamic from DB) */}
      {featuredTutorials.length > 0 ? (
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-foreground">Featured Tutorials</h2>
              <Link href="/learning-paths" className="text-primary font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform">
                View All <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTutorials.map((tutorial) => (
                <Link href={tutorial.href} key={tutorial.id}>
                  <div className="h-full bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group flex flex-col">
                    <div className={`${tutorial.image} h-32 group-hover:opacity-80 transition-opacity`} />
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded">
                          {tutorial.category}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground truncate">{tutorial.level}</span>
                      </div>
                      <h3 className="font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {tutorial.title}
                      </h3>
                      <div className="space-y-2 mb-4 text-sm text-muted-foreground mt-auto">
                        <div className="flex items-center gap-2">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span>{tutorial.rating}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{tutorial.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{tutorial.students.toLocaleString()} students</span>
                        </div>
                      </div>
                      <span className="w-full text-center py-2 bg-primary/10 text-primary rounded font-semibold hover:bg-primary hover:text-primary-foreground transition-colors block">
                        Start Tutorial
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 sm:px-6 lg:px-8 mb-20">
          <div className="mx-auto max-w-6xl">
            <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
              <BookOpen className="mx-auto mb-4 text-muted-foreground" size={32} />
              <h3 className="font-bold text-foreground mb-2">هنوز درسی منتشر نشده</h3>
              <p className="text-muted-foreground text-sm">
                اگر Supabase را تازه ساختی، فایل <code>supabase/schema.sql</code> و بعد <code>supabase/seed.sql</code> را در SQL Editor اجرا کن.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Learning Paths */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-12">Recommended Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningPaths.map((path, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-8 hover:shadow-lg hover:border-primary/50 transition-all">
                <h3 className="text-xl font-bold text-foreground mb-4">{path.title}</h3>
                <div className="space-y-3 mb-6">
                  {path.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{stepIdx + 1}</span>
                      </div>
                      <span className="text-foreground">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{path.duration}</span>
                  <button className="text-primary font-semibold flex items-center gap-2 hover:translate-x-1 transition-transform">
                    Start <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20">
        <div className="mx-auto max-w-6xl">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Learning?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students learning web development. Get instant access to all tutorials, notes, and resources.
            </p>
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity text-lg">
              Create Free Account <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
