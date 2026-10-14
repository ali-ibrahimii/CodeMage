// app/tutorials/[name]/[lessonId]/LessonClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { Menu, X, Play, Code2, CheckCircle, FileText, BarChart3, BookOpen, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

function isHtml(str: string) {
  return /<\/?[a-z][\s\S]*>/i.test(str);
}

// تبدیل ساده Markdown به HTML برای نمایش بدون کتابخانه خارجی
function markdownToHtml(md: string): string {
  let html = md;

  // کد بلاک‌های سه بک‌تیک
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="bg-background border border-border rounded-lg p-4 my-4 overflow-x-auto" dir="ltr"><code class="text-sm font-mono">${esc}</code></pre>`;
  });

  // کد inline
  html = html.replace(/`([^`]+)`/g, '<code class="bg-primary/10 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // هدینگ‌ها
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>');

  // bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');

  // blockquote نکته
  html = html.replace(/^> \*\*نکته:\*\* (.+)$/gm, '<div class="bg-yellow-500/10 border-r-4 border-yellow-500 p-4 my-4 rounded"><strong>نکته:</strong> $1</div>');
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-r-4 border-primary/30 pr-4 py-2 my-4 bg-card/50 rounded">$1</blockquote>');

  // جدول ساده (نگه داشتن به صورت pre)
  // پاراگراف‌ها
  html = html
    .split(/\n{2,}/)
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<div') || trimmed.startsWith('<blockquote')) {
        return trimmed;
      }
      // لیست
      if (/^[-*] /.test(trimmed) || /^\d+\. /.test(trimmed)) {
        const items = trimmed
          .split('\n')
          .map((line) => line.replace(/^[-*] (.+)/, '<li>$1</li>').replace(/^\d+\. (.+)/, '<li>$1</li>'))
          .join('');
        return `<ul class="list-disc list-inside space-y-2 my-4 text-muted-foreground">${items}</ul>`;
      }
      return `<p class="my-3 leading-relaxed text-foreground/90">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html;
}

export default function LessonClient({ lesson, allLessons, topicName, lessonId }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCode, setShowCode] = useState(false);

  const codeExample = `// Code Example for ${lesson.title}\nconst example = "Learning ${topicName}";\nconsole.log(example);\n\n// More code here...\nfunction learn() {\n    console.log("Keep practicing!");\n}`;

  const renderedContent = useMemo(() => {
    if (!lesson.content) return '<p>محتوایی برای این درس ثبت نشده.</p>';
    if (isHtml(lesson.content)) {
      return lesson.content;
    }
    return markdownToHtml(lesson.content);
  }, [lesson.content]);

  // پیدا کردن درس قبلی و بعدی
  const currentIndex = allLessons.findIndex((l: any) => (l.slug || l.lesson_slug) === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

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
              <Link href={`/tutorials/${topicName}`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-1 text-sm">
                <ArrowLeft size={16} className="rotate-180" /> بازگشت به {lesson.subject_title || topicName}
              </Link>
              <h1 className="text-xl font-bold text-foreground">{lesson.title}</h1>
              {lesson.summary && <p className="text-sm text-muted-foreground mt-1">{lesson.summary}</p>}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={14} />
            <span>{lesson.duration || (lesson.duration_minutes ? `${lesson.duration_minutes} دقیقه` : '20 دقیقه')}</span>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-128px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-full md:w-80' : 'w-0'
          } transition-all duration-300 bg-card border-l border-border overflow-y-auto flex-shrink-0`}
        >
          <div className="p-6">
            <h2 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <BookOpen size={20} /> درس‌ها ({allLessons.length})
            </h2>

            <div className="space-y-2">
              {allLessons.map((item: any) => {
                const slug = item.slug || item.lesson_slug;
                const isActive = lessonId === slug;
                return (
                  <Link key={slug} href={`/tutorials/${topicName}/${slug}`}>
                    <div
                      className={`w-full text-right p-3 rounded-lg transition-all flex items-center gap-3 group ${
                        isActive ? 'bg-primary/20 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-background hover:text-foreground'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs opacity-70">{item.duration}</p>
                      </div>
                      <CheckCircle size={16} className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            {/* Breadcrumb */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {lesson.subject_title || topicName} / {lesson.chapter_title || lesson.module} / {lesson.title}
              </p>
            </div>

            {/* Content Tabs */}
            <div className="bg-card border border-border rounded-lg mb-8">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setShowCode(false)}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                    !showCode ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileText size={18} /> محتوا
                </button>
                <button
                  onClick={() => setShowCode(true)}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                    showCode ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Code2 size={18} /> مثال کد
                </button>
              </div>

              <div className="p-6">
                {!showCode ? (
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
                  </div>
                ) : (
                  <div className="bg-background rounded-lg overflow-auto border border-border">
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
                <p className="font-semibold text-foreground mb-4">سوال: کدام گزینه بهترین روش برای یادگیری مداوم است؟</p>
                <div className="space-y-3">
                  {['تمرین روزانه', 'فقط تماشای ویدیو', 'حفظ کردن کد', 'کپی بدون درک'].map((option, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="answer" className="w-4 h-4" />
                      <span className="text-foreground group-hover:text-primary transition-colors">{option}</span>
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
              {prevLesson ? (
                <Link href={`/tutorials/${topicName}/${prevLesson.slug || prevLesson.lesson_slug}`}>
                  <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-card transition-colors font-semibold">
                    → {prevLesson.title.slice(0, 20)}
                  </button>
                </Link>
              ) : (
                <button disabled className="px-6 py-3 border border-border text-muted-foreground rounded-lg opacity-50">
                  درس قبلی
                </button>
              )}

              {nextLesson ? (
                <Link href={`/tutorials/${topicName}/${nextLesson.slug || nextLesson.lesson_slug}`}>
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2">
                    {nextLesson.title.slice(0, 20)} <Play size={16} className="rotate-180" />
                  </button>
                </Link>
              ) : (
                <Link href={`/tutorials/${topicName}`}>
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                    پایان فصل
                  </button>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
