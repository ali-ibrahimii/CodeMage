// این تابع را می‌توانید یک‌بار در یکی از صفحات خود یا یک اسکریپت اجرا کنید تا دیتابیس پر شود
import { supabase } from '@/lib/supabase';
import { lessonsData } from '@/app/utils/data';

export async function seedLessonsToSupabase() {
  const rowsToInsert = [];

  // پیمایش آبجکت تو در توی دیتای شما
  for (const [techSlug, lessons] of Object.entries(lessonsData)) {
    for (const [lessonSlug, lessonDetails] of Object.entries(lessons)) {
      rowsToInsert.push({
        tech_slug: techSlug,
        lesson_slug: lessonSlug,
        title: lessonDetails.title,
        module: lessonDetails.module,
        duration: lessonDetails.duration,
        content: lessonDetails.content.trim(),
      });
    }
  }

  // وارد کردن تمام ردیف‌ها به صورت یکجا
  const { data, error } = await supabase
    .from('lessons')
    .insert(rowsToInsert);

  if (error) {
    console.error('خطا در انتقال داده‌ها به سوپابیس:', error.message);
  } else {
    console.log('تمام داده‌ها با موفقیت در سوپابیس ذخیره شدند!');
  }
}