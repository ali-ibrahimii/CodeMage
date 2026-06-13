// app/tutorials/[name]/[lessonId]/LessonClient.tsx
'use client';

import { useState } from 'react';
import { Menu, X, Play, Code2, CheckCircle, FileText, BarChart3, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LessonClient({ lesson, allLessons, topicName, lessonId }: any) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showCode, setShowCode] = useState(false);

    // ساخت کد نمونه بر اساس دیتای سوپابیس
    const codeExample = `// Code Example for ${lesson.title}\nconst example = "Learning ${topicName}";\nconsole.log(example);\n\n// More code here...\nfunction learn() {\n    console.log("Keep practicing!");\n}`;

    return (
        <div className="min-h-screen bg-background" dir="rtl">
            {/* Header */}
            <header className="sticky top-16 bg-card border-b border-border z-40">
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 hover:bg-background rounded-lg transition-colors"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div>
                            <Link href={`/tutorials/${topicName}`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-1">
                                <ArrowLeft size={16} className="rotate-180" /> بازگشت به {topicName.charAt(0).toUpperCase() + topicName.slice(1)}
                            </Link>
                            <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-128px)]">
                {/* Sidebar */}
                <aside className={`${
                    sidebarOpen ? 'w-full md:w-80' : 'w-0'
                } transition-all duration-300 bg-card border-l border-border overflow-y-auto flex-shrink-0`}>
                    <div className="p-6">
                        <h2 className="font-bold text-foreground mb-6 flex items-center gap-2">
                            <BookOpen size={20} /> درس‌ها
                        </h2>

                        <div className="space-y-3">
                            {/* حلقه روی تمام درس‌هایی که از سوپابیس گرفته شده */}
                            {allLessons.map((item: any) => (
                                <Link key={item.lesson_slug} href={`/tutorials/${topicName}/${item.lesson_slug}`}>
                                    <button
                                        className={`w-full text-right p-3 rounded-lg transition-all flex items-center gap-3 group ${
                                            lessonId === item.lesson_slug
                                                ? 'bg-primary/20 text-primary'
                                                : 'text-muted-foreground hover:bg-background'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.title}</p>
                                            <p className="text-xs opacity-70">{item.duration}</p>
                                        </div>
                                        <CheckCircle size={16} className="flex-shrink-0" />
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6 sm:p-8">
                        {/* Breadcrumb */}
                        <div className="mb-6">
                            <p className="text-sm text-muted-foreground">
                                {lesson.module} / {lesson.title}
                            </p>
                        </div>

                        {/* Content Tabs */}
                        <div className="bg-card border border-border rounded-lg mb-8">
                            <div className="flex border-b border-border">
                                <button
                                    onClick={() => setShowCode(false)}
                                    className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        !showCode
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <FileText size={18} /> محتوا
                                </button>
                                <button
                                    onClick={() => setShowCode(true)}
                                    className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        showCode
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Code2 size={18} /> مثال کد
                                </button>
                            </div>

                            <div className="p-6">
                                {!showCode ? (
                                    <div className="prose prose-invert max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                                    </div>
                                ) : (
                                    <div className="bg-background rounded-lg overflow-auto">
                                        <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto" dir="ltr">
                                            <code>{codeExample}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quiz Section */}
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6 mb-8">
                            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <BarChart3 size={20} /> آزمون درس
                            </h3>
                            <div className="bg-background rounded-lg p-4 mb-4">
                                <p className="font-semibold text-foreground mb-4">
                                    سوال: کدام گزینه بهترین روش برای یادگیری مداوم است؟
                                </p>
                                <div className="space-y-3">
                                    {['Option A', 'Option B', 'Option C', 'Option D'].map((option, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="radio" name="answer" className="w-4 h-4" />
                                            <span className="text-foreground group-hover:text-primary transition-colors">
                                                {option}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                                دریافت نتیجه
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-6 border-t border-border">
                            <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-card transition-colors font-semibold">
                                درس قبلی →
                            </button>
                            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2">
                                درس بعدی <Play size={16} className="rotate-180" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}