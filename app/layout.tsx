import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// برای محیط‌هایی که اینترنت ندارند (مثل CI) فونت گوگل را غیرفعال می‌کنیم
// تا بیلد نشکند. اگر اینترنت باشد، می‌توان دوباره Geist را فعال کرد.
const geist = { variable: "" };

export const metadata: Metadata = {
  title: "DevTutorials - Learn Web Development",
  description: "Master JavaScript, React, Next.js, TypeScript and more with our comprehensive tutorials.",
  keywords: "JavaScript, React, Next.js, TypeScript, Web Development, Programming",
  authors: [{ name: "DevTutorials" }],
  openGraph: {
    title: "DevTutorials - Learn Web Development",
    description: "Comprehensive tutorials and learning paths for web development",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="flex flex-col min-h-screen bg-background text-foreground">
        <ThemeProvider>
          {/* Header Navigation */}
          <header className="w-full sticky top-0 z-50">
            <Header />
          </header>

          {/* Main Content Area */}
          <main className="flex-1 w-full">
            <div className="w-full">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-border bg-card/30 mt-auto">
            <Footer />
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
