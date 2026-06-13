// app/tutorials/[name]/[lessonId]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import LessonClient from './LessonClient';

export default async function LessonPage({ params }: { params: { name: string, lessonId: string } }) {
    // دریافت پارامترهای URL
    const { name, lessonId } = await params;
    const topicName = name.toLowerCase();

    // 1. دریافت دیتای درس فعلی از سوپابیس
    const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('tech_slug', topicName)
        .eq('lesson_slug', lessonId)
        .single();

    if (lessonError || !lesson) {
        return notFound();
    }

    // 2. دریافت لیست تمام درس‌های این تکنولوژی (برای نمایش در سایدبار)
    const { data: allLessons, error: allLessonsError } = await supabase
        .from('lessons')
        .select('lesson_slug, title, duration')
        .eq('tech_slug', topicName)
        .order('id', { ascending: true }); // مرتب‌سازی بر اساس آیدی یا زمان ایجاد

    // ارسال دیتا به کامپوننت کلاینت (رابط کاربری)
    return (
        <LessonClient 
            lesson={lesson} 
            allLessons={allLessons || []} 
            topicName={topicName} 
            lessonId={lessonId} 
        />
    );
}