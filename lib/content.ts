import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings, type SiteSettings } from '@/lib/site-settings';

export type PublicSubject = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  kind: string;
  level: string | null;
  order_index: number;
  is_published?: boolean;
  chapters_count?: number;
  lessons_count?: number;
  total_minutes?: number;
};

export type PublicChapter = {
  id: string;
  subject_id: string;
  slug: string;
  title: string;
  description: string | null;
  order_index: number;
  is_published?: boolean;
};

export type PublicLesson = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  duration_minutes: number | null;
  status: 'draft' | 'published';
  is_featured: boolean;
  order_index: number;
  published_at?: string | null;
  updated_at?: string | null;
  chapter_id: string;
  subject_id: string;
  chapter_slug?: string;
  chapter_title?: string;
  subject_slug?: string;
  subject_title?: string;
  subject_icon?: string | null;
  subject_color?: string | null;
};

export type PublicSubjectContent = {
  subject: PublicSubject;
  chapters: PublicChapter[];
  lessons: PublicLesson[];
};

export type PublicStats = {
  subjects_count: number;
  chapters_count: number;
  lessons_count: number;
  exercises_count: number;
  total_minutes: number;
  total_views: number;
};

const DEMO_SUBJECTS: PublicSubject[] = [
  {
    id: 'demo-c', slug: 'c', title: 'زبان C',
    description: 'از اولین برنامه تا حافظه و اشاره‌گرها؛ با مثال‌های کوتاه و روشن.',
    icon: 'Braces', color: 'blue', kind: 'programming', level: 'مقدماتی تا پیشرفته',
    order_index: 1, is_published: true, chapters_count: 1, lessons_count: 1, total_minutes: 15,
  },
  {
    id: 'demo-math', slug: 'math', title: 'ریاضی',
    description: 'حد، مشتق و انتگرال؛ با فرمول‌نویسی ساده و مثال‌های قدم‌به‌قدم.',
    icon: 'Sigma', color: 'violet', kind: 'math', level: 'مقدماتی',
    order_index: 2, is_published: true, chapters_count: 1, lessons_count: 1, total_minutes: 20,
  },
  {
    id: 'demo-physics', slug: 'physics', title: 'فیزیک',
    description: 'مکانیک و الکتریسیته را با فرمول و مسئله‌ی حل‌شده یاد بگیر.',
    icon: 'Atom', color: 'emerald', kind: 'physics', level: 'مقدماتی',
    order_index: 3, is_published: true, chapters_count: 1, lessons_count: 1, total_minutes: 25,
  },
];

const DEMO_CHAPTERS: PublicChapter[] = [
  { id: 'demo-ch-c', subject_id: 'demo-c', slug: 'getting-started', title: 'شروع کار', description: 'اولین قدم‌ها در زبان C', order_index: 1 },
  { id: 'demo-ch-math', subject_id: 'demo-math', slug: 'limits', title: 'حد و پیوستگی', description: 'مفهوم حد و روش محاسبه‌ی آن', order_index: 1 },
  { id: 'demo-ch-physics', subject_id: 'demo-physics', slug: 'mechanics', title: 'مکانیک', description: 'حرکت، نیرو و قوانین نیوتن', order_index: 1 },
];

const DEMO_LESSONS: PublicLesson[] = [
  {
    id: 'demo-lesson-c', slug: 'first-program', title: 'اولین برنامه در C',
    summary: 'زبان C چیست و اولین برنامه را چطور بنویسیم و اجرا کنیم؟',
    content: [
      '## زبان C چیست؟',
      '',
      '**C** یک زبان برنامه‌نویسی قدرتمند است که برای ساخت سیستم‌عامل‌ها، ابزارها و برنامه‌های سریع استفاده می‌شود. یادگیری آن کمک می‌کند حافظه و نحوه‌ی اجرای برنامه‌ها را بهتر بشناسی.',
      '',
      '## اولین برنامه',
      '',
      '```c',
      '#include <stdio.h>',
      '',
      'int main(void) {',
      '    printf("سلام دنیا!\\n");',
      '    return 0;',
      '}',
      '```',
      '',
      'تابع `main` نقطه‌ی شروع برنامه است و `printf` متن را روی صفحه نمایش می‌دهد.',
    ].join(String.fromCharCode(10)),
    duration_minutes: 15, status: 'published', is_featured: true, order_index: 1,
    chapter_id: 'demo-ch-c', subject_id: 'demo-c', chapter_slug: 'getting-started', chapter_title: 'شروع کار', subject_slug: 'c', subject_title: 'زبان C',
  },
  {
    id: 'demo-lesson-math', slug: 'limit-intro', title: 'مفهوم حد',
    summary: 'حد چیست و چطور آن را حساب کنیم؟',
    content: [
      '## حد یعنی چه؟',
      '',
      'حد نشان می‌دهد وقتی `x` به یک عدد نزدیک می‌شود، مقدار تابع به چه چیزی نزدیک خواهد شد.',
      '',
      '```text',
      'lim (3x + 1), x → 2 = 7',
      '```',
      '',
      'اگر عبارت را ساده کنیم، محاسبه‌ی حد معمولاً خیلی روشن‌تر می‌شود.',
    ].join(String.fromCharCode(10)),
    duration_minutes: 20, status: 'published', is_featured: true, order_index: 1,
    chapter_id: 'demo-ch-math', subject_id: 'demo-math', chapter_slug: 'limits', chapter_title: 'حد و پیوستگی', subject_slug: 'math', subject_title: 'ریاضی',
  },
  {
    id: 'demo-lesson-physics', slug: 'newton-laws', title: 'قوانین نیوتن',
    summary: 'سه قانون اصلی حرکت و مثال‌هایشان.',
    content: [
      '## قانون دوم نیوتن',
      '',
      'نیروی خالص وارد بر یک جسم برابر است با جرم آن ضرب‌در شتاب: `F = ma`.',
      '',
      '```text',
      'جرم: ۲ کیلوگرم',
      'شتاب: ۳ متر بر مجذور ثانیه',
      'نیرو: ۲ × ۳ = ۶ نیوتن',
      '```',
      '',
      'همیشه یکاها را هم کنار پاسخ بنویس تا نتیجه کامل باشد.',
    ].join(String.fromCharCode(10)),
    duration_minutes: 25, status: 'published', is_featured: false, order_index: 1,
    chapter_id: 'demo-ch-physics', subject_id: 'demo-physics', chapter_slug: 'mechanics', chapter_title: 'مکانیک', subject_slug: 'physics', subject_title: 'فیزیک',
  },
];

export async function getPublicSettings(): Promise<SiteSettings> {
  if (!hasSupabaseConfig) return DEFAULT_SITE_SETTINGS;

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['site.brand', 'home.hero', 'home.cta', 'footer.newsletter']);

    if (error || !data) return DEFAULT_SITE_SETTINGS;
    return mergeSiteSettings(data as Array<{ key: string; value: unknown }>);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getPublicSubjects(): Promise<PublicSubject[]> {
  if (!hasSupabaseConfig) return DEMO_SUBJECTS;

  try {
    const { data, error } = await supabase
      .from('v_subject_outline')
      .select('id, slug, title, description, icon, color, kind, level, order_index, is_published, chapters_count, lessons_count, total_minutes')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (!error && data) return data as PublicSubject[];

    const { data: fallbackData, error: fallbackError } = await supabase
      .from('subjects')
      .select('id, slug, title, description, icon, color, kind, level, order_index, is_published')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (!fallbackError && fallbackData) return fallbackData as PublicSubject[];
  } catch {
    // The demo below makes a fresh installation previewable without a database.
  }

  return DEMO_SUBJECTS;
}

export async function getPublicLessonIndex(limit = 300): Promise<PublicLesson[]> {
  if (!hasSupabaseConfig) return DEMO_LESSONS;

  try {
    const { data, error } = await supabase
      .from('v_lessons_full')
      .select('id, slug, title, summary, duration_minutes, status, is_featured, order_index, published_at, updated_at, chapter_id, chapter_slug, chapter_title, subject_id, subject_slug, subject_title, subject_icon, subject_color')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('order_index', { ascending: true })
      .limit(limit);

    if (!error && data) return data.map((lesson) => ({ ...lesson, content: '' })) as PublicLesson[];

    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, slug, title, summary, duration_minutes, status, is_featured, order_index, published_at, updated_at, chapter_id, subject_id')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('order_index', { ascending: true })
      .limit(limit);

    if (lessonsError || !lessonsData) return DEMO_LESSONS;

    const [{ data: subjects }, { data: chapters }] = await Promise.all([
      supabase.from('subjects').select('id, slug, title, icon, color').eq('is_published', true),
      supabase.from('chapters').select('id, slug, title, subject_id').eq('is_published', true),
    ]);
    const subjectById = new Map((subjects || []).map((subject: Record<string, string>) => [subject.id, subject]));
    const chapterById = new Map((chapters || []).map((chapter: Record<string, string>) => [chapter.id, chapter]));

    return lessonsData.map((lesson: Record<string, unknown>) => {
      const subject = subjectById.get(String(lesson.subject_id));
      const chapter = chapterById.get(String(lesson.chapter_id));
      return {
        ...lesson,
        content: '',
        subject_slug: subject?.slug,
        subject_title: subject?.title,
        subject_icon: subject?.icon,
        subject_color: subject?.color,
        chapter_slug: chapter?.slug,
        chapter_title: chapter?.title,
      } as PublicLesson;
    });
  } catch {
    return DEMO_LESSONS;
  }
}

export async function getLatestLessons(limit = 4): Promise<PublicLesson[]> {
  const lessons = await getPublicLessonIndex(Math.max(limit, 50));
  return lessons.slice(0, limit);
}

export async function getPublicSubject(slug: string): Promise<PublicSubjectContent | null> {
  if (!hasSupabaseConfig) {
    const subject = DEMO_SUBJECTS.find((item) => item.slug === slug);
    if (!subject) return null;
    return {
      subject,
      chapters: DEMO_CHAPTERS.filter((chapter) => chapter.subject_id === subject.id),
      lessons: DEMO_LESSONS.filter((lesson) => lesson.subject_id === subject.id),
    };
  }

  try {
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, slug, title, description, icon, color, kind, level, order_index, is_published')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (subjectError) {
      const fallback = DEMO_SUBJECTS.find((item) => item.slug === slug);
      if (fallback) {
        return {
          subject: fallback,
          chapters: DEMO_CHAPTERS.filter((chapter) => chapter.subject_id === fallback.id),
          lessons: DEMO_LESSONS.filter((lesson) => lesson.subject_id === fallback.id),
        };
      }
      return null;
    }
    if (!subject) return null;

    const [{ data: chaptersData }, { data: lessonsData }] = await Promise.all([
      supabase
        .from('chapters')
        .select('id, subject_id, slug, title, description, order_index, is_published')
        .eq('subject_id', subject.id)
        .eq('is_published', true)
        .order('order_index', { ascending: true }),
      supabase
        .from('lessons')
        .select('id, slug, title, summary, content, duration_minutes, status, is_featured, order_index, published_at, updated_at, chapter_id, subject_id')
        .eq('subject_id', subject.id)
        .eq('status', 'published')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true }),
    ]);

    const chapters = (chaptersData || []) as PublicChapter[];
    const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
    const lessons = ((lessonsData || []) as PublicLesson[]).map((lesson) => {
      const chapter = chapterById.get(lesson.chapter_id);
      return {
        ...lesson,
        subject_slug: subject.slug,
        subject_title: subject.title,
        subject_icon: subject.icon,
        subject_color: subject.color,
        chapter_slug: chapter?.slug,
        chapter_title: chapter?.title,
      };
    });

    return {
      subject: subject as PublicSubject,
      chapters,
      lessons,
    };
  } catch {
    const fallback = DEMO_SUBJECTS.find((item) => item.slug === slug);
    if (!fallback) return null;
    return {
      subject: fallback,
      chapters: DEMO_CHAPTERS.filter((chapter) => chapter.subject_id === fallback.id),
      lessons: DEMO_LESSONS.filter((lesson) => lesson.subject_id === fallback.id),
    };
  }
}

export async function getPublicStats(): Promise<PublicStats> {
  if (!hasSupabaseConfig) {
    return { subjects_count: 3, chapters_count: 3, lessons_count: 3, exercises_count: 0, total_minutes: 60, total_views: 0 };
  }

  try {
    const { data, error } = await supabase.from('v_site_stats').select('*').maybeSingle();
    if (!error && data) return data as PublicStats;
  } catch {
    // Fall through to counts computed from public subjects.
  }

  const subjects = await getPublicSubjects();
  return {
    subjects_count: subjects.length,
    chapters_count: subjects.reduce((sum, subject) => sum + (subject.chapters_count || 0), 0),
    lessons_count: subjects.reduce((sum, subject) => sum + (subject.lessons_count || 0), 0),
    exercises_count: 0,
    total_minutes: subjects.reduce((sum, subject) => sum + (subject.total_minutes || 0), 0),
    total_views: 0,
  };
}

export const demoSiteSettings = DEFAULT_SITE_SETTINGS;
