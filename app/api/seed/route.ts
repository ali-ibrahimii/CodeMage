// app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // مسیر فایل سوپابیس خودت را چک کن درست باشد
import { lessonsData } from '@/app/utils/data'; // مسیر دیتای خودت

export async function GET() {
  const rowsToInsert = [];

  // پیمایش آبجکت تو در توی دیتا
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

  // وارد کردن داده‌ها به سوپابیس
  const { data, error } = await supabase
    .from('lessons')
    .insert(rowsToInsert);

  if (error) {
    console.error('خطا:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    success: true, 
    message: 'تمام داده‌ها با موفقیت در سوپابیس ذخیره شدند!' 
  });
}