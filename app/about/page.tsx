import Link from 'next/link';
import { ArrowLeft, BookOpen, Compass, Heart, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="page-container py-10 sm:py-16" dir="rtl">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#121d32] px-6 py-10 text-white sm:px-12 sm:py-16">
        <div className="absolute -left-10 -top-20 size-64 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 size-48 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-bold text-white/80"><Heart size={14} className="text-rose-300" /> یادگیری برای همه</span>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">درباره‌ی CodeMage</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/65">CodeMage جایی برای یادگیری آرام، عمیق و فارسی است؛ یادداشت‌ها و درس‌هایی که پیچیدگی را به قدم‌های کوچک و قابل فهم تبدیل می‌کنند.</p>
          <Link href="/tutorials" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#b7f486] px-5 py-3 text-sm font-black text-[#17233a] transition hover:-translate-y-0.5 hover:bg-[#c7f89c]">رفتن به درس‌ها <ArrowLeft size={16} /></Link>
        </div>
      </section>

      <section className="grid gap-5 py-12 sm:grid-cols-3 sm:py-16">
        {[
          { icon: BookOpen, title: 'محتوای روشن', text: 'مفاهیم را با زبان ساده، مثال‌های واقعی و ساختاری قابل پیگیری توضیح می‌دهیم.' },
          { icon: Compass, title: 'مسیر قابل انتخاب', text: 'از موضوعی که دوست داری شروع کن و درس‌ها را با سرعت خودت پیش ببر.' },
          { icon: Sparkles, title: 'همیشه در حال رشد', text: 'محتوای تازه اضافه می‌شود و هر درس می‌تواند در پنل مدیریت ویرایش شود.' },
        ].map((item) => {
          const Icon = item.icon;
          return <article key={item.title} className="soft-card p-6"><span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={20} /></span><h2 className="mt-5 text-lg font-black">{item.title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p></article>;
        })}
      </section>
    </div>
  );
}
