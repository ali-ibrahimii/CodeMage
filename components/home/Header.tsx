'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Code2, Menu, Moon, Search, Sun, X, ArrowUpLeft } from 'lucide-react';
import Nav from './Nav';
import { useTheme } from '../providers/ThemeProvider';

export type HeaderBrand = {
  name: string;
  tagline: string;
};

export default function Header({ brand }: { brand: HeaderBrand }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    }}>
      <div className="page-container">
        <div className="flex h-18 items-center justify-between gap-3 sm:h-20 lg:gap-5">
          <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3 lg:max-w-52" aria-label={`${brand.name}، صفحه‌ی اصلی`}>
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#725bff] via-[#735fe7] to-[#36c6ab] text-white shadow-lg shadow-primary/25 transition-transform group-hover:-rotate-3 group-hover:scale-105">
              <Code2 size={23} strokeWidth={2.2} />
              <span className="absolute -bottom-2 -left-1 size-5 rounded-full bg-[#b7f486]/80 blur-md" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black tracking-tight text-foreground sm:text-lg">{brand.name}</span>
              <span className="hidden truncate text-[10px] font-medium text-muted-foreground sm:block">{brand.tagline}</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <Nav />
          </div>

          <div className="hidden shrink-0 items-center justify-end gap-2 lg:flex xl:gap-3">
            <form action="/tutorials" method="get" className="relative hidden w-[200px] xl:block">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                aria-label="جستجو در درس‌ها"
                placeholder="جست‌وجوی درس‌ها..."
                className="w-full rounded-2xl border border-border/80 bg-card/75 py-3 ps-10 pe-3 text-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
              />
            </form>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-card/70 text-muted-foreground transition hover:border-primary/30 hover:text-primary"
              aria-label={theme === 'light' ? 'فعال‌کردن حالت تاریک' : 'فعال‌کردن حالت روشن'}
              title={theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#17233a] px-4 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-primary">
              <BookOpen size={15} />
              پنل مدیریت
              <ArrowUpLeft size={14} className="opacity-70" />
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-card/70 text-muted-foreground"
              aria-label={theme === 'light' ? 'فعال‌کردن حالت تاریک' : 'فعال‌کردن حالت روشن'}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button
              type="button"
              ref={menuButtonRef}
              onClick={() => setIsOpen((open) => !open)}
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
              aria-label={isOpen ? 'بستن منو' : 'بازکردن منو'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div id="mobile-navigation" className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-border/70 py-4 lg:hidden">
            <form action="/tutorials" method="get" className="relative mb-3">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                aria-label="جستجو در درس‌ها"
                placeholder="جست‌وجوی موضوع یا درس..."
                className="w-full rounded-2xl border border-border bg-card py-3 ps-10 pe-4 text-sm outline-none focus:border-primary/45 focus:ring-4 focus:ring-primary/10"
              />
            </form>
            <Nav isMobile onNavigate={() => setIsOpen(false)} />
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#17233a] px-4 py-3.5 text-sm font-bold text-white"
            >
              <BookOpen size={16} /> ورود به پنل مدیریت
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
