// app/tutorials/[name]/page.tsx
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

// اطلاعات کلی دوره‌ها (چون در دیتابیس فقط درس‌ها را داریم، این موارد اینجا می‌مانند)
const tutorialMeta: Record<string, any> = {
    javascript: {
        title: 'JavaScript',
        color: 'yellow',
        description: 'Master vanilla JS from basics to advanced concepts',
    },
    react: {
        title: 'React.js',
        color: 'cyan',
        description: 'Build interactive UIs with React components and hooks',
    },
    nextjs: {
        title: 'Next.js',
        color: 'gray',
        description: 'Full-stack framework for production apps',
    },
    typescript: {
        title: 'TypeScript',
        color: 'blue',
        description: 'Type-safe JavaScript for scalable applications',
    }
};

export default async function TutorialListPage({ params }: { params: { name: string } }) {
    // ۱. دریافت نام تکنولوژی از URL
    const { name } = await params;
    const topicName = name.toLowerCase();
    
    // ۲. بررسی وجود متادیتا برای این تکنولوژی
    const meta = tutorialMeta[topicName];

    // ۳. دریافت تمام درس‌های این تکنولوژی از سوپابیس
    const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('tech_slug', topicName)
        .order('id', { ascending: true }); // مرتب‌سازی بر اساس ترتیب اضافه شدن

    // اگر تکنولوژی معتبر نبود یا درسی برایش پیدا نشد
    if (!meta || error || !lessons || lessons.length === 0) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-background via-background to-card/30 px-4 py-20">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">Tutorial Not Found</h1>
                    <p className="text-muted-foreground mb-8">The tutorial you're looking for doesn't exist.</p>
                    <Link href="/" className="text-primary hover:text-primary/80">← Back to Home</Link>
                </div>
            </main>
        );
    }

    // ۴. گروه‌بندی درس‌ها بر اساس ستون module (مثلاً Beginner, Intermediate و ...)
    const groupedLessons: Record<string, any[]> = {};
    lessons.forEach((lesson) => {
        const moduleName = lesson.module || 'General';
        if (!groupedLessons[moduleName]) {
            groupedLessons[moduleName] = [];
        }
        groupedLessons[moduleName].push({
            id: lesson.lesson_slug,
            title: lesson.title,
            duration: lesson.duration,
            lessons: 1 // از آنجایی که هر ردیف یک درس است
        });
    });

    // تبدیل آبجکت گروه‌بندی شده به آرایه‌ای که در دیزاین استفاده کردی
    const topics = Object.keys(groupedLessons).map(level => ({
        level: level,
        items: groupedLessons[level]
    }));

    // تنظیمات رنگ‌ها
    const colorClasses: Record<string, string> = {
        yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/20 text-yellow-500',
        cyan: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/20 text-cyan-500',
        gray: 'from-gray-500/20 to-gray-700/20 border-gray-500/20 text-gray-500',
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-500'
    };

    const colors = colorClasses[meta.color] || colorClasses.yellow;

    return (
        <main className="min-h-screen bg-gradient-to-b from-background via-background to-card/30" dir="ltr">
            {/* Hero Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
                            Master <span className={`${colors.split(' ')[3]}`}>{meta.title}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                            {meta.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Topics by Level */}
            <section className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="mx-auto max-w-6xl">
                    <div className="space-y-12">
                        {topics.map((section: any, idx: number) => (
                            <div key={idx}>
                                <h2 className="text-2xl font-bold text-foreground mb-6">{section.level} Level</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {section.items.map((item: any) => (
                                        <Link key={item.id} href={`/tutorials/${topicName}/${item.id}`}>
                                            <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group h-full">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                                                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Lesson</span>
                                                    <span>{item.duration}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}