import { lessonsData, type LessonData } from './data';

export type CourseLessonResult = LessonData & { id: string };
export type SearchLessonResult = CourseLessonResult & { course: string };
export type FlatLesson = LessonData & { id: string; course: string };

/** دریافت تمام دوره‌ها */
export function getAllCourses(): string[] {
  return Object.keys(lessonsData);
}

/** دریافت تمام درس‌های یک دوره */
export function getCourseLessons(courseName: string) {
  return lessonsData[courseName] || null;
}

/** دریافت اطلاعات یک درس خاص */
export function getLesson(courseName: string, lessonId: string) {
  return lessonsData[courseName]?.[lessonId] || null;
}

/** دریافت درس بعدی */
export function getNextLesson(courseName: string, currentLessonId: string): CourseLessonResult | null {
  const course = lessonsData[courseName];
  if (!course) return null;

  const lessons = Object.entries(course);
  const currentIndex = lessons.findIndex(([id]) => id === currentLessonId);
  if (currentIndex === -1 || currentIndex === lessons.length - 1) return null;

  const [id, lesson] = lessons[currentIndex + 1];
  return { id, ...lesson };
}

/** دریافت درس قبلی */
export function getPreviousLesson(courseName: string, currentLessonId: string): CourseLessonResult | null {
  const course = lessonsData[courseName];
  if (!course) return null;

  const lessons = Object.entries(course);
  const currentIndex = lessons.findIndex(([id]) => id === currentLessonId);
  if (currentIndex <= 0) return null;

  const [id, lesson] = lessons[currentIndex - 1];
  return { id, ...lesson };
}

/** جستجو در درس‌های محلی */
export function searchLessons(query: string): SearchLessonResult[] {
  const results: SearchLessonResult[] = [];
  const lowerQuery = query.toLocaleLowerCase();

  Object.entries(lessonsData).forEach(([course, lessons]) => {
    Object.entries(lessons).forEach(([id, lesson]) => {
      if (
        lesson.title.toLocaleLowerCase().includes(lowerQuery) ||
        lesson.module.toLocaleLowerCase().includes(lowerQuery) ||
        lesson.content.toLocaleLowerCase().includes(lowerQuery)
      ) {
        results.push({ course, id, title: lesson.title, module: lesson.module, duration: lesson.duration, content: lesson.content });
      }
    });
  });

  return results;
}

/** دریافت تعداد درس‌های یک دوره */
export function getCourseLessonCount(courseName: string): number {
  const course = lessonsData[courseName];
  return course ? Object.keys(course).length : 0;
}

/** دریافت تمام درس‌ها به‌صورت تخت */
export function getAllLessons(): FlatLesson[] {
  const allLessons: FlatLesson[] = [];
  Object.entries(lessonsData).forEach(([course, lessons]) => {
    Object.entries(lessons).forEach(([id, lesson]) => allLessons.push({ course, id, ...lesson }));
  });
  return allLessons;
}

/** دریافت آمار دوره‌ها */
export function getCoursesStats() {
  return getAllCourses().map((course) => ({
    name: course,
    lessonCount: getCourseLessonCount(course),
    lessons: Object.keys(lessonsData[course]),
  }));
}
