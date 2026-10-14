export type SiteSettings = {
  brand: {
    name: string;
    tagline: string;
    description: string;
  };
  hero: {
    title: string;
    highlight: string;
    subtitle: string;
    primary_cta: string;
    primary_href: string;
    secondary_cta: string;
    secondary_href: string;
  };
  cta: {
    title: string;
    text: string;
    button: string;
    href: string;
  };
  newsletter: {
    title: string;
    text: string;
  };
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand: {
    name: 'CodeMage',
    tagline: 'یادگیری، با قدم‌های کوچک و محکم',
    description: 'یادداشت‌های فارسی برای یادگیری برنامه‌نویسی و علوم.',
  },
  hero: {
    title: 'از کنجکاوی تا',
    highlight: 'تسلط؛ یک درس در هر قدم',
    subtitle:
      'یادداشت‌های روشن و کاربردی برنامه‌نویسی، ریاضی و فیزیک؛ برای یادگیری عمیق، با مثال و تمرین.',
    primary_cta: 'شروع یادگیری',
    primary_href: '/tutorials',
    secondary_cta: 'دیدن مسیرهای یادگیری',
    secondary_href: '/learning-paths',
  },
  cta: {
    title: 'قدم بعدی را همین امروز بردار',
    text: 'یک موضوع انتخاب کن، درس‌ها را با ریتم خودت پیش برو و هر روز کمی بهتر شو.',
    button: 'دیدن همه‌ی درس‌ها',
    href: '/tutorials',
  },
  newsletter: {
    title: 'یادگیری را ادامه بده',
    text: 'برای دریافت درس‌ها و یادداشت‌های تازه، ایمیلت را ثبت کن.',
  },
};

export const SITE_SETTING_ROWS = [
  { key: 'site.brand', description: 'نام و شعار سایت در هدر و فوتر' },
  { key: 'home.hero', description: 'متن‌ها و دکمه‌های بخش اصلی صفحه‌ی خانه' },
  { key: 'home.cta', description: 'باکس دعوت به یادگیری در صفحه‌ی خانه' },
  { key: 'footer.newsletter', description: 'متن بخش خبرنامه در فوتر' },
] as const;

export function mergeSiteSettings(rows: Array<{ key: string; value: unknown }>): SiteSettings {
  const values = new Map(rows.map((row) => [row.key, row.value]));
  const brand = values.get('site.brand') as Partial<SiteSettings['brand']> | undefined;
  const hero = values.get('home.hero') as Partial<SiteSettings['hero']> | undefined;
  const cta = values.get('home.cta') as Partial<SiteSettings['cta']> | undefined;
  const newsletter = values.get('footer.newsletter') as Partial<SiteSettings['newsletter']> | undefined;

  return {
    brand: { ...DEFAULT_SITE_SETTINGS.brand, ...brand },
    hero: { ...DEFAULT_SITE_SETTINGS.hero, ...hero },
    cta: { ...DEFAULT_SITE_SETTINGS.cta, ...cta },
    newsletter: { ...DEFAULT_SITE_SETTINGS.newsletter, ...newsletter },
  };
}
