// app/utils/lessonsHelpers.ts

import { lessonsData } from './data';

/**
 * دریافت تمام دوره‌ها
 */
export function getAllCourses(): string[] {
    return Object.keys(lessonsData);
}

/**
 * دریافت تمام درس‌های یک دوره
 */
export function getCourseLessons(courseName: string) {
    return lessonsData[courseName] || null;
}

/**
 * دریافت اطلاعات یک درس خاص
 */
export function getLesson(courseName: string, lessonId: string) {
    const course = lessonsData[courseName];
    if (!course) return null;
    return course[lessonId] || null;
}

/**
 * دریافت درس بعدی
 */
export function getNextLesson(courseName: string, currentLessonId: string) {
    const course = lessonsData[courseName];
    if (!course) return null;

    const lessons = Object.entries(course);
    const currentIndex = lessons.findIndex(([id]) => id === currentLessonId);

    if (currentIndex === -1 || currentIndex === lessons.length - 1) {
        return null;
    }

    const [nextId, nextLesson] = lessons[currentIndex + 1];
    return { id: nextId, ...nextLesson };
}

/**
 * دریافت درس قبلی
 */
export function getPreviousLesson(courseName: string, currentLessonId: string) {
    const course = lessonsData[courseName];
    if (!course) return null;

    const lessons = Object.entries(course);
    const currentIndex = lessons.findIndex(([id]) => id === currentLessonId);

    if (currentIndex <= 0) {
        return null;
    }

    const [prevId, prevLesson] = lessons[currentIndex - 1];
    return { id: prevId, ...prevLesson };
}

/**
 * جستجو در درس‌ها
 */
export function searchLessons(query: string) {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(lessonsData).forEach(([course, lessons]) => {
        Object.entries(lessons).forEach(([id, lesson]: any) => {
            if (
                lesson.title.toLowerCase().includes(lowerQuery) ||
                lesson.module.toLowerCase().includes(lowerQuery) ||
                lesson.content.toLowerCase().includes(lowerQuery)
            ) {
                results.push({
                    course,
                    id,
                    title: lesson.title,
                    module: lesson.module,
                    duration: lesson.duration
                });
            }
        });
    });

    return results;
}

/**
 * دریافت تعداد درس‌های یک دوره
 */
export function getCourseLessonCount(courseName: string): number {
    const course = lessonsData[courseName];
    return course ? Object.keys(course).length : 0;
}

/**
 * دریافت تمام درس‌ها (تخت شده)
 */
export function getAllLessons() {
    const allLessons: any[] = [];

    Object.entries(lessonsData).forEach(([course, lessons]) => {
        Object.entries(lessons).forEach(([id, lesson]: any) => {
            allLessons.push({
                course,
                id,
                ...lesson
            });
        });
    });

    return allLessons;
}

/**
 * دریافت آمار دوره‌ها
 */
export function getCoursesStats() {
    const courses = getAllCourses();
    return courses.map(course => ({
        name: course,
        lessonCount: getCourseLessonCount(course),
        lessons: Object.keys(lessonsData[course])
    }));
}