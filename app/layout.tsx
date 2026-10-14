import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'CodeMage | یادگیری، با قدم‌های کوچک و محکم',
    template: '%s | CodeMage',
  },
  description: 'یادداشت‌های فارسی و کاربردی برای یادگیری برنامه‌نویسی، ریاضی و علوم.',
  keywords: ['آموزش برنامه‌نویسی', 'زبان C', 'ریاضی', 'فیزیک', 'یادگیری فارسی'],
  authors: [{ name: 'CodeMage' }],
  openGraph: {
    title: 'CodeMage | یادگیری، با قدم‌های کوچک و محکم',
    description: 'درس‌های فارسی و کاربردی برای ساختن مهارت‌های تازه.',
    type: 'website',
    locale: 'fa_IR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
