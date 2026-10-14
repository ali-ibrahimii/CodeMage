// app/tutorials/[name]/[lessonId]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import LessonClient from './LessonClient';

export default async function LessonPage({ params }: { params: { name: string; lessonId: string } }) {
  const { name, lessonId } = await params;
  const topicName = name.toLowerCase();

  // تلاش اول: از ویو v_lessons_full بخوان (جدیدترین و کامل‌ترین)
  const { data: lessonFromView, error: viewError } = await supabase
    .from('v_lessons_full')
    .select('*')
    .eq('subject_slug', topicName)
    .eq('slug', lessonId)
    .eq('status', 'published')
    .single();

  let lesson: any = lessonFromView;
  let subjectId: string | null = lessonFromView?.subject_id || null;

  if (!lesson) {
    // fallback: مستقیم از lessons با join به subjects
    // اول subject را پیدا کن
    const { data: subject } = await supabase.from('subjects').select('id').eq('slug', topicName).single();
    if (subject) {
      subjectId = subject.id;
      const { data: directLesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subject.id)
        .eq('slug', lessonId)
        .eq('status', 'published')
        .single();
      lesson = directLesson;
    }
  }

  if (!lesson) {
    // آخرین fallback: اسکیمای قدیمی tech_slug / lesson_slug
    const { data: legacyLesson } = await supabase
      .from('lessons')
      .select('*')
      .eq('tech_slug', topicName)
      .eq('lesson_slug', lessonId)
      .single();

    if (legacyLesson) {
      lesson = {
        id: legacyLesson.id,
        slug: legacyLesson.lesson_slug,
        title: legacyLesson.title,
        content: legacyLesson.content,
        summary: legacyLesson.module,
        duration_minutes: parseInt(legacyLesson.duration) || 20,
        subject_slug: legacyLesson.tech_slug,
        subject_title: topicName,
        chapter_title: legacyLesson.module,
        chapter_slug: legacyLesson.module,
      };
      // برای سایدبار
      const { data: legacyAll } = await supabase
        .from('lessons')
        .select('lesson_slug, title, duration')
        .eq('tech_slug', topicName)
        .order('id', { ascending: true });

      const allLessons = (legacyAll || []).map((l: any) => ({
        slug: l.lesson_slug,
        lesson_slug: l.lesson_slug,
        title: l.title,
        duration: l.duration,
        duration_minutes: parseInt(l.duration) || 20,
      }));

      return <LessonClient lesson={lesson} allLessons={allLessons} topicName={topicName} lessonId={lessonId} />;
    }

    console.error('[LessonPage] درس پیدا نشد:', { topicName, lessonId, viewError });
    return notFound();
  }

  // اگر از view خوانده‌ایم، subjectId را داریم، اگر نه از lesson
  if (!subjectId && lesson.subject_id) subjectId = lesson.subject_id;

  // لیست تمام درس‌های این موضوع برای سایدبار
  let allLessons: any[] = [];
  if (subjectId) {
    const { data: all } = await supabase
      .from('lessons')
      .select('slug, title, duration_minutes, order_index, chapter_id')
      .eq('subject_id', subjectId)
      .eq('status', 'published')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    allLessons = (all || []).map((l: any) => ({
      slug: l.slug,
      lesson_slug: l.slug,
      title: l.title,
      duration: l.duration_minutes ? `${l.duration_minutes} دقیقه` : '20 دقیقه',
      duration_minutes: l.duration_minutes,
    }));
  } else {
    // اگر subjectId نداریم، از view دوباره بگیریم
    const { data: allFromView } = await supabase
      .from('v_lessons_full')
      .select('slug, title, duration_minutes, order_index')
      .eq('subject_slug', topicName)
      .eq('status', 'published')
      .order('order_index', { ascending: true });

    allLessons = (allFromView || []).map((l: any) => ({
      slug: l.slug,
      lesson_slug: l.slug,
      title: l.title,
      duration: l.duration_minutes ? `${l.duration_minutes} دقیقه` : '20 دقیقه',
      duration_minutes: l.duration_minutes,
    }));
  }

  // نرمال‌سازی lesson برای LessonClient
  const normalizedLesson = {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    content: lesson.content,
    summary: lesson.summary,
    duration: lesson.duration_minutes ? `${lesson.duration_minutes} دقیقه` : lesson.duration || '20 دقیقه',
    duration_minutes: lesson.duration_minutes,
    module: lesson.chapter_title || lesson.summary || lesson.module || 'عمومی',
    subject_slug: lesson.subject_slug || topicName,
    subject_title: lesson.subject_title || topicName,
    chapter_title: lesson.chapter_title,
    chapter_slug: lesson.chapter_slug,
  };

  return <LessonClient lesson={normalizedLesson} allLessons={allLessons} topicName={topicName} lessonId={lessonId} />;
}
