// این تابع را می‌توانید یک‌بار در یکی از صفحات خود یا یک اسکریپت اجرا کنید تا دیتابیس پر شود.
import { supabase } from '@/lib/supabase';
import { lessonsData, type LessonData } from '@/app/utils/data';

type LessonSeed = LessonData & { slug: string };
type LegacyLessonRow = {
  tech_slug: string;
  lesson_slug: string;
  title: string;
  module: string;
  duration: string;
  content: string;
};

export async function seedLessonsToSupabase() {
  console.log('شروع انتقال داده‌ها به سوپابیس با اسکیمای جدید...');

  for (const [techSlug, lessons] of Object.entries(lessonsData)) {
    let subjectId: string | null = null;
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', techSlug)
      .single();

    if (existingSubject) {
      subjectId = existingSubject.id;
      console.log(`موضوع ${techSlug} از قبل وجود دارد: ${subjectId}`);
    } else {
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({
          slug: techSlug,
          title: techSlug.charAt(0).toUpperCase() + techSlug.slice(1),
          description: `دوره آموزشی ${techSlug}`,
          icon: 'BookOpen',
          color: 'blue',
          kind: 'programming',
          level: 'مقدماتی',
          is_published: true,
          order_index: 0,
        })
        .select('id')
        .single();

      if (subjectError || !newSubject) {
        console.error(`خطا در ساخت subject ${techSlug}:`, subjectError?.message || 'شناسه‌ی موضوع دریافت نشد.');
        continue;
      }
      subjectId = newSubject.id;
      console.log(`موضوع ${techSlug} ساخته شد: ${subjectId}`);
    }

    const modules: Record<string, LessonSeed[]> = {};
    for (const [lessonSlug, lessonDetails] of Object.entries(lessons)) {
      const moduleName = lessonDetails.module || 'General';
      modules[moduleName] ||= [];
      modules[moduleName].push({ slug: lessonSlug, ...lessonDetails });
    }

    let orderIndex = 0;
    for (const [moduleName, moduleLessons] of Object.entries(modules)) {
      orderIndex++;
      const chapterSlug = moduleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `chapter-${orderIndex}`;
      let chapterId: string | null = null;

      const { data: existingChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('subject_id', subjectId)
        .eq('slug', chapterSlug)
        .single();

      if (existingChapter) {
        chapterId = existingChapter.id;
      } else {
        const { data: newChapter, error: chapterError } = await supabase
          .from('chapters')
          .insert({
            subject_id: subjectId,
            slug: chapterSlug,
            title: moduleName,
            description: `سرفصل ${moduleName}`,
            order_index: orderIndex,
            is_published: true,
          })
          .select('id')
          .single();

        if (chapterError || !newChapter) {
          console.error(`خطا در ساخت chapter ${moduleName}:`, chapterError?.message || 'شناسه‌ی فصل دریافت نشد.');
          continue;
        }
        chapterId = newChapter.id;
      }

      if (!chapterId) continue;
      for (const [index, lesson] of moduleLessons.entries()) {
        const durationMatch = lesson.duration.match(/(\d+)/);
        const durationMinutes = durationMatch ? Number.parseInt(durationMatch[1], 10) : 20;
        const { error: lessonError } = await supabase.from('lessons').upsert(
          {
            chapter_id: chapterId,
            subject_id: subjectId,
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.module || moduleName,
            content: lesson.content.trim(),
            duration_minutes: durationMinutes,
            status: 'published',
            is_featured: index === 0,
            order_index: index,
            published_at: new Date().toISOString(),
          },
          { onConflict: 'subject_id,slug' },
        );

        if (lessonError) console.error(`خطا در وارد کردن درس ${lesson.slug}:`, lessonError.message);
        else console.log(`درس ${lesson.slug} وارد شد`);
      }
    }
  }

  console.log('تمام داده‌ها با موفقیت در سوپابیس ذخیره شدند!');
}

// نسخه‌ی قدیمی برای سازگاری با دیتابیس‌های legacy.
export async function seedLessonsToSupabaseLegacy() {
  const rowsToInsert: LegacyLessonRow[] = [];
  for (const [techSlug, lessons] of Object.entries(lessonsData)) {
    for (const [lessonSlug, lesson] of Object.entries(lessons)) {
      rowsToInsert.push({
        tech_slug: techSlug,
        lesson_slug: lessonSlug,
        title: lesson.title,
        module: lesson.module,
        duration: lesson.duration,
        content: lesson.content.trim(),
      });
    }
  }

  const { error } = await supabase.from('lessons').insert(rowsToInsert);
  if (error) console.error('خطا در انتقال داده‌ها به سوپابیس (legacy):', error.message);
  else console.log('تمام داده‌ها با موفقیت در سوپابیس ذخیره شدند! (legacy)');
}
