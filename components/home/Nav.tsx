'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Compass, House } from 'lucide-react';

const navItems = [
  { label: 'خانه', href: '/', icon: House },
  { label: 'درس‌ها', href: '/tutorials', icon: BookOpen },
  { label: 'مسیرهای یادگیری', href: '/learning-paths', icon: Compass },
];

type NavProps = {
  isMobile?: boolean;
  onNavigate?: () => void;
};

export default function Nav({ isMobile = false, onNavigate }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className={isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-1'} aria-label="ناوبری اصلی">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={[
              'group inline-flex items-center gap-2 rounded-2xl font-bold transition-all',
              isMobile ? 'w-full px-4 py-3.5 text-sm' : 'px-4 py-2.5 text-[13px]',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            <Icon size={16} strokeWidth={2.1} className="opacity-80 transition-transform group-hover:-translate-y-0.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
