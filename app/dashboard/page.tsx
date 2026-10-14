'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Session } from '@supabase/supabase-js';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CircleHelp,
  Code2,
  Eye,
  FileText,
  Globe2,
  LayoutDashboard,
  Layers3,
  LoaderCircle,
  LogOut,
  LockKeyhole,
  Mail,
  MonitorCog,
  Plus,
  Save,
  Search,
  Settings2,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings, type SiteSettings } from '@/lib/site-settings';
import { slugify } from '@/lib/slug';

type DashboardSection = 'overview' | 'lessons' | 'site';
type AccessState = 'checking' | 'signed-out' | 'checking-role' | 'admin' | 'denied';
type LessonStatus = 'draft' | 'published';

type SubjectRow = {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  order_index: number;
};

type ChapterRow = {
  id: string;
  subject_id: string;
  slug: string;
  title: string;
  order_index: number;
  is_published: boolean;
};

type LessonRow = {
  id: string;
  subject_id: string;
  chapter_id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  duration_minutes: number | null;
  status: LessonStatus;
  is_featured: boolean;
  order_index: number;
  view_count: number;
  published_at: string | null;
  updated_at: string | null;
};

type LessonForm = {
  subject_id: string;
  chapter_id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  duration_minutes: string;
  status: LessonStatus;
  is_featured: boolean;
};

type Notice = { kind: 'success' | 'error'; text: string } | null;

const emptyLesson: LessonForm = {
  subject_id: '',
  chapter_id: '',
  title: '',
  slug: '',
  summary: '',
  content: '',
  duration_minutes: '20',
  status: 'draft',
  is_featured: false,
};

function faNumber(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function localErrorMessage(error: { message?: string; code?: string } | null) {
  if (!error) return '';
  if (error.code === '23505') return 'این نشانی برای این موضوع قبلاً استفاده شده؛ یک نامک دیگر انتخاب کن.';
  if (error.code === '42501' || /row-level security|permission denied/i.test(error.message || '')) {
    return 'اجازه‌ی لازم برای این تغییر را نداری. مطمئن شو نقش حساب در Supabase روی admin تنظیم شده است.';
  }
  return error.message || 'عملیات با خطا روبه‌رو شد. دوباره تلاش کن.';
}

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!hasSupabaseConfig);
  const [access, setAccess] = useState<AccessState>(hasSupabaseConfig ? 'checking' : 'signed-out');
  const [section, setSection] = useState<DashboardSection>('overview');
  const [profileName, setProfileName] = useState('');
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [siteDraft, setSiteDraft] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<Notice>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLesson);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LessonStatus>('all');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showCreateChapter, setShowCreateChapter] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);

  const loadAdminData = useCallback(async (userId: string) => {
    setAccess('checking-role');
    setLoadError('');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, display_name, email')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      setLoadError(`پروفایل مدیر خوانده نشد: ${localErrorMessage(profileError)}`);
      setAccess('denied');
      return;
    }

    if (!profile || profile.role !== 'admin') {
      setProfileName(profile?.display_name || profile?.email || 'کاربر');
      setAccess('denied');
      return;
    }

    setProfileName(profile.display_name || profile.email || 'مدیر');

    const [subjectsResult, chaptersResult, lessonsResult, settingsResult] = await Promise.all([
      supabase.from('subjects').select('id, slug, title, is_published, order_index').order('order_index', { ascending: true }),
      supabase.from('chapters').select('id, subject_id, slug, title, order_index, is_published').order('order_index', { ascending: true }),
      supabase.from('lessons').select('id, subject_id, chapter_id, slug, title, summary, content, duration_minutes, status, is_featured, order_index, view_count, published_at, updated_at').order('updated_at', { ascending: false }),
      supabase.from('site_settings').select('key, value').in('key', ['site.brand', 'home.hero', 'home.cta', 'footer.newsletter']),
    ]);

    if (subjectsResult.error || chaptersResult.error || lessonsResult.error) {
      const error = subjectsResult.error || chaptersResult.error || lessonsResult.error;
      setLoadError(`داده‌های پنل خوانده نشد: ${localErrorMessage(error)}`);
    }

    setSubjects((subjectsResult.data || []) as SubjectRow[]);
    setChapters((chaptersResult.data || []) as ChapterRow[]);
    setLessons((lessonsResult.data || []) as LessonRow[]);
    setSiteDraft(mergeSiteSettings((settingsResult.data || []) as Array<{ key: string; value: unknown }>));
    if (settingsResult.error) {
      setLoadError(`تنظیمات سایت خوانده نشد: ${localErrorMessage(settingsResult.error)}`);
    }
    setAccess('admin');
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    let active = true;
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!active) return;
      setSession(currentSession);
      setAuthReady(true);
      setAccess(currentSession ? 'checking-role' : 'signed-out');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setAuthReady(true);
      setAccess(nextSession ? 'checking-role' : 'signed-out');
      if (!nextSession) {
        setSubjects([]);
        setChapters([]);
        setLessons([]);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user.id || !hasSupabaseConfig) return;
    const timer = window.setTimeout(() => {
      void loadAdminData(session.user.id);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [session?.user.id, loadAdminData]);

  const filteredLessons = useMemo(() => {
    const needle = searchQuery.trim().toLocaleLowerCase('fa-IR');
    return lessons.filter((lesson) => {
      const subject = subjects.find((item) => item.id === lesson.subject_id)?.title || '';
      const matchesText = !needle || `${lesson.title} ${lesson.slug} ${lesson.summary || ''} ${subject}`.toLocaleLowerCase('fa-IR').includes(needle);
      const matchesStatus = statusFilter === 'all' || lesson.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [lessons, searchQuery, statusFilter, subjects]);

  const selectedChapters = useMemo(
    () => chapters.filter((chapter) => chapter.subject_id === lessonForm.subject_id),
    [chapters, lessonForm.subject_id],
  );
  const selectedSubject = subjects.find((subject) => subject.id === lessonForm.subject_id);
  const draftCount = lessons.filter((lesson) => lesson.status === 'draft').length;
  const publishedCount = lessons.filter((lesson) => lesson.status === 'published').length;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsLoggingIn(false);
    if (error) setLoginError(error.message || 'ورود انجام نشد. ایمیل و گذرواژه را بررسی کن.');
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setNotice(null);
  }

  function startNewLesson() {
    const subject = subjects.find((item) => item.is_published) || subjects[0];
    const chapter = chapters.find((item) => item.subject_id === subject?.id && item.is_published) || chapters.find((item) => item.subject_id === subject?.id);
    setShowCreateChapter(false);
    setNewChapterTitle('');
    setEditingId(null);
    setLessonForm({ ...emptyLesson, subject_id: subject?.id || '', chapter_id: chapter?.id || '' });
    setNotice(null);
    setSection('lessons');
  }

  function startEditing(lesson: LessonRow) {
    setShowCreateChapter(false);
    setNewChapterTitle('');
    setEditingId(lesson.id);
    setLessonForm({
      subject_id: lesson.subject_id,
      chapter_id: lesson.chapter_id,
      title: lesson.title,
      slug: lesson.slug,
      summary: lesson.summary || '',
      content: lesson.content || '',
      duration_minutes: String(lesson.duration_minutes || 20),
      status: lesson.status,
      is_featured: lesson.is_featured,
    });
    setNotice(null);
    setSection('lessons');
  }

  function updateLessonTitle(value: string) {
    setLessonForm((current) => {
      const previousAutoSlug = slugify(current.title);
      const shouldUpdateSlug = !current.slug || current.slug === previousAutoSlug;
      return { ...current, title: value, slug: shouldUpdateSlug ? slugify(value) : current.slug };
    });
  }

  function handleSubjectChange(subjectId: string) {
    const firstChapter = chapters.find((chapter) => chapter.subject_id === subjectId && chapter.is_published)
      || chapters.find((chapter) => chapter.subject_id === subjectId);
    setShowCreateChapter(false);
    setNewChapterTitle('');
    setLessonForm((current) => ({ ...current, subject_id: subjectId, chapter_id: firstChapter?.id || '' }));
  }

  async function createChapter() {
    const title = newChapterTitle.trim();
    if (!title || !lessonForm.subject_id) return;
    setIsCreatingChapter(true);
    setNotice(null);
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        subject_id: lessonForm.subject_id,
        title,
        slug: slugify(title),
        description: '',
        order_index: selectedChapters.length + 1,
        is_published: true,
      })
      .select('id, subject_id, slug, title, order_index, is_published')
      .single();
    setIsCreatingChapter(false);

    if (error || !data) {
      setNotice({ kind: 'error', text: localErrorMessage(error) || 'ساخت فصل انجام نشد.' });
      return;
    }

    const chapter = data as ChapterRow;
    setChapters((current) => [...current, chapter]);
    setLessonForm((current) => ({ ...current, chapter_id: chapter.id }));
    setShowCreateChapter(false);
    setNewChapterTitle('');
    setNotice({ kind: 'success', text: 'فصل تازه ساخته شد و برای این درس انتخاب شد.' });
  }

  async function handleSaveLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (!lessonForm.subject_id || !lessonForm.chapter_id) {
      setNotice({ kind: 'error', text: 'برای درس، موضوع و فصل را انتخاب کن یا یک فصل تازه بساز.' });
      return;
    }
    if (!lessonForm.title.trim()) {
      setNotice({ kind: 'error', text: 'عنوان درس را وارد کن.' });
      return;
    }

    const slug = slugify(lessonForm.slug || lessonForm.title);
    const previous = lessons.find((lesson) => lesson.id === editingId);
    const payload = {
      chapter_id: lessonForm.chapter_id,
      slug,
      title: lessonForm.title.trim(),
      summary: lessonForm.summary.trim() || null,
      content: lessonForm.content,
      duration_minutes: Math.max(1, Number(lessonForm.duration_minutes) || 20),
      status: lessonForm.status,
      is_featured: lessonForm.is_featured,
      order_index: previous?.order_index || lessons.filter((lesson) => lesson.subject_id === lessonForm.subject_id).length + 1,
      published_at: lessonForm.status === 'published' ? previous?.published_at || new Date().toISOString() : null,
    };

    setIsSaving(true);
    const result = editingId
      ? await supabase.from('lessons').update(payload).eq('id', editingId)
      : await supabase.from('lessons').insert(payload);
    setIsSaving(false);

    if (result.error) {
      setNotice({ kind: 'error', text: localErrorMessage(result.error) });
      return;
    }

    setNotice({ kind: 'success', text: editingId ? 'تغییرات درس با موفقیت ذخیره شد.' : 'درس تازه با موفقیت ساخته شد.' });
    setEditingId(null);
    setLessonForm(emptyLesson);
    if (session?.user.id) await loadAdminData(session.user.id);
  }

  async function handleSaveSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setIsSaving(true);
    const rows = [
      { key: 'site.brand', value: siteDraft.brand, description: 'نام و شعار سایت در هدر و فوتر' },
      { key: 'home.hero', value: siteDraft.hero, description: 'متن‌ها و دکمه‌های بخش اصلی صفحه‌ی خانه' },
      { key: 'home.cta', value: siteDraft.cta, description: 'باکس دعوت به یادگیری در صفحه‌ی خانه' },
      { key: 'footer.newsletter', value: siteDraft.newsletter, description: 'متن بخش خبرنامه در فوتر' },
    ];
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    setIsSaving(false);

    if (error) {
      setNotice({ kind: 'error', text: localErrorMessage(error) });
      return;
    }
    setNotice({ kind: 'success', text: 'متن‌های سایت ذخیره شدند و در صفحه‌ی اصلی نمایش داده می‌شوند.' });
  }

  function setBrandField(field: keyof SiteSettings['brand'], value: string) {
    setSiteDraft((current) => ({ ...current, brand: { ...current.brand, [field]: value } }));
  }
  function setHeroField(field: keyof SiteSettings['hero'], value: string) {
    setSiteDraft((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  }
  function setCtaField(field: keyof SiteSettings['cta'], value: string) {
    setSiteDraft((current) => ({ ...current, cta: { ...current.cta, [field]: value } }));
  }
  function setNewsletterField(field: keyof SiteSettings['newsletter'], value: string) {
    setSiteDraft((current) => ({ ...current, newsletter: { ...current.newsletter, [field]: value } }));
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="page-container py-12 sm:py-20" dir="rtl">
        <div className="soft-card mx-auto max-w-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-l from-primary to-emerald-300" />
          <div className="p-6 sm:p-10">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MonitorCog size={27} /></span>
            <h1 className="mt-5 text-3xl font-black tracking-tight">اتصال پنل مدیریت</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">برای ورود به داشبورد، پروژه‌ی Supabase را متصل کن. تا آن زمان سایت با محتوای نمایشی قابل مشاهده است.</p>
            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-7">
              <p className="font-black">۱. این مقادیر را در فایل <code dir="ltr" className="rounded bg-card px-1.5 py-0.5 text-primary">.env.local</code> قرار بده:</p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-[#121d32] p-4 text-left text-xs leading-6 text-slate-100" dir="ltr">NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{'\n'}NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</pre>
              <p className="mt-4">۲. فایل‌های <code dir="ltr" className="rounded bg-card px-1.5 py-0.5 text-primary">supabase/schema.sql</code> و سپس <code dir="ltr" className="rounded bg-card px-1.5 py-0.5 text-primary">supabase/seed.sql</code> را اجرا کن.</p>
              <p className="mt-2">۳. در Supabase یک کاربر بساز و نقش او را به <code dir="ltr" className="rounded bg-card px-1.5 py-0.5 text-primary">admin</code> تغییر بده.</p>
            </div>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">بازگشت به سایت <ArrowLeft size={15} /></Link>
          </div>
        </div>
      </div>
    );
  }

  if (!authReady || access === 'checking' || access === 'checking-role') {
    return <div className="page-container flex min-h-[55vh] items-center justify-center py-16" dir="rtl"><div className="flex items-center gap-3 text-sm font-bold text-muted-foreground"><LoaderCircle size={20} className="animate-spin text-primary" /> در حال آماده‌سازی پنل...</div></div>;
  }

  if (!session || access === 'signed-out') {
    return (
      <div className="page-container py-10 sm:py-16" dir="rtl">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_28px_80px_-48px_rgba(31,41,75,0.35)] md:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden bg-[#121d32] p-7 text-white sm:p-10">
            <div className="absolute -left-12 -top-16 size-56 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="relative z-10">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#b7f486]"><LockKeyhole size={21} /></span>
              <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold text-white/70"><Sparkles size={13} className="text-[#b7f486]" /> پنل اختصاصی نویسنده</span>
              <h1 className="mt-4 text-3xl font-black leading-tight">محتوایت را<br />با خیال راحت مدیریت کن</h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">درس‌های تازه بساز، متن‌ها را ویرایش کن و صفحه‌ی اصلی را مطابق سلیقه‌ات تغییر بده. دسترسی نوشتن با سیاست‌های امنیتی دیتابیس محافظت شده است.</p>
              <div className="mt-8 space-y-3 text-xs font-semibold text-white/65">
                <p className="flex items-center gap-2"><Check size={14} className="text-[#b7f486]" /> ساخت و انتشار درس در چند مرحله</p>
                <p className="flex items-center gap-2"><Check size={14} className="text-[#b7f486]" /> ویرایش متن و ظاهر صفحه‌ی خانه</p>
                <p className="flex items-center gap-2"><Check size={14} className="text-[#b7f486]" /> ذخیره‌ی امن در Supabase</p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <span className="section-kicker"><UserRound size={14} /> ورود مدیر</span>
            <h2 className="mt-4 text-2xl font-black">خوش برگشتی</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">با حساب مدیریتی Supabase وارد شو.</p>
            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <div><label htmlFor="admin-email" className="field-label">ایمیل</label><div className="relative"><Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" /><input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="dashboard-input pe-11" placeholder="name@example.com" dir="ltr" /></div></div>
              <div><label htmlFor="admin-password" className="field-label">گذرواژه</label><input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="dashboard-input" placeholder="••••••••••" dir="ltr" /></div>
              {loginError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200" role="alert">{loginError}</p>}
              <button type="submit" disabled={isLoggingIn} className="button-primary w-full disabled:cursor-wait disabled:opacity-60">{isLoggingIn ? <LoaderCircle size={16} className="animate-spin" /> : <LockKeyhole size={16} />} ورود به داشبورد</button>
            </form>
            <div className="mt-6 rounded-2xl bg-muted/60 p-4">
              <p className="flex items-center gap-2 text-xs font-black"><CircleHelp size={15} className="text-primary" /> هنوز مدیر نساخته‌ای؟</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">راهنمای ساخت حساب و فعال‌سازی نقش مدیر در فایل README و انتهای <code dir="ltr" className="rounded bg-card px-1 py-0.5">supabase/schema.sql</code> آمده است.</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div className="page-container py-12 sm:py-20" dir="rtl">
        <div className="soft-card mx-auto max-w-2xl p-6 sm:p-9">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><LockKeyhole size={22} /></span>
          <h1 className="mt-5 text-2xl font-black">این حساب دسترسی مدیریت ندارد</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">حساب وارد شده پیدا شد، اما نقش آن در جدول <code dir="ltr">profiles</code> باید <code dir="ltr">admin</code> باشد.</p>
          {loadError && <p className="mt-3 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-200">{loadError}</p>}
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#121d32] p-4 text-left text-xs leading-6 text-slate-100" dir="ltr">{`update public.profiles\nset role = 'admin'\nwhere email = '${session.user.email || 'your@email.com'}';`}</pre>
          <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => void handleSignOut()} className="button-primary"><LogOut size={15} /> خروج از حساب</button><Link href="/" className="button-secondary">بازگشت به سایت <ArrowLeft size={15} /></Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-20 pt-8 sm:pt-12" dir="rtl">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="section-kicker"><MonitorCog size={14} /> فضای مدیریت CodeMage</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">سلام {profileName}، آماده‌ای؟</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">از اینجا محتوای آموزشی و ظاهر صفحه‌ی اصلی را مدیریت کن.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="button-secondary min-h-10 px-4 py-2 text-xs"><Globe2 size={15} /> مشاهده‌ی سایت</Link>
          <button type="button" onClick={() => void handleSignOut()} className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground transition hover:border-rose-300 hover:text-rose-600"><LogOut size={15} /> خروج</button>
        </div>
      </header>

      {loadError && <div className="mb-5 rounded-2xl border border-amber-300/60 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">{loadError}</div>}
      {notice && <div role="status" className={`mb-5 flex items-center gap-2 rounded-2xl border p-3.5 text-sm font-bold ${notice.kind === 'success' ? 'border-emerald-300/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' : 'border-rose-300/60 bg-rose-500/10 text-rose-800 dark:text-rose-200'}`}>{notice.kind === 'success' ? <Check size={16} /> : <CircleHelp size={16} />}{notice.text}</div>}

      <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="soft-card p-3 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/55 p-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-400 text-white"><Code2 size={19} /></span>
            <span><span className="block text-xs font-black">CodeMage Studio</span><span className="mt-1 block text-[10px] text-muted-foreground">پنل تولید محتوا</span></span>
          </div>
          <nav className="mt-3 grid grid-cols-3 gap-1 lg:grid-cols-1" aria-label="بخش‌های داشبورد">
            {[
              { id: 'overview' as const, label: 'نمای کلی', icon: LayoutDashboard },
              { id: 'lessons' as const, label: 'مدیریت درس‌ها', icon: BookOpen },
              { id: 'site' as const, label: 'ظاهر و متن سایت', icon: Settings2 },
            ].map((item) => {
              const Icon = item.icon;
              return <button key={item.id} type="button" onClick={() => { setSection(item.id); setNotice(null); }} aria-current={section === item.id ? 'page' : undefined} className="dashboard-nav-item justify-center lg:justify-start"><Icon size={17} /><span className="hidden sm:inline">{item.label}</span></button>;
            })}
          </nav>
          <div className="mt-3 hidden rounded-2xl border border-border/70 bg-background/70 p-3 lg:block">
            <p className="flex items-center gap-2 text-[11px] font-black"><LockKeyhole size={13} className="text-emerald-500" /> دسترسی امن</p>
            <p className="mt-1.5 text-[10px] leading-5 text-muted-foreground">ذخیره‌سازی از طریق Supabase و سیاست‌های RLS انجام می‌شود.</p>
          </div>
        </aside>

        <div className="min-w-0">
          {section === 'overview' && (
            <section>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'همه‌ی درس‌ها', value: lessons.length, icon: BookOpen, color: 'bg-primary/10 text-primary' },
                  { label: 'منتشرشده', value: publishedCount, icon: Eye, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
                  { label: 'پیش‌نویس', value: draftCount, icon: FileText, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
                  { label: 'موضوع‌ها', value: subjects.length, icon: Layers3, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' },
                ].map((item) => {
                  const Icon = item.icon;
                  return <div key={item.label} className="soft-card p-4"><span className={`flex size-10 items-center justify-center rounded-xl ${item.color}`}><Icon size={18} /></span><span className="mt-4 block text-2xl font-black">{faNumber(item.value)}</span><span className="mt-1 block text-xs font-bold text-muted-foreground">{item.label}</span></div>;
                })}
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="soft-card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border/70 p-5">
                    <div><h2 className="text-base font-black">آخرین تغییرات</h2><p className="mt-1 text-xs text-muted-foreground">درس‌هایی که اخیراً ویرایش شده‌اند</p></div>
                    <button type="button" onClick={startNewLesson} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground"><Plus size={14} /> درس تازه</button>
                  </div>
                  <div className="divide-y divide-border/65">
                    {lessons.slice(0, 5).map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-3 px-5 py-4">
                        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${lesson.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}><BookOpen size={16} /></span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{lesson.title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{subjects.find((subject) => subject.id === lesson.subject_id)?.title || 'موضوع'} · {lesson.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</span></span>
                        <button type="button" onClick={() => startEditing(lesson)} className="rounded-xl px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/5">ویرایش</button>
                      </div>
                    ))}
                    {lessons.length === 0 && <div className="p-7 text-center text-sm text-muted-foreground">هنوز درسی ساخته نشده است.</div>}
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#18243b] to-[#2b2850] p-6 text-white">
                  <div className="absolute -left-8 -top-9 size-36 rounded-full bg-violet-400/20 blur-2xl" />
                  <div className="relative z-10"><span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-[#b7f486]"><Sparkles size={20} /></span><h2 className="mt-5 text-xl font-black">سایت را به‌روز نگه دار</h2><p className="mt-2 text-sm leading-7 text-white/60">عنوان‌ها، شعار و متن‌های صفحه‌ی اصلی را بدون دست‌زدن به کد تغییر بده.</p><button type="button" onClick={() => { setSection('site'); setNotice(null); }} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#b7f486] px-4 py-2.5 text-xs font-black text-[#17233a]">ویرایش محتوای سایت <ArrowLeft size={14} /></button></div>
                </div>
              </div>
            </section>
          )}

          {section === 'lessons' && (
            <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(350px,0.92fr)]">
              <div className="soft-card overflow-hidden">
                <div className="border-b border-border/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h2 className="text-lg font-black">درس‌ها</h2><p className="mt-1 text-xs text-muted-foreground">ایجاد، ویرایش و انتشار محتوای آموزشی</p></div>
                    <button type="button" onClick={startNewLesson} className="button-primary min-h-10 rounded-xl px-3 py-2 text-xs"><Plus size={15} /> درس جدید</button>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_130px]">
                    <div className="relative"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="جست‌وجو در عنوان و توضیح..." className="dashboard-input py-2.5 pe-9 text-xs" /></div>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | LessonStatus)} className="dashboard-input py-2.5 text-xs"><option value="all">همه‌ی وضعیت‌ها</option><option value="published">منتشرشده</option><option value="draft">پیش‌نویس</option></select>
                  </div>
                </div>
                <div className="max-h-[780px] divide-y divide-border/65 overflow-y-auto">
                  {filteredLessons.map((lesson) => (
                    <article key={lesson.id} className="p-4 transition hover:bg-muted/25 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${lesson.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'}`}><BookOpen size={17} /></span>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 text-sm font-black">{lesson.title}</h3>
                          <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">{lesson.summary || 'بدون توضیح کوتاه'}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-muted-foreground">
                            <span>{subjects.find((subject) => subject.id === lesson.subject_id)?.title || 'موضوع حذف‌شده'}</span><span>{lesson.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</span><span>{faNumber(lesson.duration_minutes || 20)} دقیقه</span>{lesson.is_featured && <span className="text-primary">ویژه</span>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        {lesson.status === 'published' && <Link href={`/tutorials/${subjects.find((subject) => subject.id === lesson.subject_id)?.slug || 'c'}/${lesson.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"><Eye size={12} /> پیش‌نمایش</Link>}
                        <button type="button" onClick={() => startEditing(lesson)} className="rounded-lg bg-primary/8 px-3 py-1.5 text-[10px] font-black text-primary transition hover:bg-primary/15">ویرایش درس</button>
                      </div>
                    </article>
                  ))}
                  {filteredLessons.length === 0 && <div className="p-10 text-center"><Search size={24} className="mx-auto text-muted-foreground/50" /><p className="mt-3 text-sm font-bold">درسی با این مشخصات پیدا نشد.</p></div>}
                </div>
              </div>

              <div className="soft-card overflow-hidden xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
                <div className="border-b border-border/70 bg-muted/25 p-5">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">LESSON EDITOR</span>
                  <h2 className="mt-1 text-lg font-black">{editingId ? 'ویرایش درس' : 'ساخت درس تازه'}</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">متن درس را با Markdown بنویس؛ مثال کد را بین سه بک‌تیک قرار بده.</p>
                </div>
                <form onSubmit={handleSaveLesson} className="space-y-4 p-5">
                  <div><label htmlFor="lesson-subject" className="field-label">موضوع</label><select id="lesson-subject" required value={lessonForm.subject_id} onChange={(event) => handleSubjectChange(event.target.value)} className="dashboard-input"><option value="">انتخاب موضوع...</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}{!subject.is_published ? ' (پیش‌نویس)' : ''}</option>)}</select></div>
                  <div><label htmlFor="lesson-chapter" className="field-label">فصل</label><select id="lesson-chapter" required value={lessonForm.chapter_id} onChange={(event) => { if (event.target.value === '__new__') setShowCreateChapter(true); else { setShowCreateChapter(false); setLessonForm((current) => ({ ...current, chapter_id: event.target.value })); } }} className="dashboard-input"><option value="">انتخاب فصل...</option>{selectedChapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}<option value="__new__">＋ ساخت فصل تازه...</option></select>
                    {(showCreateChapter || lessonForm.chapter_id === '') && lessonForm.subject_id && <div className="mt-2 flex gap-2"><input value={newChapterTitle} onChange={(event) => setNewChapterTitle(event.target.value)} className="dashboard-input py-2 text-xs" placeholder={`نام فصل جدید برای ${selectedSubject?.title || 'این موضوع'}`} /><button type="button" onClick={() => void createChapter()} disabled={isCreatingChapter || !newChapterTitle.trim()} className="shrink-0 rounded-xl bg-primary/10 px-3 text-xs font-black text-primary disabled:opacity-50">{isCreatingChapter ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}</button></div>}
                  </div>
                  <div><label htmlFor="lesson-title" className="field-label">عنوان درس</label><input id="lesson-title" required value={lessonForm.title} onChange={(event) => updateLessonTitle(event.target.value)} className="dashboard-input" placeholder="مثلاً: آشنایی با متغیرها" /></div>
                  <div><label htmlFor="lesson-slug" className="field-label">نشانی کوتاه (Slug)</label><input id="lesson-slug" required value={lessonForm.slug} onChange={(event) => setLessonForm((current) => ({ ...current, slug: slugify(event.target.value) }))} className="dashboard-input text-left font-mono text-xs" placeholder="variables-intro" dir="ltr" /><p className="mt-1 text-[10px] text-muted-foreground">نشانی درس: /tutorials/{selectedSubject?.slug || 'topic'}/{slugify(lessonForm.slug || lessonForm.title)}</p></div>
                  <div><label htmlFor="lesson-summary" className="field-label">توضیح کوتاه</label><textarea id="lesson-summary" rows={2} value={lessonForm.summary} onChange={(event) => setLessonForm((current) => ({ ...current, summary: event.target.value }))} className="dashboard-input resize-y" placeholder="این درس چه چیزی را آموزش می‌دهد؟" /></div>
                  <div><label htmlFor="lesson-content" className="field-label">محتوای درس <span className="font-normal text-muted-foreground">(Markdown)</span></label><textarea id="lesson-content" rows={12} value={lessonForm.content} onChange={(event) => setLessonForm((current) => ({ ...current, content: event.target.value }))} className="dashboard-input min-h-64 resize-y font-mono text-xs leading-7" placeholder={'## عنوان بخش\n\nتوضیح درس را اینجا بنویس...\n\n```js\nconsole.log("سلام دنیا");\n```'} dir="rtl" /><p className="mt-1 text-[10px] leading-5 text-muted-foreground">تیتر با ##، متن پررنگ با **متن** و کد را بین سه بک‌تیک بنویس.</p></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label htmlFor="lesson-duration" className="field-label">زمان مطالعه (دقیقه)</label><input id="lesson-duration" type="number" min="1" max="999" value={lessonForm.duration_minutes} onChange={(event) => setLessonForm((current) => ({ ...current, duration_minutes: event.target.value }))} className="dashboard-input" dir="ltr" /></div>
                    <div><label htmlFor="lesson-status" className="field-label">وضعیت انتشار</label><select id="lesson-status" value={lessonForm.status} onChange={(event) => setLessonForm((current) => ({ ...current, status: event.target.value as LessonStatus }))} className="dashboard-input"><option value="draft">پیش‌نویس</option><option value="published">منتشرشده</option></select></div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background p-3.5"><input type="checkbox" checked={lessonForm.is_featured} onChange={(event) => setLessonForm((current) => ({ ...current, is_featured: event.target.checked }))} className="size-4 accent-violet-600" /><span><span className="block text-xs font-black">نمایش به‌عنوان درس ویژه</span><span className="mt-1 block text-[10px] text-muted-foreground">در صفحه‌ی اصلی بالاتر نمایش داده می‌شود.</span></span></label>
                  <div className="flex gap-2 pt-1"><button type="submit" disabled={isSaving} className="button-primary flex-1 disabled:opacity-60">{isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}{editingId ? 'ذخیره‌ی تغییرات' : 'ساخت و ذخیره‌ی درس'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setLessonForm(emptyLesson); setNotice(null); }} className="button-secondary px-4">انصراف</button>}</div>
                </form>
              </div>
            </section>
          )}

          {section === 'site' && (
            <section className="soft-card overflow-hidden">
              <div className="flex flex-col justify-between gap-3 border-b border-border/70 bg-gradient-to-l from-primary/[0.07] to-transparent p-5 sm:flex-row sm:items-center sm:p-7">
                <div><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary"><Globe2 size={13} /> SITE CONTENT</span><h2 className="mt-2 text-xl font-black">ظاهر و متن سایت</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">متن‌های زیر در صفحه‌ی اصلی، هدر و فوتر نمایش داده می‌شوند.</p></div>
                <Link href="/" target="_blank" className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition hover:text-primary sm:self-auto"><Eye size={14} /> پیش‌نمایش سایت</Link>
              </div>
              <form onSubmit={handleSaveSite} className="space-y-7 p-5 sm:p-7">
                <section className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><span className="text-sm font-black">هویت سایت</span><p className="mt-1 text-xs text-muted-foreground">نام و جمله‌ی معرفی در هدر و فوتر.</p></div>
                  <div><label htmlFor="brand-name" className="field-label">نام سایت</label><input id="brand-name" value={siteDraft.brand.name} onChange={(event) => setBrandField('name', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="brand-tagline" className="field-label">شعار کوتاه</label><input id="brand-tagline" value={siteDraft.brand.tagline} onChange={(event) => setBrandField('tagline', event.target.value)} className="dashboard-input" /></div>
                  <div className="sm:col-span-2"><label htmlFor="brand-description" className="field-label">توضیح فوتر</label><textarea id="brand-description" rows={2} value={siteDraft.brand.description} onChange={(event) => setBrandField('description', event.target.value)} className="dashboard-input resize-y" /></div>
                </section>

                <section className="grid gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
                  <div className="sm:col-span-2"><span className="text-sm font-black">بخش اصلی صفحه‌ی خانه</span><p className="mt-1 text-xs text-muted-foreground">عنوان، توضیح و دکمه‌های هیرو.</p></div>
                  <div><label htmlFor="hero-title" className="field-label">عنوان اصلی</label><input id="hero-title" value={siteDraft.hero.title} onChange={(event) => setHeroField('title', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="hero-highlight" className="field-label">بخش برجسته‌ی عنوان</label><input id="hero-highlight" value={siteDraft.hero.highlight} onChange={(event) => setHeroField('highlight', event.target.value)} className="dashboard-input" /></div>
                  <div className="sm:col-span-2"><label htmlFor="hero-subtitle" className="field-label">توضیح هیرو</label><textarea id="hero-subtitle" rows={3} value={siteDraft.hero.subtitle} onChange={(event) => setHeroField('subtitle', event.target.value)} className="dashboard-input resize-y" /></div>
                  <div><label htmlFor="hero-primary" className="field-label">متن دکمه‌ی اصلی</label><input id="hero-primary" value={siteDraft.hero.primary_cta} onChange={(event) => setHeroField('primary_cta', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="hero-primary-href" className="field-label">نشانی دکمه‌ی اصلی</label><input id="hero-primary-href" value={siteDraft.hero.primary_href} onChange={(event) => setHeroField('primary_href', event.target.value)} className="dashboard-input text-left font-mono text-xs" dir="ltr" /></div>
                  <div><label htmlFor="hero-secondary" className="field-label">متن دکمه‌ی دوم</label><input id="hero-secondary" value={siteDraft.hero.secondary_cta} onChange={(event) => setHeroField('secondary_cta', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="hero-secondary-href" className="field-label">نشانی دکمه‌ی دوم</label><input id="hero-secondary-href" value={siteDraft.hero.secondary_href} onChange={(event) => setHeroField('secondary_href', event.target.value)} className="dashboard-input text-left font-mono text-xs" dir="ltr" /></div>
                </section>

                <section className="grid gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
                  <div className="sm:col-span-2"><span className="text-sm font-black">باکس دعوت به یادگیری</span><p className="mt-1 text-xs text-muted-foreground">در بخش پایینی صفحه‌ی اصلی.</p></div>
                  <div><label htmlFor="cta-title" className="field-label">عنوان</label><input id="cta-title" value={siteDraft.cta.title} onChange={(event) => setCtaField('title', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="cta-button" className="field-label">متن دکمه</label><input id="cta-button" value={siteDraft.cta.button} onChange={(event) => setCtaField('button', event.target.value)} className="dashboard-input" /></div>
                  <div className="sm:col-span-2"><label htmlFor="cta-text" className="field-label">توضیح</label><textarea id="cta-text" rows={2} value={siteDraft.cta.text} onChange={(event) => setCtaField('text', event.target.value)} className="dashboard-input resize-y" /></div>
                  <div><label htmlFor="cta-href" className="field-label">نشانی دکمه</label><input id="cta-href" value={siteDraft.cta.href} onChange={(event) => setCtaField('href', event.target.value)} className="dashboard-input text-left font-mono text-xs" dir="ltr" /></div>
                </section>

                <section className="grid gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
                  <div className="sm:col-span-2"><span className="text-sm font-black">خبرنامه‌ی فوتر</span><p className="mt-1 text-xs text-muted-foreground">برای استفاده از فرم ایمیل، جدول newsletter_subscribers در Supabase لازم است.</p></div>
                  <div><label htmlFor="newsletter-title" className="field-label">عنوان</label><input id="newsletter-title" value={siteDraft.newsletter.title} onChange={(event) => setNewsletterField('title', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="newsletter-text" className="field-label">توضیح</label><input id="newsletter-text" value={siteDraft.newsletter.text} onChange={(event) => setNewsletterField('text', event.target.value)} className="dashboard-input" /></div>
                </section>

                <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles size={14} className="text-primary" /> تغییرات پس از ذخیره در سایت نمایش داده می‌شوند.</p>
                  <button type="submit" disabled={isSaving} className="button-primary min-h-10 rounded-xl px-4 py-2 text-xs disabled:opacity-60">{isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />} ذخیره‌ی متن‌های سایت</button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
