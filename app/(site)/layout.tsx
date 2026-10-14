import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { getPublicSettings } from '@/lib/content';

/** Public chrome is intentionally scoped to public routes, not the dashboard. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  return <>
    <Header brand={{ name: settings.brand.name, tagline: settings.brand.tagline }} />
    <main className="min-w-0 flex-1">{children}</main>
    <Footer settings={settings} />
  </>;
}
