// Curated learning roadmaps (front-end, back-end, programming languages and
// sciences). Unlike subject paths — which are generated from published lessons —
// these are hand-written curricula with stages, skills and links into real
// lessons whenever a matching lesson exists.

export type RoadmapStep = {
  title: string;
  description: string;
  skills: string[];
  lesson?: { subject: string; slug: string };
};

export type RoadmapStage = {
  title: string;
  goal: string;
  duration: string;
  steps: RoadmapStep[];
};

export type Roadmap = {
  slug: string;
  title: string;
  category: 'programming' | 'science';
  kind: 'frontend' | 'backend' | 'language' | 'math' | 'physics';
  icon: string;
  color: string;
  description: string;
  level: string;
  estimatedHours: number;
  aliases: string[];
  stages: RoadmapStage[];
};

export const ROADMAP_CATEGORY_LABELS: Record<Roadmap['category'], string> = {
  programming: 'برنامه‌نویسی',
  science: 'علوم',
};

export const ROADMAPS: Roadmap[] = [
  {
    slug: 'frontend',
    title: 'فرانت‌اند',
    category: 'programming',
    kind: 'frontend',
    icon: 'Monitor',
    color: 'violet',
    description: 'از اولین تگ HTML تا ساخت اپلیکیشن‌های مدرن با React و Next.js؛ مسیر کامل توسعه‌ی رابط کاربری.',
    level: 'مقدماتی تا پیشرفته',
    estimatedHours: 320,
    aliases: ['فرانت', 'فرانت اند', 'فرانت‌اند', 'فرانت اند', 'frontend', 'front-end', 'front end', 'ui', 'رابط کاربری', 'طراحی وب', 'وب', 'react', 'ری‌اکت', 'next', 'html', 'css'],
    stages: [
      {
        title: 'پایه‌ی وب',
        goal: 'بفهمی صفحه‌ی وب چطور ساخته می‌شود و ساختار یک سند HTML را بشناسی.',
        duration: '۲ تا ۳ هفته',
        steps: [
          { title: 'HTML ساختاری', description: 'تگ‌ها، فرم‌ها، جدول‌ها و معنای درست عناصر.', skills: ['HTML', 'دسترس‌پذیری'], lesson: { subject: 'javascript', slug: 'intro-js' } },
          { title: 'CSS پایه', description: 'انتخاب‌گرها، جعبه‌ها، رنگ‌ها و واحدها.', skills: ['CSS', 'Box Model'] },
          { title: 'چیدمان مدرن', description: 'Flexbox و Grid را طوری یاد بگیر که هر چیدمانی را بسازی.', skills: ['Flexbox', 'Grid', 'Responsive'] },
        ],
      },
      {
        title: 'جاوااسکریپت زنده',
        goal: 'به صفحه‌ها رفتار بدهی و با زبان مرورگر راحت کار کنی.',
        duration: '۳ تا ۴ هفته',
        steps: [
          { title: 'زبان جاوااسکریپت', description: 'متغیر، شیء، تابع، آرایه و حلقه‌ها.', skills: ['JavaScript', 'ES6'], lesson: { subject: 'javascript', slug: 'js-variables' } },
          { title: 'DOM و رویدادها', description: 'انتخاب عناصر، گوش‌دادن به رویدادها و تغییر زنده‌ی صفحه.', skills: ['DOM', 'Events'] },
          { title: 'درخواست‌های شبکه', description: 'کار با fetch، JSON و APIهای واقعی.', skills: ['Fetch', 'JSON', 'API'] },
        ],
      },
      {
        title: 'ابزارهای حرفه‌ای',
        goal: 'مثل یک توسعه‌دهنده‌ی واقعی پروژه بسازی و نسخه‌بندی کنی.',
        duration: '۲ تا ۳ هفته',
        steps: [
          { title: 'Git و GitHub', description: 'تاریخچه‌ی تغییرات، شاخه‌ها و همکاری در پروژه.', skills: ['Git', 'GitHub'] },
          { title: 'Tailwind و کامپوننت‌نویسی', description: 'استایل سریع و ساخت کامپوننت‌های قابل استفاده‌ی مجدد.', skills: ['Tailwind', 'Design System'] },
          { title: 'ابزارهای ساخت', description: 'npm، bundler و اجرای پروژه‌های چندفایلی.', skills: ['npm', 'Vite'] },
        ],
      },
      {
        title: 'فریم‌ورک مدرن',
        goal: 'اپلیکیشن‌های چندصفحه‌ای و مقیاس‌پذیر بسازی.',
        duration: '۴ تا ۶ هفته',
        steps: [
          { title: 'مبانی React', description: 'کامپوننت، state، props و چرخه‌ی رندر.', skills: ['React', 'JSX'] },
          { title: 'هوک‌ها و مدیریت داده', description: 'useState، useEffect و جریان داده بین کامپوننت‌ها.', skills: ['Hooks', 'Data Flow'] },
          { title: 'Next.js', description: 'روتینگ، رندر سمت سرور و ساخت سایت کامل.', skills: ['Next.js', 'SSR', 'Routing'] },
          { title: 'TypeScript', description: 'تایپ‌ها را اضافه کن تا باگ‌ها قبل از اجرا پیدا شوند.', skills: ['TypeScript', 'Types'] },
        ],
      },
      {
        title: 'کیفیت و انتشار',
        goal: 'پروژه‌ات را سریع، امن و آماده‌ی استفاده‌ی دیگران کنی.',
        duration: '۳ تا ۴ هفته',
        steps: [
          { title: 'تست رابط کاربری', description: 'نوشتن تست‌های خودکار با Playwright یا ابزارهای مشابه.', skills: ['Playwright', 'Testing'] },
          { title: 'کارایی و سئو', description: 'بهینه‌سازی تصاویر، بارگذاری تنبل و Core Web Vitals.', skills: ['Performance', 'SEO'] },
          { title: 'استقرار', description: 'انتشار روی Vercel یا سرور شخصی و متصل‌کردن دامنه.', skills: ['Deployment', 'Vercel'] },
        ],
      },
    ],
  },
  {
    slug: 'backend',
    title: 'بک‌اند',
    category: 'programming',
    kind: 'backend',
    icon: 'Server',
    color: 'emerald',
    description: 'منطق سمت سرور، دیتابیس و API؛ هر چیزی که پشت صحنه‌ی یک محصول دیجیتال کار می‌کند.',
    level: 'مقدماتی تا پیشرفته',
    estimatedHours: 300,
    aliases: ['بک اند', 'بک‌اند', 'backend', 'back-end', 'back end', 'سرور', 'server', 'api', 'دیتابیس', 'پایگاه داده', 'node', 'nodejs', 'پایتون بک‌اند'],
    stages: [
      {
        title: 'مفاهیم پایه‌ی سرور',
        goal: 'بفهمی یک درخواست از مرورگر تا سرور چه مسیری را طی می‌کند.',
        duration: '۲ هفته',
        steps: [
          { title: 'اینترنت چطور کار می‌کند', description: 'HTTP، دامنه، DNS و کلاینت-سرور.', skills: ['HTTP', 'DNS'] },
          { title: 'REST و API', description: 'متدها، کدهای وضعیت و طراحی endpointهای تمیز.', skills: ['REST', 'JSON', 'API'] },
          { title: 'امنیت پایه', description: 'HTTPS، هش‌کردن گذرواژه و مفهوم توکن.', skills: ['Security', 'Auth'] },
        ],
      },
      {
        title: 'زبان سمت سرور',
        goal: 'با یک زبان (پایتون یا جاوااسکریپت) سرویس بنویسی.',
        duration: '۴ تا ۶ هفته',
        steps: [
          { title: 'پایه‌ی زبان', description: 'ساختار داده، تابع، خطا و ماژول‌ها.', skills: ['Python یا Node.js'], lesson: { subject: 'python', slug: 'hello-python' } },
          { title: 'چارچوب وب', description: 'Express یا FastAPI: ساخت سرور و مسیرها.', skills: ['Express', 'FastAPI'] },
          { title: 'اعتبارسنجی و خطا', description: 'ورودی کاربر را همیشه بررسی و پاسخ خطا را استاندارد کن.', skills: ['Validation', 'Error Handling'] },
        ],
      },
      {
        title: 'دیتابیس',
        goal: 'داده‌ها را درست ذخیره، بازیابی و مدل‌سازی کنی.',
        duration: '۴ تا ۵ هفته',
        steps: [
          { title: 'SQL پایه', description: 'SELECT، JOIN، گروه‌بندی و نوشتن کوئری خوانا.', skills: ['SQL', 'PostgreSQL'] },
          { title: 'طراحی جدول', description: 'کلیدها، رابطه‌ها و نرمال‌سازی.', skills: ['Modeling', 'Relations'] },
          { title: 'ORM و مهاجرت', description: 'کار با Prisma یا SQLAlchemy و نسخه‌بندی تغییرات دیتابیس.', skills: ['ORM', 'Migrations'] },
        ],
      },
      {
        title: 'ساخت محصول واقعی',
        goal: 'سرویسی بسازی که قابل استفاده، تست‌پذیر و قابل نگهداری باشد.',
        duration: '۴ تا ۶ هفته',
        steps: [
          { title: 'احراز هویت', description: 'ورود، ثبت‌نام، نقش‌ها و سشن یا JWT.', skills: ['JWT', 'Sessions'] },
          { title: 'تست سمت سرور', description: 'تست واحد و تست یکپارچه برای endpointها.', skills: ['Unit Test', 'Integration Test'] },
          { title: 'کش و کارایی', description: 'Redis، صفحه‌بندی و بهینه‌سازی کوئری‌ها.', skills: ['Caching', 'Optimization'] },
        ],
      },
      {
        title: 'استقرار و نگهداری',
        goal: 'سرویس‌ات را در محیط واقعی بالا بیاوری و پایش کنی.',
        duration: '۳ هفته',
        steps: [
          { title: 'Docker', description: 'بسته‌بندی برنامه و اجرای یکسان در هر محیط.', skills: ['Docker', 'Containers'] },
          { title: 'CI/CD', description: 'تست و انتشار خودکار با هر push.', skills: ['CI/CD', 'GitHub Actions'] },
          { title: 'پایش و لاگ', description: 'ثبت خطا، مانیتورینگ و هشدار.', skills: ['Logging', 'Monitoring'] },
        ],
      },
    ],
  },
  {
    slug: 'python',
    title: 'زبان پایتون',
    category: 'programming',
    kind: 'language',
    icon: 'Terminal',
    color: 'yellow',
    description: 'ساده‌ترین زبان برای شروع برنامه‌نویسی؛ از اولین دستور تا پروژه‌های واقعی و اتوماسیون.',
    level: 'مقدماتی تا متوسط',
    estimatedHours: 160,
    aliases: ['پایتون', 'python', 'py', 'زبان پایتون', 'پيتون', 'پایتون یادگیری'],
    stages: [
      {
        title: 'شروع برنامه‌نویسی',
        goal: 'محیط پایتون را آماده کنی و اولین برنامه‌ات را اجرا کنی.',
        duration: '۱ هفته',
        steps: [
          { title: 'نصب و اجرا', description: 'نصب پایتون، اجرای اسکریپت و کار با ترمینال.', skills: ['Python', 'Terminal'], lesson: { subject: 'python', slug: 'hello-python' } },
          { title: 'متغیرها و انواع داده', description: 'رشته، عدد، لیست و دیکشنری.', skills: ['Variables', 'Types'], lesson: { subject: 'python', slug: 'python-variables' } },
        ],
      },
      {
        title: 'منطق برنامه',
        goal: 'با شرط و حلقه، برنامه‌های تصمیم‌گیرنده بنویسی.',
        duration: '۲ هفته',
        steps: [
          { title: 'شرط‌ها', description: 'if / elif / else و عملگرهای منطقی.', skills: ['Conditions'] },
          { title: 'حلقه‌ها', description: 'for و while و پیمایش داده‌ها.', skills: ['Loops'] },
          { title: 'تابع', description: 'ورودی، خروجی، مقدار پیش‌فرض و بُعد دادن به کد.', skills: ['Functions'] },
        ],
      },
      {
        title: 'ساختارهای داده',
        goal: 'داده‌ها را کارآمد نگه داری و پردازش کنی.',
        duration: '۲ تا ۳ هفته',
        steps: [
          { title: 'لیست و دیکشنری', description: 'متدهای پرکاربرد و الگوهای رایج.', skills: ['List', 'Dict'] },
          { title: 'فایل و مسیر', description: 'خواندن و نوشتن فایل متنی و CSV.', skills: ['Files', 'IO'] },
          { title: 'خطاها', description: 'try / except و مدیریت شرایط غیرمنتظره.', skills: ['Exceptions'] },
        ],
      },
      {
        title: 'شیءگرایی و ماژول',
        goal: 'کد بزرگ‌تر را سازمان‌دهی کنی.',
        duration: '۲ هفته',
        steps: [
          { title: 'کلاس و شیء', description: 'ساخت نوع‌های دلخواه و رفتارهایشان.', skills: ['OOP'] },
          { title: 'ماژول و پکیج', description: 'تقسیم پروژه به فایل‌ها و استفاده از کتابخانه‌ها.', skills: ['Modules', 'pip'] },
        ],
      },
      {
        title: 'پروژه‌ی واقعی',
        goal: 'با پروژه یاد بگیری؛ یک ابزار کوچک بساز که به کارت بیاید.',
        duration: '۳ تا ۴ هفته',
        steps: [
          { title: 'اتوماسیون', description: 'پردازش فایل‌ها، وب‌اسکرپینگ ساده و اسکریپت‌های روزمره.', skills: ['Automation'] },
          { title: 'کار با API', description: 'دریافت داده از سرویس‌های اینترنتی و پردازش آن.', skills: ['Requests', 'JSON'] },
          { title: 'گام بعدی', description: 'داده‌کاوی، یادگیری ماشین یا بک‌اند با FastAPI — هر مسیری که دوست داری.', skills: ['Data', 'ML', 'API'] },
        ],
      },
    ],
  },
  {
    slug: 'javascript',
    title: 'جاوااسکریپت',
    category: 'programming',
    kind: 'language',
    icon: 'Braces',
    color: 'yellow',
    description: 'زبان وب که هم در مرورگر و هم روی سرور اجرا می‌شود؛ پل میان فرانت‌اند و بک‌اند.',
    level: 'مقدماتی تا متوسط',
    estimatedHours: 180,
    aliases: ['جاوااسکریپت', 'جاوا اسکریپت', 'javascript', 'js', 'اسکریپت', 'nodejs', 'node'],
    stages: [
      {
        title: 'آشنایی با زبان',
        goal: 'منطق جاوااسکریپت را بشناسی و در کنسول مرورگر تمرین کنی.',
        duration: '۱ تا ۲ هفته',
        steps: [
          { title: 'جاوااسکریپت چیست', description: 'تاریخچه، کاربرد و نقش آن در وب.', skills: ['JavaScript'], lesson: { subject: 'javascript', slug: 'intro-js' } },
          { title: 'متغیر و نوع داده', description: 'let و const، رشته، عدد، آرایه و شیء.', skills: ['Variables', 'Types'], lesson: { subject: 'javascript', slug: 'js-variables' } },
        ],
      },
      {
        title: 'کنترل جریان',
        goal: 'برنامه‌های تصمیم‌گیرنده و تکرارشونده بنویسی.',
        duration: '۲ هفته',
        steps: [
          { title: 'شرط و حلقه', description: 'if / switch و for / while.', skills: ['Conditions', 'Loops'] },
          { title: 'تابع و کال‌بک', description: 'تعریف تابع، فانکشن‌های فلشی و پاسخ‌دادن تابع به تابع.', skills: ['Functions', 'Callback'] },
          { title: 'متدهای آرایه', description: 'map، filter و reduce؛ قلب تپنده‌ی کد مدرن.', skills: ['Array Methods'] },
        ],
      },
      {
        title: 'مرورگر و DOM',
        goal: 'صفحه‌ی زنده بسازی؛ دکمه‌ها کار کنند و محتوا تغییر کند.',
        duration: '۲ تا ۳ هفته',
        steps: [
          { title: 'DOM', description: 'انتخاب، ساخت و تغییر عناصر صفحه.', skills: ['DOM'] },
          { title: 'رویدادها', description: 'کلیک، ارسال فرم و ورودی کاربر.', skills: ['Events', 'Forms'] },
          { title: 'ذخیره‌ی محلی', description: 'localStorage و نگه‌داشتن وضعیت کاربر.', skills: ['Storage'] },
        ],
      },
      {
        title: 'جاوااسکریپت نوین',
        goal: 'با الگوهای امروزی و ابزارهای حرفه‌ای کد بنویسی.',
        duration: '۳ هفته',
        steps: [
          { title: 'Promise و async/await', description: 'کار با عملیات زمان‌بر بدون فریزشدن صفحه.', skills: ['Async', 'Promise'] },
          { title: 'ماژول‌ها', description: 'import / export و ساختار پروژه‌ی چندفایلی.', skills: ['ESM'] },
          { title: 'TypeScript', description: 'افزودن تایپ برای پروژه‌های بزرگ‌تر.', skills: ['TypeScript'] },
        ],
      },
      {
        title: 'مسیر تخصصی',
        goal: 'یک شاخه انتخاب کن و عمیق شو.',
        duration: '۴ تا ۶ هفته',
        steps: [
          { title: 'فرانت‌اند با React', description: 'ساخت رابط کاربری مدرن.', skills: ['React'], },
          { title: 'بک‌اند با Node.js', description: 'ساخت API و سرویس با Express.', skills: ['Node.js', 'Express'] },
        ],
      },
    ],
  },
  {
    slug: 'c',
    title: 'زبان C',
    category: 'programming',
    kind: 'language',
    icon: 'Cpu',
    color: 'blue',
    description: 'درک ماشین از نزدیک؛ حافظه، اشاره‌گر و سرعت. بهترین شروع برای فهمیدن «پشت صحنه»ی برنامه‌ها.',
    level: 'مقدماتی تا پیشرفته',
    estimatedHours: 140,
    aliases: ['زبان c', 'زبان سی', 'c', 'سي', 'c language', 'c programming', 'سی پلاس‌پلاس'],
    stages: [
      {
        title: 'شروع کار',
        goal: 'کامپایلر را نصب کنی و اولین برنامه را بسازی.',
        duration: '۱ هفته',
        steps: [
          { title: 'اولین برنامه', description: 'ساختار یک برنامه‌ی C و اجرای آن.', skills: ['Compiler', 'main'], lesson: { subject: 'c', slug: 'first-program' } },
          { title: 'متغیر و نوع داده', description: 'int، float، char و قالب‌بندی خروجی.', skills: ['Variables', 'printf'] },
        ],
      },
      {
        title: 'کنترل جریان',
        goal: 'با شرط و حلقه برنامه‌های منطقی بنویسی.',
        duration: '۲ هفته',
        steps: [
          { title: 'شرط‌ها و حلقه‌ها', description: 'if / else و for / while.', skills: ['Control Flow'] },
          { title: 'تابع', description: 'تقسیم برنامه به قطعه‌های قابل استفاده‌ی مجدد.', skills: ['Functions'] },
          { title: 'آرایه و رشته', description: 'ذخیره‌ی مجموعه‌ای از داده‌ها.', skills: ['Arrays', 'Strings'] },
        ],
      },
      {
        title: 'قلب C: اشاره‌گر و حافظه',
        goal: 'چیزی را یاد بگیری که هیچ زبان سطح بالایی به تو نمی‌آموزد.',
        duration: '۳ تا ۴ هفته',
        steps: [
          { title: 'اشاره‌گر', description: 'آدرس، مقدار و ارجاع به حافظه.', skills: ['Pointers'] },
          { title: 'حافظه‌ی پویا', description: 'malloc و free و جلوگیری از نشت حافظه.', skills: ['Memory', 'malloc'] },
          { title: 'struct و فایل', description: 'ساخت نوع‌های دلخواه و ذخیره‌ی داده در فایل.', skills: ['Struct', 'File IO'] },
        ],
      },
      {
        title: 'پروژه و بهینه‌سازی',
        goal: 'با ساختن یاد بگیر و مهندسی نرم‌افزار را تمرین کن.',
        duration: '۳ هفته',
        steps: [
          { title: 'پروژه‌ی کوچک', description: 'مثلاً ماشین‌حساب، بازی ساده یا ابزار خط فرمان.', skills: ['Projects'] },
          { title: 'دیباگ و تست', description: 'کار با gdb و نوشتن تست‌های ساده.', skills: ['Debugging', 'Testing'] },
        ],
      },
    ],
  },
  {
    slug: 'math',
    title: 'ریاضی',
    category: 'science',
    kind: 'math',
    icon: 'Sigma',
    color: 'violet',
    description: 'ریاضی برای فهمیدن دنیا و برنامه‌نویسی؛ از جبر و تابع تا حد، مشتق و انتگرال با نمودار و مثال.',
    level: 'مقدماتی تا متوسط',
    estimatedHours: 120,
    aliases: ['ریاضی', 'رياضيات', 'math', 'mathematics', 'ریاضیات', 'حد', 'مشتق', 'انتگرال', 'جبر', 'تابع', 'حسابان'],
    stages: [
      {
        title: 'پایه‌های جبر',
        goal: 'با عبارت‌ها، معادله‌ها و تابع راحت شوی.',
        duration: '۳ هفته',
        steps: [
          { title: 'عبارت و معادله', description: 'ساده‌سازی، جابه‌جایی و حل معادله‌ی خطی.', skills: ['Algebra'] },
          { title: 'تابع', description: 'دامنه، بُرد و نمودار تابع.', skills: ['Functions'] },
          { title: 'تابع درجه‌ی دو', description: 'سهمی، ریشه‌ها و نقطه‌ی بیشینه/کمینه.', skills: ['Quadratic'], lesson: { subject: 'math', slug: 'limit-intro' } },
        ],
      },
      {
        title: 'حد و پیوستگی',
        goal: 'مفهوم «نزدیک‌شدن» را دقیق و ریاضی بفهمی.',
        duration: '۲ تا ۳ هفته',
        steps: [
          { title: 'مفهوم حد', description: 'وقتی x به عددی نزدیک می‌شود، تابع کجا می‌رود؟', skills: ['Limits'], lesson: { subject: 'math', slug: 'limit-intro' } },
          { title: 'محاسبه‌ی حد', description: 'ساده‌سازی عبارت و قانون‌های پایه.', skills: ['Limit Rules'] },
          { title: 'پیوستگی', description: 'تابع بدون پرش و رابطه‌اش با حد.', skills: ['Continuity'] },
        ],
      },
      {
        title: 'مشتق',
        goal: 'نرخ تغییر را اندازه بگیری؛ از سرعت لحظه‌ای تا بهینه‌سازی.',
        duration: '۳ هفته',
        steps: [
          { title: 'مشتق چیست', description: 'شیب خط مماس و تعریف با حد.', skills: ['Derivative'] },
          { title: 'قواعد مشتق‌گیری', description: 'توان، ضرب، تقسیم و زنجیره‌ای.', skills: ['Differentiation'] },
          { title: 'کاربردها', description: 'بیشینه و کمینه، سرعت و شتاب.', skills: ['Optimization'] },
        ],
      },
      {
        title: 'انتگرال',
        goal: 'مساحت زیر منحنی و جمع تغییرات پیوسته را حساب کنی.',
        duration: '۳ هفته',
        steps: [
          { title: 'انتگرال معین', description: 'مساحت و رابطه‌اش با مشتق.', skills: ['Integral'] },
          { title: 'روش‌های انتگرال‌گیری', description: 'جایگذاری و انتگرال‌گیری جزءبه‌جزء.', skills: ['Integration'] },
        ],
      },
      {
        title: 'ریاضی برای برنامه‌نویس',
        goal: 'آن بخش از ریاضی را یاد بگیری که در الگوریتم و داده به کارت می‌آید.',
        duration: '۲ تا ۳ هفته',
        steps: [
          { title: 'منطق و مجموعه‌ها', description: 'گزاره‌ها، اثبات و مجموعه؛ زبان الگوریتم.', skills: ['Logic', 'Sets'] },
          { title: 'احتمال و آمار', description: 'درک داده‌ها و تصمیم‌گیری با اعداد.', skills: ['Probability', 'Statistics'] },
          { title: 'جبر خطی ساده', description: 'بردار، ماتریس و چرا برای گرافیک و یادگیری ماشین لازم است.', skills: ['Linear Algebra'] },
        ],
      },
    ],
  },
  {
    slug: 'physics',
    title: 'فیزیک',
    category: 'science',
    kind: 'physics',
    icon: 'Atom',
    color: 'emerald',
    description: 'از نیرو و حرکت تا الکتریسیته؛ فهمیدن قوانین طبیعت با فرمول، نمودار و مسئله‌ی حل‌شده.',
    level: 'مقدماتی تا متوسط',
    estimatedHours: 110,
    aliases: ['فیزیک', 'فیزيك', 'physics', 'مکانیک', 'مكانيك', 'الکتریسیته', 'برق', 'نیوتن', 'انرژی'],
    stages: [
      {
        title: 'مکانیک کلاسیک',
        goal: 'حرکت اجسام و علت آن را با ریاضی توصیف کنی.',
        duration: '۳ تا ۴ هفته',
        steps: [
          { title: 'حرکت و بردار', description: 'جابه‌جایی، سرعت، شتاب و تحلیل برداری.', skills: ['Kinematics', 'Vectors'] },
          { title: 'قوانین نیوتن', description: 'سه قانون حرکت و نیروهای وارد بر جسم.', skills: ['Newton Laws'], lesson: { subject: 'physics', slug: 'newton-laws' } },
          { title: 'کار و انرژی', description: 'قضیه‌ی کار-انرژی و پایستگی انرژی.', skills: ['Energy', 'Work'] },
          { title: 'تکانه', description: 'برخوردها و پایستگی تکانه.', skills: ['Momentum'] },
        ],
      },
      {
        title: 'گرما و امواج',
        goal: 'رفتار ماده و امواج را بشناسی.',
        duration: '۲ تا ۳ هفته',
        steps: [
          { title: 'دما و گرما', description: 'ظرفیت گرمایی و تغییر فاز.', skills: ['Thermodynamics'] },
          { title: 'موج', description: 'بسامد، طول موج و صوت.', skills: ['Waves'] },
          { title: 'نور', description: 'بازتاب، شکست و عدسی‌ها.', skills: ['Optics'] },
        ],
      },
      {
        title: 'الکتریسیته و مغناطیس',
        goal: 'مبانی الکتریکی را بفهمی؛ پایه‌ی هر دستگاهی که استفاده می‌کنی.',
        duration: '۳ هفته',
        steps: [
          { title: 'بار و مدار', description: 'ولتاژ، جریان، مقاومت و قانون اهم.', skills: ['Circuits', 'Ohm Law'] },
          { title: 'مغناطیس', description: 'میدان مغناطیسی و القا.', skills: ['Magnetism'] },
          { title: 'الکترومغناطیس', description: 'موج الکترومغناطیسی و کاربردهایش.', skills: ['EM Waves'] },
        ],
      },
      {
        title: 'فیزیک مدرن',
        goal: 'نگاهی به قرن بیستم بیندازی؛ نسبیت و کوانتوم.',
        duration: '۲ هفته',
        steps: [
          { title: 'نسبیت خاص', description: 'زمان و طول در سرعت‌های بالا.', skills: ['Relativity'] },
          { title: 'کوانتوم ساده', description: 'فوتون، اتم و دوگانگی موج-ذره.', skills: ['Quantum'] },
        ],
      },
    ],
  },
];

export function getRoadmaps(): Roadmap[] {
  return ROADMAPS;
}

export function getRoadmap(slug: string): Roadmap | null {
  return ROADMAPS.find((roadmap) => roadmap.slug === slug) || null;
}

export function countRoadmapSteps(roadmap: Roadmap) {
  return roadmap.stages.reduce((total, stage) => total + stage.steps.length, 0);
}

/** Normalizes Persian/Arabic spelling so «جاوا اسکریپت», «js» and «JavaScript» all match. */
export function normalizeText(value: string) {
  return value
    .toLocaleLowerCase('fa-IR')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/‌/g, ' ')
    .replace(/[\u200f\u200e]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type RoadmapMatch = { roadmap: Roadmap; score: number };

/** Best-first matches for a search box query; empty query means everything. */
export function matchRoadmaps(query: string): RoadmapMatch[] {
  const needle = normalizeText(query);
  if (!needle) return ROADMAPS.map((roadmap) => ({ roadmap, score: 0 }));

  return ROADMAPS.map((roadmap) => {
    const names = [roadmap.title, roadmap.slug, ...roadmap.aliases].map(normalizeText);
    let score = 0;
    for (const name of names) {
      if (name === needle) score = Math.max(score, 100);
      else if (name.startsWith(needle) || needle.startsWith(name)) score = Math.max(score, 70);
      else if (name.includes(needle) || needle.includes(name)) score = Math.max(score, 45);
      else if (needle.split(' ').some((word) => word.length > 1 && name.includes(word))) score = Math.max(score, 25);
    }
    return { roadmap, score };
  })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** The single roadmap the search box should jump to, or null. */
export function bestRoadmapMatch(query: string): Roadmap | null {
  const [best] = matchRoadmaps(query);
  return best ? best.roadmap : null;
}
