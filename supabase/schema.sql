-- ════════════════════════════════════════════════════════════════════════════
--  CodeMage — اسکیمای کامل دیتابیس روی Supabase (PostgreSQL)
-- ════════════════════════════════════════════════════════════════════════════
--
--  نحوه‌ی اجرا:
--    ۱) Supabase Dashboard → پروژه‌ی خودت → SQL Editor → New query
--    ۲) کل این فایل را داخل ادیتور Paste کن
--    ۳) Run را بزن  ← این فایل «دوباره‌اجراپذیر» است؛ اگر دو بار اجرا شود خطا نمی‌دهد
--    ۴) بعدش فایل supabase/seed.sql را اجرا کن تا با داده‌ی نمونه سایت را ببینی
--
--  ساختار:
--    subjects (موضوع: زبان C، ریاضی، فیزیک …)
--      └── chapters (سرفصل)
--            └── lessons (درس — متن فارسی + کادر کد)
--                  └── exercises (تمرین)
--
--    + profiles      : کاربران و نقش‌ها (admin / editor / reader)
--    + tags          : برچسب‌ها (مثلاً «ریاضی برای برنامه‌نویس»)
--    + site_settings : متن‌های صفحه‌ی اصلی و تنظیمات سایت (کاملاً داینامیک)
--    + lesson_progress / lesson_notes : پیشرفت و یادداشت شخصی هر کاربر
--    + newsletter_subscribers : ایمیل‌های خبرنامه
--    + Storage bucket «media» برای آپلود عکس
--
--  قواعد نوشتن محتوا (Markdown):
--    • متن درس‌ها Markdown است و فارسی نوشته می‌شود (راست‌چین رندر می‌شود)
--    • کادر کد با سه بک‌تیک + نام زبان:      ```c
--    • فرمول ریاضی/فیزیک با KaTeX:          $x^2$   یا   $$ \int_0^1 x\,dx $$
--    • کادر نکته:                            > **نکته:** ...
-- ════════════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────────────
--  ۰) پیش‌نیازها  (اختیاری — اگر نصب نشود، سایت کار می‌کند؛ فقط جستجو کندتر می‌شود)
-- ────────────────────────────────────────────────────────────────────────────

do $opt$
begin
  create extension if not exists pg_trgm with schema extensions;
exception when others then
  raise notice 'pg_trgm نصب نشد (مشکلی نیست): %', sqlerrm;
end
$opt$;


-- ────────────────────────────────────────────────────────────────────────────
--  ۱) تابع کمکی به‌روزرسانی updated_at
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ────────────────────────────────────────────────────────────────────────────
--  ۲) کاربران و نقش‌ها
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  role         text not null default 'reader' check (role in ('admin', 'editor', 'reader')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'کاربران سایت؛ فقط role = admin اجازه‌ی نوشتن در محتوا را دارد';

-- با هر ثبت‌نام جدید، یک ردیف در profiles ساخته می‌شود
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- آیا کاربر فعلی ادمین است؟  (باید بعد از ساخت جدول profiles تعریف شود)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────────
--  ۳) محتوا: موضوع → سرفصل → درس → تمرین
-- ────────────────────────────────────────────────────────────────────────────

-- ۳-۱) موضوع‌ها (زبان C، جاوااسکریپت، ریاضی، فیزیک …)
create table if not exists public.subjects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  icon         text default 'BookOpen',   -- نام آیکون از lucide.dev
  color        text default 'blue',       -- blue | cyan | gray | yellow | violet | emerald | orange …
  kind         text not null default 'programming'
               check (kind in ('programming', 'math', 'physics', 'other')),
  level        text,                      -- مقدماتی / متوسط / پیشرفته
  order_index  int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ۳-۲) سرفصل‌ها (فصل‌های یک موضوع)
create table if not exists public.chapters (
  id           uuid primary key default gen_random_uuid(),
  subject_id   uuid not null references public.subjects(id) on delete cascade,
  slug         text not null,
  title        text not null,
  description  text,
  order_index  int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (subject_id, slug)
);

-- ۳-۳) درس‌ها (متن فارسی + کادر کد)
create table if not exists public.lessons (
  id               uuid primary key default gen_random_uuid(),
  chapter_id       uuid not null references public.chapters(id) on delete cascade,
  subject_id       uuid references public.subjects(id) on delete cascade,  -- خودکار از chapter پر می‌شود
  slug             text not null,
  title            text not null,
  summary          text,                    -- یک خط توضیح برای کارت‌ها
  content          text not null default '',-- متن درس به Markdown
  duration_minutes int,                     -- زمان تقریبی مطالعه
  status           text not null default 'draft' check (status in ('draft', 'published')),
  is_featured      boolean not null default false,   -- نمایش در «درس‌های ویژه» صفحه‌ی اصلی
  order_index      int not null default 0,
  view_count       int not null default 0,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (subject_id, slug)
);

-- subject_id همیشه همان subject_id سرفصلِ درس باشد (جلوگیری از داده‌ی ناسازگار)
create or replace function public.set_lesson_subject()
returns trigger
language plpgsql
as $$
begin
  select c.subject_id into new.subject_id
  from public.chapters c where c.id = new.chapter_id;
  return new;
end;
$$;

drop trigger if exists trg_lessons_subject on public.lessons;
create trigger trg_lessons_subject
  before insert or update of chapter_id on public.lessons
  for each row execute function public.set_lesson_subject();

-- ۳-۴) تمرین‌ها
create table if not exists public.exercises (
  id                uuid primary key default gen_random_uuid(),
  lesson_id         uuid not null references public.lessons(id) on delete cascade,
  title             text,
  question          text not null,                       -- Markdown
  kind              text not null default 'text' check (kind in ('text', 'code', 'choice')),
  options           jsonb,                               -- برای kind = 'choice': ["گزینه ۱", "گزینه ۲", ...]
  correct_option    int,                                 -- شماره‌ی گزینه‌ی درست (از ۰)
  solution          text,                                -- راه‌حل/توضیح (Markdown)
  solution_code     text,                                -- کد راه‌حل
  solution_language text,                                -- c, js, python …
  difficulty        text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  is_published      boolean not null default true,
  order_index       int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────────────────────
--  ۴) برچسب‌ها، تنظیمات سایت، خبرنامه
-- ────────────────────────────────────────────────────────────────────────────

-- برچسب‌ها برای ارتباط بین موضوع‌ها (مثلاً «ریاضی برای برنامه‌نویس»، «الگوریتم»)
create table if not exists public.tags (
  id         bigint generated always as identity primary key,
  slug       text not null unique,
  title      text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_tags (
  lesson_id uuid   not null references public.lessons(id) on delete cascade,
  tag_id    bigint not null references public.tags(id)    on delete cascade,
  primary key (lesson_id, tag_id)
);

-- تنظیمات و متن‌های سایت (صفحه‌ی اصلی کاملاً داینامیک شود)
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  description text,
  updated_at  timestamptz not null default now()
);

-- ایمیل‌های خبرنامه (فرم فوتر)
create table if not exists public.newsletter_subscribers (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  created_at timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────────────────────
--  ۵) پیشرفت و یادداشت شخصی کاربر
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public.lesson_progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  status     text not null default 'in_progress' check (status in ('in_progress', 'done')),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.lesson_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  body       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);


-- ────────────────────────────────────────────────────────────────────────────
--  ۶) تریگرهای updated_at
-- ────────────────────────────────────────────────────────────────────────────

do $do$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'subjects', 'chapters', 'lessons', 'exercises',
    'site_settings', 'lesson_progress', 'lesson_notes'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
       for each row execute function public.set_updated_at()', t);
  end loop;
end
$do$;


-- ────────────────────────────────────────────────────────────────────────────
--  ۷) ایندکس‌ها
-- ────────────────────────────────────────────────────────────────────────────

create index if not exists idx_chapters_subject  on public.chapters (subject_id, order_index);
create index if not exists idx_lessons_chapter   on public.lessons  (chapter_id, order_index);
create index if not exists idx_lessons_subject   on public.lessons  (subject_id, order_index);
create index if not exists idx_lessons_status    on public.lessons  (status, published_at desc);
create index if not exists idx_lessons_featured  on public.lessons  (is_featured) where is_featured;
create index if not exists idx_exercises_lesson  on public.exercises (lesson_id, order_index);
create index if not exists idx_lesson_tags_tag   on public.lesson_tags (tag_id);

-- ایندکس جستجوی فارسی (فقط اگر pg_trgm نصب شده باشد)
do $idx$
declare
  stmt text;
begin
  if exists (select 1 from pg_extension where extname = 'pg_trgm') then
    perform set_config('search_path', 'public, extensions', true);

    foreach stmt in array array[
      'create index if not exists idx_lessons_title_trgm   on public.lessons  using gin (title gin_trgm_ops)',
      'create index if not exists idx_lessons_summary_trgm on public.lessons  using gin (summary gin_trgm_ops)',
      'create index if not exists idx_chapters_title_trgm  on public.chapters using gin (title gin_trgm_ops)',
      'create index if not exists idx_subjects_title_trgm  on public.subjects using gin (title gin_trgm_ops)'
    ]
    loop
      begin
        execute stmt;
      exception when others then
        raise notice 'ایندکس جستجو ساخته نشد (مشکلی نیست): %', sqlerrm;
      end;
    end loop;
  else
    raise notice 'pg_trgm نصب نیست؛ ایندکس‌های جستجو ساخته نشدند (سایت کار می‌کند)';
  end if;
end
$idx$;


-- ────────────────────────────────────────────────────────────────────────────
--  ۸) ویوها (کوئری‌های آماده برای اپ)
-- ────────────────────────────────────────────────────────────────────────────

-- فهرست موضوع‌ها با تعداد سرفصل/درس و مجموع زمان
create or replace view public.v_subject_outline
with (security_invoker = true) as
select
  s.id, s.slug, s.title, s.description, s.icon, s.color, s.kind, s.level,
  s.order_index, s.is_published,
  count(distinct c.id)                                                       as chapters_count,
  count(distinct l.id) filter (where l.status = 'published')                 as lessons_count,
  coalesce(sum(l.duration_minutes) filter (where l.status = 'published'), 0)  as total_minutes
from public.subjects s
left join public.chapters c on c.subject_id = s.id
left join public.lessons  l on l.chapter_id = c.id
group by s.id;

-- یک سرفصل + موضوعش + شمارش درس‌ها
create or replace view public.v_chapter_outline
with (security_invoker = true) as
select
  c.id, c.slug, c.title, c.description, c.order_index, c.is_published,
  s.id as subject_id, s.slug as subject_slug, s.title as subject_title,
  s.icon as subject_icon, s.color as subject_color,
  count(l.id) filter (where l.status = 'published')                        as lessons_count,
  coalesce(sum(l.duration_minutes) filter (where l.status = 'published'), 0) as total_minutes
from public.chapters c
join public.subjects s on s.id = c.subject_id
left join public.lessons l on l.chapter_id = c.id
group by c.id, s.id;

-- درس کامل + اطلاعات سرفصل و موضوع (برای صفحه‌ی درس)
create or replace view public.v_lessons_full
with (security_invoker = true) as
select
  l.id, l.slug, l.title, l.summary, l.content, l.duration_minutes, l.status,
  l.is_featured, l.order_index, l.view_count, l.published_at, l.updated_at,
  c.id as chapter_id, c.slug as chapter_slug, c.title as chapter_title,
  s.id as subject_id, s.slug as subject_slug, s.title as subject_title,
  s.icon as subject_icon, s.color as subject_color, s.kind as subject_kind
from public.lessons l
join public.chapters c on c.id = l.chapter_id
join public.subjects s on s.id = c.subject_id;

-- آمار کلی سایت (برای صفحه‌ی اصلی)
create or replace view public.v_site_stats
with (security_invoker = true) as
select
  (select count(*) from public.subjects  where is_published)                  as subjects_count,
  (select count(*) from public.chapters  where is_published)                  as chapters_count,
  (select count(*) from public.lessons   where status = 'published')          as lessons_count,
  (select count(*) from public.exercises where is_published)                  as exercises_count,
  (select coalesce(sum(duration_minutes), 0) from public.lessons
     where status = 'published')                                             as total_minutes,
  (select coalesce(sum(view_count), 0) from public.lessons)                   as total_views;


-- ────────────────────────────────────────────────────────────────────────────
--  ۹) توابع قابل فراخوانی از اپ (RPC)
-- ────────────────────────────────────────────────────────────────────────────

-- جستجو در کل سایت (موضوع، سرفصل، درس) — با ILIKE روی متن فارسی
-- rank: ۱ = تطبیق در تیتر ، ۲ = تطبیق در توضیح ، ۳ = تطبیق در متن درس
create or replace function public.search_content(q text, max_results int default 20)
returns table (
  kind          text,
  id            uuid,
  title         text,
  snippet       text,
  href          text,
  subject_title text,
  chapter_title text,
  rank          int
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  term text := trim(coalesce(q, ''));
  p    text;
begin
  if term = '' then
    return;
  end if;

  p := '%' || term || '%';

  return query
    select *
    from (
      select 'subject'::text as kind, s.id, s.title,
             coalesce(s.description, '') as snippet,
             '/learn/' || s.slug as href,
             s.title as subject_title, null::text as chapter_title,
             case when s.title ilike p then 1 else 2 end as rank
      from public.subjects s
      where s.is_published
        and (s.title ilike p or coalesce(s.description, '') ilike p)

      union all

      select 'chapter', c.id, c.title, coalesce(c.description, ''),
             '/learn/' || s.slug || '/' || c.slug,
             s.title, null::text,
             case when c.title ilike p then 1 else 2 end
      from public.chapters c
      join public.subjects s on s.id = c.subject_id
      where c.is_published and s.is_published
        and (c.title ilike p or coalesce(c.description, '') ilike p)

      union all

      select 'lesson', l.id, l.title, coalesce(l.summary, ''),
             '/learn/' || s.slug || '/' || c.slug || '/' || l.slug,
             s.title, c.title,
             case
               when l.title ilike p then 1
               when coalesce(l.summary, '') ilike p then 2
               else 3
             end
      from public.lessons l
      join public.chapters c on c.id = l.chapter_id
      join public.subjects s on s.id = c.subject_id
      where l.status = 'published' and c.is_published and s.is_published
        and (l.title ilike p
          or coalesce(l.summary, '') ilike p
          or l.content ilike p)
    ) r
    order by r.rank asc, r.title asc
    limit greatest(max_results, 1);
end;
$$;

grant execute on function public.search_content(text, int) to anon, authenticated;

-- درخت کامل یک موضوع (موضوع + سرفصل‌ها + درس‌ها) در یک درخواست
create or replace function public.get_subject_outline(p_slug text)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'subject', jsonb_build_object(
      'id', s.id, 'slug', s.slug, 'title', s.title, 'description', s.description,
      'icon', s.icon, 'color', s.color, 'kind', s.kind, 'level', s.level
    ),
    'chapters', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', c.id, 'slug', c.slug, 'title', c.title, 'description', c.description,
          'lessons', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', l.id, 'slug', l.slug, 'title', l.title, 'summary', l.summary,
                'duration_minutes', l.duration_minutes, 'is_featured', l.is_featured,
                'order_index', l.order_index
              ) order by l.order_index, l.created_at
            )
            from public.lessons l
            where l.chapter_id = c.id and l.status = 'published'
          ), '[]'::jsonb)
        )
        order by c.order_index, c.created_at
      )
      from public.chapters c
      where c.subject_id = s.id and c.is_published
    ), '[]'::jsonb)
  )
  from public.subjects s
  where s.slug = p_slug and s.is_published;
$$;

grant execute on function public.get_subject_outline(text) to anon, authenticated;

-- شمارنده‌ی بازدید درس (کاربر مهمان هم می‌تواند صدا بزند)
create or replace function public.increment_lesson_view(p_lesson_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.lessons
     set view_count = view_count + 1
   where id = p_lesson_id and status = 'published';
$$;

grant execute on function public.increment_lesson_view(uuid) to anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────────
--  ۱۰) امنیت (RLS — Row Level Security)
--      قانون کلی: همه محتوای منتشرشده را می‌خوانند؛ فقط ادمین می‌نویسد.
-- ────────────────────────────────────────────────────────────────────────────

alter table public.profiles               enable row level security;
alter table public.subjects               enable row level security;
alter table public.chapters               enable row level security;
alter table public.lessons                enable row level security;
alter table public.exercises              enable row level security;
alter table public.tags                   enable row level security;
alter table public.lesson_tags            enable row level security;
alter table public.site_settings          enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.lesson_progress        enable row level security;
alter table public.lesson_notes           enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
drop policy if exists "profiles: خواندن خودم" on public.profiles;
create policy "profiles: خواندن خودم" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: ویرایش خودم" on public.profiles;
create policy "profiles: ویرایش خودم" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles: مدیریت ادمین" on public.profiles;
create policy "profiles: مدیریت ادمین" on public.profiles
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── subjects ────────────────────────────────────────────────────────────────
drop policy if exists "subjects: خواندن عمومی" on public.subjects;
create policy "subjects: خواندن عمومی" on public.subjects
  for select to anon, authenticated
  using (is_published or public.is_admin());

drop policy if exists "subjects: مدیریت ادمین" on public.subjects;
create policy "subjects: مدیریت ادمین" on public.subjects
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── chapters ────────────────────────────────────────────────────────────────
drop policy if exists "chapters: خواندن عمومی" on public.chapters;
create policy "chapters: خواندن عمومی" on public.chapters
  for select to anon, authenticated
  using (is_published or public.is_admin());

drop policy if exists "chapters: مدیریت ادمین" on public.chapters;
create policy "chapters: مدیریت ادمین" on public.chapters
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── lessons ─────────────────────────────────────────────────────────────────
drop policy if exists "lessons: خواندن عمومی" on public.lessons;
create policy "lessons: خواندن عمومی" on public.lessons
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists "lessons: مدیریت ادمین" on public.lessons;
create policy "lessons: مدیریت ادمین" on public.lessons
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── exercises ───────────────────────────────────────────────────────────────
drop policy if exists "exercises: خواندن عمومی" on public.exercises;
create policy "exercises: خواندن عمومی" on public.exercises
  for select to anon, authenticated
  using (is_published or public.is_admin());

drop policy if exists "exercises: مدیریت ادمین" on public.exercises;
create policy "exercises: مدیریت ادمین" on public.exercises
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── tags / lesson_tags ──────────────────────────────────────────────────────
drop policy if exists "tags: خواندن عمومی" on public.tags;
create policy "tags: خواندن عمومی" on public.tags
  for select to anon, authenticated using (true);

drop policy if exists "tags: مدیریت ادمین" on public.tags;
create policy "tags: مدیریت ادمین" on public.tags
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lesson_tags: خواندن عمومی" on public.lesson_tags;
create policy "lesson_tags: خواندن عمومی" on public.lesson_tags
  for select to anon, authenticated using (true);

drop policy if exists "lesson_tags: مدیریت ادمین" on public.lesson_tags;
create policy "lesson_tags: مدیریت ادمین" on public.lesson_tags
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── site_settings ───────────────────────────────────────────────────────────
drop policy if exists "settings: خواندن عمومی" on public.site_settings;
create policy "settings: خواندن عمومی" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "settings: مدیریت ادمین" on public.site_settings;
create policy "settings: مدیریت ادمین" on public.site_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── newsletter_subscribers ──────────────────────────────────────────────────
drop policy if exists "newsletter: ثبت‌نام عمومی" on public.newsletter_subscribers;
create policy "newsletter: ثبت‌نام عمومی" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

drop policy if exists "newsletter: مشاهده ادمین" on public.newsletter_subscribers;
create policy "newsletter: مشاهده ادمین" on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());

-- ── lesson_progress (فقط صاحب حساب) ─────────────────────────────────────────
drop policy if exists "progress: مالک" on public.lesson_progress;
create policy "progress: مالک" on public.lesson_progress
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── lesson_notes (فقط صاحب حساب) ────────────────────────────────────────────
drop policy if exists "notes: مالک" on public.lesson_notes;
create policy "notes: مالک" on public.lesson_notes
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ────────────────────────────────────────────────────────────────────────────
--  ۱۱) دسترسی‌ها (Grants)
-- ────────────────────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated;

grant select on
  public.subjects, public.chapters, public.lessons, public.exercises,
  public.tags, public.lesson_tags, public.site_settings,
  public.v_subject_outline, public.v_chapter_outline,
  public.v_lessons_full, public.v_site_stats
to anon, authenticated;

grant insert on public.newsletter_subscribers to anon, authenticated;

grant select, insert, update, delete on
  public.profiles, public.subjects, public.chapters, public.lessons, public.exercises,
  public.tags, public.lesson_tags, public.site_settings,
  public.lesson_progress, public.lesson_notes, public.newsletter_subscribers
to authenticated;


-- ────────────────────────────────────────────────────────────────────────────
--  ۱۲) فضای ذخیره‌سازی عکس (Storage)
-- ────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
on conflict (id) do nothing;

drop policy if exists "media: خواندن عمومی" on storage.objects;
create policy "media: خواندن عمومی" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media: آپلود ادمین" on storage.objects;
create policy "media: آپلود ادمین" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: ویرایش ادمین" on storage.objects;
create policy "media: ویرایش ادمین" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: حذف ادمین" on storage.objects;
create policy "media: حذف ادمین" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());


-- ════════════════════════════════════════════════════════════════════════════
--  ✅ تمام! حالا برای اینکه بتوانی وارد پنل ادمین شوی:
--
--  ۱) Supabase → Authentication → Users → Add user →  ایمیل و رمز خودت
--     (گزینه‌ی «Auto Confirm User» را روشن کن)
--  ۲) بعد این دستور را با ایمیل خودت اجرا کن:
--
--       update public.profiles
--          set role = 'admin'
--        where email = 'ایمیل‌خودت@gmail.com';
--
--  ۳) برای اطمینان این کوئری را بزن؛ باید true برگرداند:
--
--       select public.is_admin();
--
--  نکته: فایل supabase/seed.sql را هم یک‌بار اجرا کن تا با داده‌ی نمونه
--        (زبان C + ریاضی + فیزیک) سایت را ببینی.
-- ════════════════════════════════════════════════════════════════════════════
