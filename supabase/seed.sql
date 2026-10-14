-- ════════════════════════════════════════════════════════════════════════════
--  CodeMage — داده‌ی نمونه (اختیاری ولی توصیه‌شده)
-- ════════════════════════════════════════════════════════════════════════════
--
--  چه چیزی می‌سازد؟
--    • موضوع «زبان C» با ۶ سرفصل و ۱۰ درس (۹ منتشرشده + ۱ پیش‌نویس) و ۱۱ تمرین
--    • موضوع «ریاضی» با ۳ سرفصل و ۱ درس (با فرمول KaTeX) و ۲ تمرین
--    • موضوع «فیزیک» با ۲ سرفصل و ۱ درس و ۱ تمرین
--    • چند برچسب + متن‌های تنظیمات صفحه‌ی اصلی
--
--  این فایل را بعد از schema.sql اجرا کن.
--
--  ⚠️ توجه: این فایل داده‌های نمونه‌ی موضوع‌های c / math / physics را
--     پاک و از نو می‌سازد. اگر خودت روی این سه موضوع محتوا اضافه کرده‌ای،
--     دوباره اجرا نکن.
-- ════════════════════════════════════════════════════════════════════════════

do $seed$
declare
  v_c        uuid;   -- زبان C
  v_math     uuid;   -- ریاضی
  v_physics  uuid;   -- فیزیک

  v_ch       uuid;   -- سرفصل جاری
  v_l        uuid;   -- درس جاری
begin

  -- ── پاک‌سازی نمونه‌های قبلی ────────────────────────────────────────────────
  delete from public.subjects where slug in ('c', 'math', 'physics');
  delete from public.tags     where slug in ('algorithm', 'math-for-devs', 'memory', 'mechanics');


  -- ══════════════════════════════════════════════════════════════════════════
  --  ۱) موضوع: زبان C
  -- ══════════════════════════════════════════════════════════════════════════
  insert into public.subjects (slug, title, description, icon, color, kind, level, order_index)
  values ('c', 'زبان C',
          'از صفر تا اشاره‌گرها؛ یادداشت‌های من از یادگیری زبان C با مثال‌های کوتاه و تمرین',
          'Braces', 'blue', 'programming', 'مقدماتی تا پیشرفته', 1)
  returning id into v_c;

  -- ── سرفصل ۱: شروع کار ─────────────────────────────────────────────────────
  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_c, 'getting-started', 'شروع کار',
          'آشنایی با زبان C، نصب کامپایلر و اجرای اولین برنامه', 1)
  returning id into v_ch;

  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'first-program', 'اولین برنامه در C',
    'زبان C چیست و اولین برنامه را چطور بنویسیم و اجرا کنیم؟',
    15, 'published', true, 1,
    $md$
## زبان C چیست؟

**C** یک زبان برنامه‌نویسی سطح میانی است که در سال ۱۹۷۲ ساخته شد و هنوز هم پایه‌ی
سیستم‌عامل‌ها (لینوکس)، میکروکنترلرها و بسیاری از زبان‌های امروزی است.

> **چرا C یاد بگیریم؟**
> - یاد می‌گیری کامپیوتر واقعاً چطور کار می‌کند (حافظه، اشاره‌گر، stack)
> - بعد از آن، یادگیری C++، Java و حتی Python خیلی راحت‌تر می‌شود
> - سرعت اجرای آن فوق‌العاده بالاست

## اولین برنامه

```c
#include <stdio.h>

int main(void) {
    printf("سلام دنیا!\n");
    return 0;
}
```

خروجی برنامه:

```text
سلام دنیا!
```

### توضیح خط به خط

۱. `#include <stdio.h>` کتابخانه‌ی ورودی/خروجی را اضافه می‌کند؛ بدون آن، تابع `printf` را نمی‌شناسیم.
۲. `int main(void)` نقطه‌ی شروع هر برنامه‌ی C است. اجرای برنامه همیشه از `main` شروع می‌شود.
۳. `printf(...)` متن را روی صفحه چاپ می‌کند و `\n` یعنی «برو به خط بعد».
۴. `return 0;` یعنی برنامه بدون خطا تمام شد.

## مراحل اجرا

```bash
# ۱) کامپایل کردن
gcc hello.c -o hello

# ۲) اجرا کردن
./hello
```

| دستور | کار |
| --- | --- |
| `gcc hello.c -o hello` | فایل `hello.c` را کامپایل می‌کند و خروجی `hello` می‌سازد |
| `./hello` | برنامه را اجرا می‌کند |

> **نکته:** اسم فایل را حتماً با پسوند `.c` ذخیره کن. اگر خطا گرفتی، متن خطا را بخوان؛
> کامپایلر شماره‌ی خط خطادار را دقیق می‌گوید.

### اشتباه‌های رایج تازه‌کارها

- فراموش کردن `;` در آخر دستور ← خطای `expected ';'`
- نوشتن `Printf` با P بزرگ ← در C حروف کوچک و بزرگ مهم‌اند
- جاگذاری `"` فارسی به‌جای `"` انگلیسی داخل `printf`
$md$
  )
  returning id into v_l;

  insert into public.exercises (lesson_id, title, question, kind, options, correct_option, solution, difficulty, order_index)
  values
    (v_l, 'انتخاب گزینه', 'اجرای برنامه‌ی C از کدام تابع شروع می‌شود؟', 'choice',
     '["main", "printf", "start", "init"]'::jsonb, 0,
     'هر برنامه‌ی C از تابع `main` شروع می‌شود؛ حتی اگر بالای آن تابع دیگری نوشته باشی.', 'easy', 1),

    (v_l, 'تمرین کدنویسی', 'برنامه‌ای بنویس که نام خودت را در یک خط چاپ کند.', 'code', null, null,
     'فقط کافی است متن را داخل `printf` بنویسی:', 'easy', 2),

    (v_l, 'خروجی چیست؟',
     'خروجی برنامه‌ی زیر چیست؟' || chr(10) || chr(10) ||
     '```c' || chr(10) || 'printf("C");' || chr(10) || 'printf(" is fun");' || chr(10) || '```',
     'text', null, null,
     'چون هیچ `\n` نگذاشته‌ایم، دو چاپ پشت سر هم می‌آیند و خروجی می‌شود: `C is fun`', 'medium', 3);

  update public.exercises
     set solution_code = 'printf("علی\n");', solution_language = 'c'
   where lesson_id = v_l and kind = 'code';

  update public.exercises
     set solution_code = 'C is fun', solution_language = 'text'
   where lesson_id = v_l and title = 'خروجی چیست؟';


  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'program-structure', 'ساختار یک برنامه‌ی C',
    'اجزای یک برنامه: هدرها، تابع main، کامنت و return',
    12, 'published', false, 2,
    $md$
## اجزای یک برنامه‌ی C

```c
/* این یک کامنت چندخطی است */

#include <stdio.h>      // هدر: کتابخانه‌ها را اضافه می‌کند

int main(void)          // تابع اصلی
{
    // بدنه‌ی برنامه اینجاست
    return 0;           // پایان موفق
}
```

سه بخش اصلی:

۱. **هدرها** — `#include` برای استفاده از کتابخانه‌های آماده
۲. **تابع `main`** — قلب برنامه؛ کدهایی که می‌نویسیم داخل آن اجرا می‌شوند
۳. **`return 0;`** — اعلام موفقیت به سیستم‌عامل

### کامنت‌ها

```c
// کامنت یک‌خطی
/* کامنت
   چندخطی */
```

> **نکته:** کامنت فقط برای خوانایی است؛ روی اجرای برنامه اثری ندارد.
$md$
  );


  -- ── سرفصل ۲: مبانی زبان ───────────────────────────────────────────────────
  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_c, 'basics', 'مبانی زبان',
          'متغیرها، انواع داده و ورودی/خروجی', 2)
  returning id into v_ch;

  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'variables', 'متغیرها و انواع داده',
    'چطور در C متغیر بسازیم و چه انواعی داریم؟',
    25, 'published', true, 1,
    $md$
## متغیر چیست؟

متغیر یک **جعبه** در حافظه است که یک اسم دارد و داخلش مقدار نگه می‌داریم.

```c
int age = 20;          // عدد صحیح
float price = 12.5;    // عدد اعشاری (دقت معمولی)
double pi = 3.14159;   // عدد اعشاری (دقت بالا)
char grade = 'A';      // یک کاراکتر
```

## انواع داده‌ی پرکاربرد

| نوع | چه چیزی نگه می‌دارد | مثال |
| --- | --- | --- |
| `int` | عدد صحیح | `int x = 5;` |
| `float` | عدد اعشاری (۷ رقم دقت) | `float f = 2.5;` |
| `double` | عدد اعشاری (۱۵ رقم دقت) | `double d = 3.14;` |
| `char` | یک کاراکتر | `char c = 'A';` |

> **نکته:** `'A'` (با کوتیشن تک) یک کاراکتر است و `"A"` (با کوتیشن جفت) یک رشته.
> در C رشته‌ی متنی یک آرایه از کاراکترهاست.

## تعریف و مقدار دادن

```c
int x;          // تعریف
x = 10;         // مقداردهی
int y = 20;     // هر دو با هم

x = x + 5;      // تغییر مقدار: الان x برابر ۱۵ است
```

## چاپ مقدار متغیرها

```c
#include <stdio.h>

int main(void) {
    int apples = 3;
    int oranges = 5;
    int total = apples + oranges;

    printf("جمع: %d\n", total);
    return 0;
}
```

| کد چاپ | نوع متناظر |
| --- | --- |
| `%d` یا `%i` | عدد صحیح (`int`) |
| `%f` | اعشاری (`float`/`double`) |
| `%c` | یک کاراکتر (`char`) |
| `%s` | رشته (`char[]`) |

### نکته‌ی مهم درباره‌ی اعداد اعشاری

```c
float f = 7 / 2;          // نتیجه: 3.0  ← چون تقسیم بین دو int است!
float g = 7.0 / 2;        // نتیجه: 3.5  ← حالا درست است
```

این یکی از پرتکرارترین اشتباه‌های تازه‌کارهاست: اگر هر دو طرف تقسیم `int` باشند،
C جواب را هم `int` حساب می‌کند.
$md$
  )
  returning id into v_l;

  insert into public.exercises (lesson_id, title, question, kind, options, correct_option, solution, difficulty, order_index)
  values
    (v_l, 'نوع مناسب', 'برای نگه‌داشتن سن یک نفر (عدد ۲۵) کدام نوع مناسب‌تر است؟', 'choice',
     '["int", "char", "float", "string"]'::jsonb, 0,
     'سن یک عدد صحیح است، پس `int` بهترین انتخاب است.', 'easy', 1),

    (v_l, 'پیش‌بینی خروجی',
     'خروجی کد زیر چیست؟' || chr(10) || chr(10) ||
     '```c' || chr(10) || 'int a = 5, b = 2;' || chr(10) || 'printf("%d\n", a / b);' || chr(10) || '```',
     'text', null, null,
     'چون `a` و `b` هر دو `int` هستند، تقسیم صحیح انجام می‌شود و خروجی `2` است. برای گرفتن `2.5` باید حداقل یکی را `float` کنی.', 'medium', 2),

    (v_l, 'تمرین کدنویسی', 'دو عدد بگیر و مجموع و میانگین آن‌ها را با پیام مناسب چاپ کن.', 'code', null, null,
     'از `printf` برای خروجی و از متغیر `float` برای میانگین استفاده کن.', 'medium', 3);

  update public.exercises
     set solution_code = $code$int a = 4, b = 6;
float avg = (a + b) / 2.0;
printf("مجموع: %d\n", a + b);
printf("میانگین: %.2f\n", avg);$code$,
         solution_language = 'c'
   where lesson_id = v_l and kind = 'code';


  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'input-output', 'ورودی و خروجی (printf و scanf)',
    'گرفتن مقدار از کاربر و چاپ کردن نتیجه',
    20, 'published', false, 2,
    $md$
## گرفتن ورودی از کاربر

```c
#include <stdio.h>

int main(void) {
    int age;

    printf("سن خود را وارد کنید: ");
    scanf("%d", &age);                 // & یعنی آدرس متغیر

    printf("سال دیگر %d ساله می‌شوی\n", age + 1);
    return 0;
}
```

> **نکته‌ی طلایی:** در `scanf` جلوی اسم متغیر باید `&` بگذاری،
> ولی در `printf` نه. فراموش کردن `&` باعث کرش برنامه می‌شود.

### چند نکته‌ی کاربردی

- برای گرفتن رشته از `%s` استفاده کن؛ اما `scanf` فقط تا اولین فاصله می‌خواند.
- برای خواندن یک خط کامل، `fgets` بهتر است.
- همیشه نتیجه‌ی `scanf` را بررسی کن؛ اگر کاربر عدد وارد نکند، مقدار برنمی‌گردد.
$md$
  );


  -- ── سرفصل ۳: کنترل جریان ──────────────────────────────────────────────────
  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_c, 'control-flow', 'کنترل جریان',
          'شرط‌ها و حلقه‌ها؛ تصمیم‌گیری و تکرار در برنامه', 3)
  returning id into v_ch;

  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'if-else', 'دستور شرطی if / else',
    'تصمیم‌گیری در برنامه با شرط‌ها',
    20, 'published', true, 1,
    $md$
## if ساده

```c
int score = 17;

if (score >= 10) {
    printf("قبول شدی\n");
}
```

## if / else

```c
if (score >= 10) {
    printf("قبول شدی\n");
} else {
    printf("باید دوباره تلاش کنی\n");
}
```

## if / else if / else

```c
if (score >= 18) {
    printf("عالی\n");
} else if (score >= 14) {
    printf("خوب\n");
} else if (score >= 10) {
    printf("قبول\n");
} else {
    printf("مردود\n");
}
```

## عملگرهای مقایسه

| عملگر | معنی |
| --- | --- |
| `==` | مساوی |
| `!=` | نامساوی |
| `>` `<` | بزرگ‌تر / کوچک‌تر |
| `>=` `<=` | بزرگ‌تر یا مساوی / کوچک‌تر یا مساوی |

> **دقت کن:** `=` برای مقدار دادن است و `==` برای مقایسه.
> نوشتن `if (x = 5)` یک خطای رایج و خطرناک است.
$md$
  )
  returning id into v_l;

  insert into public.exercises (lesson_id, title, question, kind, options, correct_option, solution, difficulty, order_index)
  values
    (v_l, 'عملگر درست', 'برای «مساوی بودن» دو عدد در شرط، کدام را بنویسیم؟', 'choice',
     '["==", "=", "!=", "==="]'::jsonb, 0,
     'در C علامت `==` برای مقایسه و `=` برای مقداردهی است.', 'easy', 1),

    (v_l, 'تمرین کدنویسی', 'برنامه‌ای بنویس که یک عدد بگیرد و بگوید زوج است یا فرد.', 'code', null, null,
     'از باقی‌مانده‌ی تقسیم استفاده کن: اگر `n % 2 == 0` زوج است.', 'easy', 2);

  update public.exercises
     set solution_code = $code$int n;
if (scanf("%d", &n) != 1) return 1;
if (n % 2 == 0)
    printf("زوج\n");
else
    printf("فرد\n");$code$,
         solution_language = 'c'
   where lesson_id = v_l and kind = 'code';


  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'loops', 'حلقه‌ها: for و while و do-while',
    'تکرار کارها بدون نوشتن کد تکراری',
    30, 'published', false, 2,
    $md$
## حلقه‌ی for

```c
for (int i = 1; i <= 5; i++) {
    printf("%d\n", i);
}
```

اجزای `for` به این ترتیب: مقدار اولیه ← شرط ادامه ← تغییر در هر دور.

## حلقه‌ی while

```c
int i = 1;
while (i <= 5) {
    printf("%d\n", i);
    i++;
}
```

## تفاوت while و do-while

```c
int i = 10;

while (i < 5) { printf("while\n"); }       // هیچ‌وقت اجرا نمی‌شود

do { printf("do-while\n"); } while (i < 5); // یک بار اجرا می‌شود
```

> **نکته:** `do-while` حداقل یک بار اجرا می‌شود، چون شرط بعد از بدنه بررسی می‌شود.

## حلقه‌ی بی‌نهایت و break / continue

```c
for (;;) {                 // حلقه‌ی بی‌نهایت
    break;                 // خروج از حلقه
}

for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;   // از این دور بپر
    printf("%d\n", i);
}
```
$md$
  );


  -- ── سرفصل ۴: توابع ────────────────────────────────────────────────────────
  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_c, 'functions', 'توابع',
          'شکستن برنامه به قطعه‌های کوچک و قابل استفاده‌ی مجدد', 4)
  returning id into v_ch;

  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'functions-intro', 'توابع در C',
    'تابع چیست، چطور می‌سازیم و چطور صدا می‌زنیم؟',
    25, 'published', false, 1,
    $md$
## چرا تابع؟

اگر یک کار را چند جا لازم داری، یک بار تابع می‌نویسی و چند جا صدایش می‌زنی.

## ساختار یک تابع

```text
نوع_خروجی نام_تابع(پارامترها) {
    // بدنه
    return مقدار;
}
```

مثال:

```c
#include <stdio.h>

// تابعی که دو عدد را جمع می‌کند
int sum(int a, int b) {
    return a + b;
}

// تابعی که خروجی ندارد
void greet(void) {
    printf("سلام!\n");
}

int main(void) {
    greet();
    printf("جمع = %d\n", sum(3, 4));
    return 0;
}
```

## void یعنی چه؟

`void` یعنی «هیچ». تابع `greet` هیچ مقداری برنمی‌گرداند و پارامتری هم نمی‌گیرد.

| نوع خروجی | معنی |
| --- | --- |
| `int` | یک عدد صحیح برمی‌گرداند |
| `float` / `double` | عدد اعشاری برمی‌گرداند |
| `void` | چیزی برنمی‌گرداند |

> **نکته:** تابع را همیشه **قبل از** `main` بنویس، یا اگر بعد از `main` نوشتی،
> اول «اعلان» (prototype) آن را بالای فایل بیاور:
> `int sum(int a, int b);`
$md$
  )
  returning id into v_l;

  insert into public.exercises (lesson_id, question, kind, solution, difficulty, order_index)
  values
    (v_l, 'تابعی بنویس که بزرگ‌ترین دو عدد را برگرداند.', 'code',
     'برای مقایسه از `if` استفاده کن و مقدار بزرگ‌تر را `return` کن.', 'medium', 1),
    (v_l, 'تابعی بنویس که بگوید یک عدد اول است یا نه.', 'code',
     'برای هر عدد از ۲ تا جذر `n` بررسی کن که باقی‌مانده‌ی تقسیم صفر نباشد.', 'hard', 2);

  update public.exercises
     set solution_code = $code$int max(int a, int b) {
    return (a > b) ? a : b;
}$code$, solution_language = 'c'
   where lesson_id = v_l and order_index = 1;

  update public.exercises
     set solution_code = $code$int is_prime(int n) {
    if (n < 2) return 0;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return 0;
    }
    return 1;
}$code$, solution_language = 'c'
   where lesson_id = v_l and order_index = 2;


  -- ── سرفصل ۵: آرایه‌ها ─────────────────────────────────────────────────────
  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_c, 'arrays', 'آرایه‌ها و رشته‌ها',
          'نگهداری چند مقدار در یک متغیر و کار با متن', 5)
  returning id into v_ch;

  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'arrays-intro', 'آرایه‌ها',
    'آرایه چیست و چطور روی عناصرش پیمایش کنیم؟',
    25, 'published', false, 1,
    $md$
## آرایه چیست؟

آرایه مجموعه‌ای از مقادیر **هم‌نوع** است که با یک اسم نگهداری می‌شوند.

```c
int scores[5] = {17, 20, 12, 19, 15};
```

ایندکس آرایه از **صفر** شروع می‌شود:

| ایندکس | ۰ | ۱ | ۲ | ۳ | ۴ |
| --- | --- | --- | --- | --- | --- |
| مقدار | 17 | 20 | 12 | 19 | 15 |

```c
printf("%d\n", scores[0]);   // 17
scores[2] = 18;              // تغییر مقدار خانه‌ی سوم
```

## پیمایش آرایه با حلقه

```c
int sum = 0;
for (int i = 0; i < 5; i++) {
    sum += scores[i];
}
printf("میانگین: %.2f\n", sum / 5.0);
```

## رشته‌ها در C

رشته یک آرایه از `char` است که با کاراکتر پایان `\0` تمام می‌شود.

```c
char name[20] = "Ali";
printf("سلام %s\n", name);
```

> **خطر!** در C مرزهای آرایه را خودت باید کنترل کنی.
> اگر `scores[10]` را صدا بزنی (در آرایه‌ی ۵ عنصری)، برنامه رفتار غیرقابل پیش‌بینی دارد.
$md$
  );


  -- ── سرفصل ۶: اشاره‌گرها ───────────────────────────────────────────────────
  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_c, 'pointers', 'اشاره‌گرها',
          'مهم‌ترین و خاص‌ترین بخش زبان C: کار مستقیم با آدرس حافظه', 6)
  returning id into v_ch;

  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'pointers-intro', 'اشاره‌گر چیست؟',
    'آدرس حافظه، عملگر & و * و چرا اشاره‌گر مهم است',
    35, 'published', true, 1,
    $md$
## هر متغیر یک آدرس دارد

```c
int x = 5;

printf("مقدار: %d\n", x);    // 5
printf("آدرس:  %p\n", &x);   // مثلاً 0x7ffd...
```

## اشاره‌گر: متغیری که آدرس نگه می‌دارد

```c
int x = 5;
int *p = &x;      // p آدرس x را نگه می‌دارد

printf("%d\n", *p);   // 5   ← * یعنی «مقدارِ آن آدرس»
*p = 10;              // از طریق آدرس، مقدار x را عوض می‌کنیم
printf("%d\n", x);    // 10
```

| علامت | معنی |
| --- | --- |
| `&x` | آدرس متغیر `x` |
| `*p` | مقداری که در آدرس `p` هست |
| `int *p` | تعریف اشاره‌گری به عدد صحیح |

## چرا اشاره‌گر مهم است؟

- بدون اشاره‌گر نمی‌توانی حافظه‌ی داینامیک بگیری (`malloc`)
- ساختمان داده‌هایی مثل لیست پیوندی و درخت با اشاره‌گر ساخته می‌شوند
- توابع می‌توانند مقدار متغیر بیرون خودشان را تغییر دهند

```c
void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);
    printf("%d %d\n", x, y);   // 2 1
    return 0;
}
```

> **نکته:** اگر اشاره‌گر به آدرسی اشاره کند که مال تو نیست، برنامه کرش می‌کند
> (`Segmentation fault`). همیشه مطمئن شو اشاره‌گر به یک آدرس معتبر اشاره می‌کند.
$md$
  )
  returning id into v_l;

  insert into public.exercises (lesson_id, question, kind, solution, difficulty, order_index)
  values
    (v_l,
     'خروجی برنامه‌ی زیر چیست؟' || chr(10) || chr(10) ||
     '```c' || chr(10) || 'int x = 3;' || chr(10) || 'int *p = &x;' || chr(10) ||
     '*p = *p + 2;' || chr(10) || 'printf("%d\n", x);' || chr(10) || '```',
     'text',
     'اشاره‌گر `p` به `x` اشاره می‌کند؛ با `*p = *p + 2` مقدار `x` برابر ۵ می‌شود. خروجی: `5`', 'medium', 1);

  -- یک درس پیش‌نویس، برای اینکه ببینی چطور درس منتشرنشده از دید کاربر مخفی می‌ماند
  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'dynamic-memory', 'حافظه‌ی داینامیک (malloc و free)',
    'هنوز در حال نوشتن این درس هستم…',
    40, 'draft', false, 2,
    $md$
## تخصیص حافظه در زمان اجرا

```c
#include <stdlib.h>

int *arr = malloc(5 * sizeof(int));
if (arr == NULL) return 1;

arr[0] = 10;
free(arr);      // آزاد کردن حافظه
```

> این درس هنوز کامل نشده و چون وضعیتش `draft` است، بازدیدکننده‌ها آن را نمی‌بینند.
$md$
  );


  -- ══════════════════════════════════════════════════════════════════════════
  --  ۲) موضوع: ریاضی  (نمونه‌ی فرمول با KaTeX)
  -- ══════════════════════════════════════════════════════════════════════════
  insert into public.subjects (slug, title, description, icon, color, kind, level, order_index)
  values ('math', 'ریاضی',
          'یادداشت‌های ریاضی من: حد، مشتق و انتگرال با فرمول‌نویسی و مثال',
          'Sigma', 'violet', 'math', 'مقدماتی', 2)
  returning id into v_math;

  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_math, 'limits', 'حد و پیوستگی', 'مفهوم حد و محاسبه‌ی آن', 1)
  returning id into v_ch;

  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'limit-intro', 'مفهوم حد',
    'حد چیست و چطور آن را حساب کنیم؟',
    20, 'published', true, 1,
    $md$
## حد یعنی چه؟

حد به ما می‌گوید وقتی $x$ به یک عدد **نزدیک** می‌شود، مقدار تابع به چه چیزی نزدیک می‌شود:

$$ \lim_{x \to 2} (3x + 1) = 7 $$

بدون اینکه لازم باشد تابع در آن نقطه تعریف شده باشد.

## چند حد مهم

$$ \lim_{x \to 0} \frac{\sin x}{x} = 1 $$

$$ \lim_{x \to \infty} \frac{1}{x} = 0 $$

$$ \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e \approx 2.718 $$

## مثال حل‌شده

$$ \lim_{x \to 3} \frac{x^2 - 9}{x - 3} $$

صورت و مخرج را تجزیه می‌کنیم:

$$ \frac{(x-3)(x+3)}{x-3} = x + 3 $$

پس:

$$ \lim_{x \to 3} (x + 3) = 6 $$

> **نکته:** وقتی با حالت $\frac{0}{0}$ روبه‌رو شدی، یعنی باید عبارت را ساده کنی
> (تجزیه، ضرب در مزدوج، یا قاعده‌ی هوپیتال).

## تعریف دقیق‌تر (ε و δ)

می‌گوییم $\lim_{x \to a} f(x) = L$ اگر برای هر $\varepsilon > 0$ یک $\delta > 0$ وجود داشته باشد
که اگر $0 < |x - a| < \delta$ آنگاه $|f(x) - L| < \varepsilon$.
$md$
  )
  returning id into v_l;

  insert into public.exercises (lesson_id, question, kind, options, correct_option, solution, difficulty, order_index)
  values
    (v_l, 'حد زیر را حساب کن: $\lim_{x \to 2} \frac{x^2 - 4}{x - 2}$',
     'choice',
     '["۴", "۲", "۰", "حد وجود ندارد"]'::jsonb, 0,
     'صورت تجزیه می‌شود: $(x-2)(x+2)$؛ با حذف $(x-2)$ جواب می‌شود $\lim_{x \to 2}(x+2) = 4$.', 'medium', 1),

    (v_l, 'حد زیر را حساب کن: $\lim_{x \to \infty} \frac{3x^2 + 5}{x^2 - 1}$', 'text', null, null,
     'صورت و مخرج را بر $x^2$ تقسیم کن: $\frac{3 + 5/x^2}{1 - 1/x^2} \to \frac{3}{1} = 3$', 'easy', 2);

  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_math, 'derivatives', 'مشتق', 'آهنگ تغییر و کاربردهای مشتق', 2);

  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_math, 'integrals', 'انتگرال', 'انتگرال معین و نامعین', 3);


  -- ══════════════════════════════════════════════════════════════════════════
  --  ۳) موضوع: فیزیک
  -- ══════════════════════════════════════════════════════════════════════════
  insert into public.subjects (slug, title, description, icon, color, kind, level, order_index)
  values ('physics', 'فیزیک',
          'یادداشت‌های فیزیک: مکانیک و الکتریسیته با فرمول و مسئله‌ی حل‌شده',
          'Atom', 'emerald', 'physics', 'مقدماتی', 3)
  returning id into v_physics;

  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_physics, 'mechanics', 'مکانیک', 'حرکت، نیرو و قوانین نیوتن', 1)
  returning id into v_ch;

  insert into public.lessons
    (chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, content)
  values (
    v_ch, 'newton-laws', 'قوانین نیوتن',
    'سه قانون اصلی حرکت و مثال‌هایشان',
    25, 'published', false, 1,
    $md$
## قانون اول (اینرسی)

اگر نیروی خالص روی جسم صفر باشد، جسم ساکن می‌ماند یا با سرعت ثابت حرکت می‌کند.

$$ \sum \vec{F} = 0 \;\Rightarrow\; \vec{v} = \text{ثابت} $$

## قانون دوم

نیروی خالص برابر جرم ضرب در شتاب است:

$$ \vec{F} = m\vec{a} $$

مثال: جسمی با جرم $m = 2\,\mathrm{kg}$ و شتاب $a = 3\,\mathrm{m/s^2}$

$$ F = 2 \times 3 = 6\,\mathrm{N} $$

## قانون سوم

برای هر کنش، یک واکنش مساوی و در جهت مخالف وجود دارد.

$$ \vec{F}_{12} = -\vec{F}_{21} $$

> **نکته:** در فرمول‌نویسی همیشه یکاها را هم بنویس؛ خیلی از خطاها از ناهمخوانی یکاها می‌آید.
$md$
  )
  returning id into v_l;

  insert into public.exercises (lesson_id, question, kind, options, correct_option, solution, difficulty, order_index)
  values
    (v_l, 'جسمی با جرم ۵ کیلوگرم شتاب $2\,\mathrm{m/s^2}$ دارد. نیروی خالص چند نیوتن است؟',
     'choice',
     '["۱۰ نیوتن", "۲٫۵ نیوتن", "۷ نیوتن", "۰٫۴ نیوتن"]'::jsonb, 0,
     'با قانون دوم نیوتن: $F = ma = 5 \times 2 = 10\,\mathrm{N}$', 'easy', 1);

  insert into public.chapters (subject_id, slug, title, description, order_index)
  values (v_physics, 'electricity', 'الکتریسیته و مغناطیس', 'بار، میدان و مدارها', 2);


  -- ══════════════════════════════════════════════════════════════════════════
  --  ۴) برچسب‌ها
  -- ══════════════════════════════════════════════════════════════════════════
  insert into public.tags (slug, title) values
    ('algorithm',     'الگوریتم'),
    ('math-for-devs', 'ریاضی برای برنامه‌نویس'),
    ('memory',        'حافظه و اشاره‌گر'),
    ('mechanics',     'مکانیک')
  on conflict (slug) do nothing;


  -- ══════════════════════════════════════════════════════════════════════════
  --  ۵) تنظیمات و متن‌های صفحه‌ی اصلی (کاملاً قابل ویرایش از پنل ادمین)
  -- ══════════════════════════════════════════════════════════════════════════
  insert into public.site_settings (key, value, description) values
    ('site.brand',
     '{"name": "CodeMage", "tagline": "یادداشت‌های من از مسیر یادگیری", "description": "هر چیزی که یاد می‌گیرم را اینجا می‌نویسم تا بقیه هم بتوانند استفاده کنند."}'::jsonb,
     'نام و شعار سایت (هدر و فوتر)'),

    ('home.hero',
     '{"title": "یاد بگیر، تمرین کن، یادداشت کن", "highlight": "یادداشت‌های برنامه‌نویسی و علوم", "subtitle": "هر چیزی که یاد می‌گیرم را ساده و فارسی اینجا می‌نویسم: از زبان C و جاوااسکریپت تا ریاضی و فیزیک.", "primary_cta": "شروع یادگیری", "primary_href": "/subjects", "secondary_cta": "درباره‌ی سایت", "secondary_href": "/about"}'::jsonb,
     'بخش هیروی صفحه‌ی اصلی'),

    ('home.cta',
     '{"title": "آماده‌ای شروع کنی؟", "text": "همه‌ی درس‌ها آزاد و رایگان است. می‌توانی از هر موضوعی که خواستی شروع کنی.", "button": "دیدن همه‌ی موضوع‌ها", "href": "/subjects"}'::jsonb,
     'باکس دعوت به اقدام صفحه‌ی اصلی'),

    ('footer.newsletter',
     '{"title": "خبرم کن!", "text": "ایمیلت را بگذار تا هر وقت درس جدیدی نوشتم بهت اطلاع بدم."}'::jsonb,
     'متن بخش خبرنامه در فوتر')
  on conflict (key) do update set value = excluded.value, description = excluded.description;

  raise notice '✅ داده‌ی نمونه با موفقیت اضافه شد.';
end
$seed$;


-- ── بررسی سریع ──────────────────────────────────────────────────────────────
select slug as "موضوع", title, kind as "نوع",
       chapters_count as "سرفصل‌ها", lessons_count as "درس‌ها", total_minutes as "دقیقه"
from public.v_subject_outline
order by order_index;

select * from public.v_site_stats;
