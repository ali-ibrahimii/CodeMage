import { notFound } from 'next/navigation';
import { getPublicSubject } from '@/lib/content';
import LessonClient from './LessonClient';

export const dynamic = 'force-dynamic';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ name: string; lessonId: string }>;
}) {
  const { name, lessonId } = await params;
  const topicName = name.toLowerCase();
  const subjectContent = await getPublicSubject(topicName);
  const lesson = subjectContent?.lessons.find((item) => item.slug === lessonId);

  if (!subjectContent || !lesson) notFound();

  return (
    <LessonClient
      lesson={lesson}
      allLessons={subjectContent.lessons}
      topicName={topicName}
      topicTitle={subjectContent.subject.title}
      chapterTitle={lesson.chapter_title || 'عمومی'}
    />
  );
}
