// app/utils/data.ts

export const lessonsData: Record<string, Record<string, any>> = {
    javascript: {
        'intro-js': {
            title: 'مقدمه و آشنایی با جاوااسکریپت',
            module: 'شروع کار',
            duration: '۱۵ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">جاوااسکریپت چیست؟</h3>
                <p class="text-muted-foreground mb-4">
                    جاوااسکریپت یک زبان برنامه‌نویسی سطح‌بالا، پویا و چندمنظوره است که برای توسعه وب استفاده می‌شود و زبانی هست که در مرورگر اجرا میشود و باعث میشه صفحات وب زنده و تعاملی بشه مثلا وقتی روی دکمه کلیک میکنی و یک متن عوض میشه این کار را جاوااسکریپت انجام داده.
                </p>
                <h4 class="text-xl font-bold text-foreground mb-3 mt-6">چرا جاوااسکریپت یاد بگیریم؟</h4>
                <ul class="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                    <li>برای توسعه وب ضروری است</li>
                    <li>هم در فرانت‌اند و هم در بک‌اند (Node.js) استفاده می‌شود</li>
                    <li>برنامه‌های وب تعاملی را قدرت می‌بخشد</li>
                    <li>تقاضای بالا در بازار کار</li>
                </ul>
            `
        },
        'variables-types': {
            title: 'متغیرها و انواع داده',
            module: 'مبانی',
            duration: '۲۰ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">آشنایی با متغیرها</h3>
                <p class="text-muted-foreground mb-4">
                    متغیرها ظرف‌هایی برای ذخیره مقادیر داده هستند. جاوااسکریپت از const، let و var برای تعریف متغیرها استفاده می‌کند.
                </p>
                <h4 class="text-xl font-bold text-foreground mb-3 mt-6">انواع داده</h4>
                <ul class="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                    <li>اولیه: عدد، رشته، بولین، تهی، تعریف‌نشده</li>
                    <li>پیچیده: شیء، آرایه، تابع</li>
                </ul>
            `
        },
        'functions': {
            title: 'توابع و حیطه (Scope)',
            module: 'متوسط',
            duration: '۳۰ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">آشنایی با توابع</h3>
                <p class="text-muted-foreground mb-4">
                    توابع بلوک‌های قابل استفاده مجدد از کد هستند که کارهای مشخصی را انجام می‌دهند.
                </p>
                <h4 class="text-xl font-bold text-foreground mb-3 mt-6">مفاهیم کلیدی</h4>
                <ul class="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                    <li>تعریف تابع (Function declarations)</li>
                    <li>توابع پیکانی (Arrow functions - ES6)</li>
                    <li>حیطه تابع و حیطه بلوک</li>
                </ul>
            `
        },
        'async': {
            title: 'برنامه‌نویسی ناهمگام (Async) و پرامیس‌ها',
            module: 'متوسط',
            duration: '۳۸ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">جاوااسکریپت ناهمگام</h3>
                <p class="text-muted-foreground mb-4">
                    کد ناهمگام به برنامه شما اجازه می‌دهد بدون مسدود کردن تعامل کاربر، عملیات طولانی را انجام دهد.
                </p>
            `
        }
    },
    react: {
        'react-intro': {
            title: 'مبانی ریکت',
            module: 'شروع کار',
            duration: '۲۰ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">مقدمه‌ای بر ریکت</h3>
                <p class="text-muted-foreground mb-4">
                    ریکت یک کتابخانه جاوااسکریپت برای ساخت رابط‌های کاربری با استفاده از کامپوننت‌های قابل استفاده مجدد است.
                </p>
            `
        },
        'hooks': {
            title: 'هوک‌های ریکت',
            module: 'متوسط',
            duration: '۳۵ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">آشنایی با هوک‌ها</h3>
                <p class="text-muted-foreground mb-4">
                    هوک‌ها توابعی هستند که به شما اجازه می‌دهند در کامپوننت‌های تابعی از state و سایر ویژگی‌های ریکت استفاده کنید.
                </p>
            `
        }
    },
    nextjs: {
        'nextjs-intro': {
            title: 'مبانی Next.js',
            module: 'شروع کار',
            duration: '۲۰ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">مقدمه‌ای بر Next.js</h3>
                <p class="text-muted-foreground mb-4">
                    Next.js یک فریم‌ورک ریکت است که توسعه برنامه‌های full-stack را با توابع سرورلس امکان‌پذیر می‌کند.
                </p>
            `
        },
        'routing': {
            title: 'مسیریاب اپ (App Router)',
            module: 'مبانی',
            duration: '۲۵ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">مسیریاب اپ در Next.js</h3>
                <p class="text-muted-foreground mb-4">
                    مسیریاب اپ، سیستم مسیریابی مبتنی بر فایل Next.js برای برنامه‌های وب مدرن است.
                </p>
            `
        }
    },
    typescript: {
        'ts-intro': {
            title: 'مبانی تایپ‌اسکریپت',
            module: 'شروع کار',
            duration: '۲۰ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">تایپ‌اسکریپت چیست؟</h3>
                <p class="text-muted-foreground mb-4">
                    تایپ‌اسکریپت یک ابرمجموعهٔ نوع‌دار از جاوااسکریپت است که به جاوااسکریپت معمولی کامپایل می‌شود.
                </p>
            `
        },
        'types': {
            title: 'نوع‌ها و واسط‌ها (Types & Interfaces)',
            module: 'مبانی',
            duration: '۲۸ دقیقه',
            content: `
                <h3 class="text-2xl font-bold text-foreground mb-4">نوع‌ها در تایپ‌اسکریپت</h3>
                <p class="text-muted-foreground mb-4">
                    با نوع‌های پایه و نحوه ایجاد واسط‌ها (Interfaces) برای ایمنی نوع داده آشنا شوید.
                </p>
            `
        }
    }
};