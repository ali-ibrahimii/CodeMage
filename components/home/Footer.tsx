import Link from 'next/link';
import { ArrowUpLeft, Code2, Send } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import type { SiteSettings } from '@/lib/site-settings';

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 bg-[#111b2e] text-white">
      <div className="page-container pt-14 sm:pt-16">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-6 sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:p-10">
          <div>
            <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-[#b7f486] text-[#182239]">
              <Send size={19} />
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{settings.newsletter.title}</h2>
            <p className="mt-2 max-w-lg text-sm leading-7 text-white/60">{settings.newsletter.text}</p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-10 border-b border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-14">
          <div className="max-w-sm">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#725bff] to-[#36c6ab] text-white shadow-lg shadow-black/20 transition-transform group-hover:-rotate-3">
                <Code2 size={22} />
              </span>
              <span>
                <span className="block text-lg font-black">{settings.brand.name}</span>
                <span className="mt-0.5 block text-xs text-white/55">{settings.brand.tagline}</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-white/55">{settings.brand.description}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black text-white">یادگیری</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link className="transition hover:text-[#b7f486]" href="/tutorials">همه‌ی موضوع‌ها</Link></li>
              <li><Link className="transition hover:text-[#b7f486]" href="/learning-paths">مسیرهای یادگیری</Link></li>
              <li><Link className="transition hover:text-[#b7f486]" href="/about">درباره‌ی CodeMage</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black text-white">دسترسی سریع</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link className="transition hover:text-[#b7f486]" href="/dashboard">پنل مدیریت</Link></li>
              <li><Link className="transition hover:text-[#b7f486]" href="/tutorials/c">زبان C</Link></li>
              <li><Link className="transition hover:text-[#b7f486]" href="/tutorials/math">ریاضی</Link></li>
              <li><Link className="transition hover:text-[#b7f486]" href="/tutorials/physics">فیزیک</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.brand.name} — یادگیری برای همه، یک درس در هر قدم.</p>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/65"><Code2 size={15} /></span>
            <span className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/65"><Send size={15} /></span>
            <Link href="/" className="mr-2 inline-flex items-center gap-1 text-white/55 transition hover:text-[#b7f486]">
              بازگشت به بالا <ArrowUpLeft size={13} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
