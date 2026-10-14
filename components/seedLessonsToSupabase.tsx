// این تابع را می‌توانید یک‌بار در یکی از صفحات خود یا یک اسکریپت اجرا کنید تا دیتابیس پر شود
// نسخه جدید: سازگار با اسکیمای جدید (subjects, chapters, lessons)
import { supabase } from '@/lib/supabase';
import { lessonsData } from '@/app/utils/data';

export async function seedLessonsToSupabase() {
  console.log('شروع انتقال داده‌ها به سوپابیس با اسکیمای جدید...');

  for (const [techSlug, lessons] of Object.entries(lessonsData)) {
    // 1. subject را بساز یا پیدا کن
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

      if (subjectError) {
        console.error(`خطا در ساخت subject ${techSlug}:`, subjectError.message);
        continue;
      }
      subjectId = newSubject.id;
      console.log(`موضوع ${techSlug} ساخته شد: ${subjectId}`);
    }

    // 2. گروه‌بندی درس‌ها بر اساس module برای ساخت chapters
    const modules: Record<string, any[]> = {};
    for (const [lessonSlug, lessonDetails] of Object.entries(lessons)) {
      const mod = (lessonDetails as any).module || 'General';
      if (!modules[mod]) modules[mod] = [];
      modules[mod].push({ slug: lessonSlug, ...lessonDetails });
    }

    let orderIndex = 0;
    for (const [moduleName, moduleLessons] of Object.entries(modules)) {
      orderIndex++;
      const chapterSlug = moduleName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `chapter-${orderIndex}`;

      // chapter را پیدا یا بساز
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

        if (chapterError) {
          console.error(`خطا در ساخت chapter ${moduleName}:`, chapterError.message);
          continue;
        }
        chapterId = newChapter.id;
      }

      // 3. درس‌های این ماژول را وارد کن
      for (let i = 0; i < moduleLessons.length; i++) {
        const l = moduleLessons[i] as any;
        const durationMatch = l.duration?.match(/(\d+)/);
        const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 20;

        const { error: lessonError } = await supabase.from('lessons').upsert(
          {
            chapter_id: chapterId,
            subject_id: subjectId,
            slug: l.slug,
            title: l.title,
            summary: l.module || moduleName,
            content: l.content?.trim() || '',
            duration_minutes: durationMinutes,
            status: 'published',
            is_featured: i === 0,
            order_index: i,
            published_at: new Date().toISOString(),
          },
          { onConflict: 'subject_id,slug' }
        );

        if (lessonError) {
          console.error(`خطا در وارد کردن درس ${l.slug}:`, lessonError.message);
        } else {
          console.log(`درس ${l.slug} وارد شد`);
        }
      }
    }
  }

  console.log('تمام داده‌ها با موفقیت در سوپابیس ذخیره شدند!');
}

// نسخه قدیمی برای سازگاری (اگر کسی جدول قدیمی با tech_slug دارد)
export async function seedLessonsToSupabaseLegacy() {
  const rowsToInsert = [];

  for (const [techSlug, lessons] of Object.entries(lessonsData)) {
    for (const [lessonSlug, lessonDetails] of Object.entries(lessons)) {
      rowsToInsert.push({
        tech_slug: techSlug,
        lesson_slug: lessonSlug,
        title: (lessonDetails as any).title,
        module: (lessonDetails as any).module,
        duration: (lessonDetails as any).duration,
        content: (lessonDetails as any).content.trim(),
      });
    }
  }

  const { data, error } = await supabase.from('lessons').insert(rowsToInsert);

  if (error) {
    console.error('خطا در انتقال داده‌ها به سوپابیس (legacy):', error.message);
  } else {
    console.log('تمام داده‌ها با موفقیت در سوپابیس ذخیره شدند! (legacy)');
  }
}
