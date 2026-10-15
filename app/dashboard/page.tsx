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
import { buildSubjectPayload, normalizeSearch, pageItems, readAllRows, subjectDraftError, type SubjectDraft } from '@/lib/dashboard';
import { FilterSelect, ListFilters, Pagination } from '@/components/dashboard/ListControls';
import { MarkdownField } from '@/components/dashboard/MarkdownField';

type DashboardSection = 'overview' | 'subjects' | 'chapters' | 'lessons' | 'site';
type AccessState = 'checking' | 'signed-out' | 'checking-role' | 'admin' | 'denied';
type LessonStatus = 'draft' | 'published';
type SubjectKind = 'programming' | 'math' | 'physics' | 'other';

type SubjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  kind: SubjectKind;
  level: string | null;
  is_published: boolean;
  order_index: number;
};

type SubjectForm = SubjectDraft & { kind: SubjectKind };

// Values must match the CHECK constraint and the icon/colour maps used on the public pages.
const SUBJECT_KINDS: Array<{ value: SubjectKind; label: string }> = [
  { value: 'programming', label: 'برنامه‌نویسی' },
  { value: 'math', label: 'ریاضی' },
  { value: 'physics', label: 'فیزیک' },
  { value: 'other', label: 'سایر' },
];
const SUBJECT_ICONS = ['Braces', 'Code2', 'Atom', 'Sigma', 'BookOpen'];
const SUBJECT_COLORS = ['blue', 'cyan', 'violet', 'emerald', 'yellow'];
const SUBJECT_LEVELS = ['مقدماتی', 'متوسط', 'پیشرفته', 'مقدماتی تا پیشرفته'];

const emptySubject: SubjectForm = {
  title: '',
  slug: '',
  description: '',
  icon: 'Braces',
  color: 'blue',
  kind: 'programming',
  level: '',
  order_index: '1',
  is_published: true,
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
  content?: string;
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
  const [isDemo, setIsDemo] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
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
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [lessonSort, setLessonSort] = useState('updated');
  const [lessonPage, setLessonPage] = useState(1);
  const [lessonPageSize, setLessonPageSize] = useState(10);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isOpeningLesson, setIsOpeningLesson] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogStatus, setCatalogStatus] = useState('all');
  const [catalogSubject, setCatalogSubject] = useState('all');
  const [catalogSort, setCatalogSort] = useState('order');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogPageSize, setCatalogPageSize] = useState(10);
  const [overviewSubject, setOverviewSubject] = useState('all');
  const [overviewPeriod, setOverviewPeriod] = useState('all');
  const [statsAsOf, setStatsAsOf] = useState(() => Date.now());
  const [settingsGroup, setSettingsGroup] = useState('all');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showCreateChapter, setShowCreateChapter] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [subjectEditorOpen, setSubjectEditorOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState<SubjectForm>(emptySubject);
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);

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
      readAllRows<SubjectRow>((from, to) => supabase.from('subjects').select('id, slug, title, description, icon, color, kind, level, is_published, order_index').order('order_index', { ascending: true }).order('id').range(from, to)),
      readAllRows<ChapterRow>((from, to) => supabase.from('chapters').select('id, subject_id, slug, title, order_index, is_published').order('order_index', { ascending: true }).order('id').range(from, to)),
      readAllRows<LessonRow>((from, to) => supabase.from('lessons').select('id, subject_id, chapter_id, slug, title, summary, duration_minutes, status, is_featured, order_index, view_count, published_at, updated_at').order('updated_at', { ascending: false }).order('id').range(from, to)),
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
    setStatsAsOf(Date.now());
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

  const subjectById = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);
  const chapterById = useMemo(() => new Map(chapters.map((chapter) => [chapter.id, chapter])), [chapters]);
  const subjectCounts = useMemo(() => {
    const counts = new Map<string, { lessons: number; chapters: number }>();
    subjects.forEach((subject) => counts.set(subject.id, { lessons: 0, chapters: 0 }));
    lessons.forEach((lesson) => { const count = counts.get(lesson.subject_id); if (count) count.lessons++; });
    chapters.forEach((chapter) => { const count = counts.get(chapter.subject_id); if (count) count.chapters++; });
    return counts;
  }, [subjects, lessons, chapters]);
  const chapterCounts = useMemo(() => {
    const counts = new Map<string, number>();
    lessons.forEach((lesson) => counts.set(lesson.chapter_id, (counts.get(lesson.chapter_id) || 0) + 1));
    return counts;
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    const needle = normalizeSearch(searchQuery);
    return lessons.filter((lesson) => {
      const text = `${lesson.title} ${lesson.slug} ${lesson.summary || ''} ${subjectById.get(lesson.subject_id)?.title || ''} ${chapterById.get(lesson.chapter_id)?.title || ''}`;
      return (!needle || normalizeSearch(text).includes(needle))
        && (statusFilter === 'all' || lesson.status === statusFilter)
        && (subjectFilter === 'all' || lesson.subject_id === subjectFilter)
        && (chapterFilter === 'all' || lesson.chapter_id === chapterFilter)
        && (featuredFilter === 'all' || lesson.is_featured === (featuredFilter === 'featured'));
    }).sort((a, b) => lessonSort === 'title' ? a.title.localeCompare(b.title, 'fa')
      : lessonSort === 'views' ? b.view_count - a.view_count
      : lessonSort === 'order' ? a.order_index - b.order_index
      : (b.updated_at || '').localeCompare(a.updated_at || ''));
  }, [lessons, searchQuery, statusFilter, subjectFilter, chapterFilter, featuredFilter, lessonSort, subjectById, chapterById]);

  const filteredCatalog = useMemo(() => {
    const rows: (SubjectRow | ChapterRow)[] = section === 'chapters' ? chapters : subjects;
    const needle = normalizeSearch(catalogQuery);
    return rows.filter((row) => (!needle || normalizeSearch(`${row.title} ${row.slug} ${'subject_id' in row ? subjectById.get(row.subject_id)?.title || '' : ''}`).includes(needle))
      && (catalogStatus === 'all' || row.is_published === (catalogStatus === 'published'))
      && (catalogSubject === 'all' || !('subject_id' in row) || row.subject_id === catalogSubject))
      .sort((a, b) => catalogSort === 'title' ? a.title.localeCompare(b.title, 'fa')
        : catalogSort === 'lessons' ? (('subject_id' in b ? chapterCounts.get(b.id) : subjectCounts.get(b.id)?.lessons) || 0) - (('subject_id' in a ? chapterCounts.get(a.id) : subjectCounts.get(a.id)?.lessons) || 0)
        : a.order_index - b.order_index);
  }, [section, chapters, subjects, catalogQuery, catalogStatus, catalogSubject, catalogSort, subjectById, subjectCounts, chapterCounts]);

  const overviewLessons = useMemo(() => {
    const cutoff = overviewPeriod === 'all' ? null : statsAsOf - Number(overviewPeriod) * 86400000;
    return lessons.filter((lesson) => (overviewSubject === 'all' || lesson.subject_id === overviewSubject)
      && (cutoff === null || (lesson.updated_at && new Date(lesson.updated_at).getTime() >= cutoff)));
  }, [lessons, overviewSubject, overviewPeriod, statsAsOf]);

  function resetLessonFilters() {
    setSearchQuery(''); setStatusFilter('all'); setSubjectFilter('all'); setChapterFilter('all');
    setFeaturedFilter('all'); setLessonSort('updated'); setLessonPage(1);
  }
  function resetCatalogFilters() {
    setCatalogQuery(''); setCatalogStatus('all'); setCatalogSubject('all'); setCatalogSort('order'); setCatalogPage(1);
  }
  function navigateSection(next: DashboardSection) {
    setSection(next); setNotice(null); setEditorOpen(false); resetCatalogFilters();
  }
  function showSubjectLessons(subjectId: string, chapterId = 'all') {
    resetLessonFilters(); setSubjectFilter(subjectId); setChapterFilter(chapterId); navigateSection('lessons');
  }

  const selectedChapters = useMemo(
    () => chapters.filter((chapter) => chapter.subject_id === lessonForm.subject_id),
    [chapters, lessonForm.subject_id],
  );
  const selectedSubject = subjects.find((subject) => subject.id === lessonForm.subject_id);
  const draftCount = overviewLessons.filter((lesson) => lesson.status === 'draft').length;
  const publishedCount = overviewLessons.filter((lesson) => lesson.status === 'published').length;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsLoggingIn(false);
    if (error) setLoginError(error.message || 'ورود انجام نشد. ایمیل و گذرواژه را بررسی کن.');
  }

  async function openDemo() {
    if (hasSupabaseConfig) return;
    setIsLoadingDemo(true);
    try {
      const { getPublicSubjects, getPublicSubject } = await import('@/lib/content');
      const demoSubjects = await getPublicSubjects();
      const contents = await Promise.all(demoSubjects.map((subject) => getPublicSubject(subject.slug)));
      setSubjects(demoSubjects.map((subject) => ({ ...subject, kind: (subject.kind || 'programming') as SubjectKind, is_published: subject.is_published ?? true })));
      setChapters(contents.flatMap((content) => content?.chapters || []).map((chapter) => ({ ...chapter, is_published: chapter.is_published ?? true })));
      setLessons(contents.flatMap((content) => content?.lessons || []).map((lesson) => ({ ...lesson, view_count: 0, published_at: null, updated_at: null })));
      setProfileName('بازدیدکننده');
      setAccess('admin');
      setIsDemo(true);
    } finally {
      setIsLoadingDemo(false);
    }
  }

  async function handleSignOut() {
    if (isDemo) {
      setIsDemo(false); setAccess('signed-out'); setSection('overview'); setEditorOpen(false);
      setSubjects([]); setChapters([]); setLessons([]); resetLessonFilters(); resetCatalogFilters();
      setOverviewSubject('all'); setOverviewPeriod('all'); return;
    }
    await supabase.auth.signOut();
    setNotice(null);
  }

  function startNewLesson() {
    if (isDemo) return;
    setEditorOpen(true);
    const subject = subjectById.get(subjectFilter) || subjects.find((item) => item.is_published) || subjects[0];
    const chapter = chapters.find((item) => item.id === chapterFilter && item.subject_id === subject?.id)
      || chapters.find((item) => item.subject_id === subject?.id && item.is_published)
      || chapters.find((item) => item.subject_id === subject?.id);
    setShowCreateChapter(false);
    setShowCreateSubject(false);
    setNewChapterTitle('');
    setNewSubjectTitle('');
    setEditingId(null);
    setLessonForm({ ...emptyLesson, subject_id: subject?.id || '', chapter_id: chapter?.id || '' });
    setNotice(null);
    setSection('lessons');
  }

  async function startEditing(lesson: LessonRow) {
    setIsOpeningLesson(true);
    setNotice(null);
    const { data, error } = isDemo
      ? { data: { content: lesson.content || '' }, error: null }
      : await supabase.from('lessons').select('content').eq('id', lesson.id).single();
    setIsOpeningLesson(false);
    if (error || !data) {
      setNotice({ kind: 'error', text: localErrorMessage(error) || 'محتوای درس خوانده نشد.' });
      return;
    }
    setEditorOpen(true);
    setShowCreateChapter(false);
    setShowCreateSubject(false);
    setNewChapterTitle('');
    setNewSubjectTitle('');
    setEditingId(lesson.id);
    setLessonForm({
      subject_id: lesson.subject_id,
      chapter_id: lesson.chapter_id,
      title: lesson.title,
      slug: lesson.slug,
      summary: lesson.summary || '',
      content: data.content || '',
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
    setShowCreateSubject(false);
    setNewChapterTitle('');
    setNewSubjectTitle('');
    setLessonForm((current) => ({ ...current, subject_id: subjectId, chapter_id: firstChapter?.id || '' }));
  }

  async function createChapter() {
    if (isDemo) return;
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
    setShowCreateSubject(false);
    setNewChapterTitle('');
    setNewSubjectTitle('');
    setNotice({ kind: 'success', text: 'فصل تازه ساخته شد و برای این درس انتخاب شد.' });
  }

  function startNewSubject() {
    if (isDemo) return;
    setEditingSubjectId(null);
    setSubjectForm({ ...emptySubject, order_index: String(subjects.length + 1) });
    setSubjectEditorOpen(true);
    setNotice(null);
    setSection('subjects');
  }

  function startEditingSubject(subject: SubjectRow) {
    if (isDemo) return;
    setEditingSubjectId(subject.id);
    setSubjectForm({
      title: subject.title,
      slug: subject.slug,
      description: subject.description || '',
      icon: subject.icon || 'Braces',
      color: subject.color || 'blue',
      kind: subject.kind || 'programming',
      level: subject.level || '',
      order_index: String(subject.order_index ?? subjects.length + 1),
      is_published: subject.is_published,
    });
    setSubjectEditorOpen(true);
    setNotice(null);
    setSection('subjects');
  }

  function updateSubjectTitle(value: string) {
    setSubjectForm((current) => {
      const previousAutoSlug = slugify(current.title, 'topic');
      const shouldUpdateSlug = !current.slug || current.slug === previousAutoSlug;
      return { ...current, title: value, slug: shouldUpdateSlug ? slugify(value, 'topic') : current.slug };
    });
  }

  async function handleSaveSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isDemo) return;
    setNotice(null);

    const draftError = subjectDraftError(subjectForm);
    if (draftError) {
      setNotice({ kind: 'error', text: draftError });
      return;
    }

    setIsSavingSubject(true);
    const payload = buildSubjectPayload(subjectForm, subjects.length + 1);
    const result = editingSubjectId
      ? await supabase.from('subjects').update(payload).eq('id', editingSubjectId)
      : await supabase.from('subjects').insert(payload);
    setIsSavingSubject(false);

    if (result.error) {
      setNotice({ kind: 'error', text: localErrorMessage(result.error) });
      return;
    }

    setNotice({ kind: 'success', text: editingSubjectId ? 'موضوع با موفقیت به‌روز شد.' : `موضوع «${payload.title}» ساخته شد؛ حالا می‌توانی برایش فصل و درس بسازی.` });
    setSubjectEditorOpen(false);
    setEditingSubjectId(null);
    setSubjectForm(emptySubject);
    if (session?.user.id) await loadAdminData(session.user.id);
  }

  async function createSubjectFromLesson() {
    if (isDemo) return;
    const title = newSubjectTitle.trim();
    if (!title) return;
    setIsCreatingSubject(true);
    setNotice(null);
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        title,
        slug: slugify(title, 'topic'),
        description: null,
        icon: 'Braces',
        color: 'blue',
        kind: 'programming',
        level: null,
        order_index: subjects.length + 1,
        is_published: true,
      })
      .select('id, slug, title, description, icon, color, kind, level, is_published, order_index')
      .single();
    setIsCreatingSubject(false);

    if (error || !data) {
      setNotice({ kind: 'error', text: localErrorMessage(error) || 'ساخت موضوع انجام نشد.' });
      return;
    }

    const subject = data as SubjectRow;
    setSubjects((current) => [...current, subject]);
    setLessonForm((current) => ({ ...current, subject_id: subject.id, chapter_id: '' }));
    setShowCreateSubject(false);
    setNewSubjectTitle('');
    setNotice({ kind: 'success', text: `موضوع «${subject.title}» ساخته شد؛ حالا فصل‌هایش را بساز.` });
  }

  async function handleSaveLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isDemo) return;
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
    setEditorOpen(false);
    if (session?.user.id) await loadAdminData(session.user.id);
  }

  async function handleSaveSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isDemo) return;
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

  if (!hasSupabaseConfig && !isDemo) {
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
            <button type="button" onClick={() => void openDemo()} disabled={isLoadingDemo} className="button-primary mt-6 w-full disabled:opacity-60">{isLoadingDemo ? <LoaderCircle size={16} className="animate-spin" /> : <LayoutDashboard size={16} />} مشاهده‌ی نمونه‌ی فقط‌خواندنی داشبورد</button>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">بازگشت به سایت <ArrowLeft size={15} /></Link>
          </div>
        </div>
      </div>
    );
  }

  if (!authReady || access === 'checking' || access === 'checking-role') {
    return <div className="page-container flex min-h-[55vh] items-center justify-center py-16" dir="rtl"><div className="flex items-center gap-3 text-sm font-bold text-muted-foreground"><LoaderCircle size={20} className="animate-spin text-primary" /> در حال آماده‌سازی پنل...</div></div>;
  }

  if ((!session && !isDemo) || access === 'signed-out') {
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
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#121d32] p-4 text-left text-xs leading-6 text-slate-100" dir="ltr">{`update public.profiles\nset role = 'admin'\nwhere email = '${session?.user.email || 'your@email.com'}';`}</pre>
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
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{section === 'overview' ? 'نمای کلی داشبورد' : section === 'subjects' ? 'مدیریت موضوع‌ها' : section === 'chapters' ? 'مدیریت فصل‌ها' : section === 'lessons' ? 'مدیریت درس‌ها' : 'تنظیمات سایت'}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">سلام {profileName}؛ هر بخش جداست تا مدیریت محتوای زیاد هم ساده بماند.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="button-secondary min-h-10 px-4 py-2 text-xs"><Globe2 size={15} /> مشاهده‌ی سایت</Link>
          <button type="button" onClick={() => void handleSignOut()} className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground transition hover:border-rose-300 hover:text-rose-600"><LogOut size={15} /> خروج</button>
        </div>
      </header>

      {isDemo && <div role="status" className="mb-5 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-xs leading-7"><strong>پیش‌نمایش فقط‌خواندنی</strong> — این داده‌ها نمونه هستند، نه آمار واقعی سایت. جست‌وجو و فیلترها فعال‌اند؛ ساخت و ذخیره‌سازی غیرفعال است.</div>}
      {loadError && <div className="mb-5 rounded-2xl border border-amber-300/60 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">{loadError}</div>}
      {notice && <div role="status" className={`mb-5 flex items-center gap-2 rounded-2xl border p-3.5 text-sm font-bold ${notice.kind === 'success' ? 'border-emerald-300/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200' : 'border-rose-300/60 bg-rose-500/10 text-rose-800 dark:text-rose-200'}`}>{notice.kind === 'success' ? <Check size={16} /> : <CircleHelp size={16} />}{notice.text}</div>}

      <div className="grid items-start gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="soft-card p-3 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/55 p-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-400 text-white"><Code2 size={19} /></span>
            <span><span className="block text-xs font-black">CodeMage Studio</span><span className="mt-1 block text-[10px] text-muted-foreground">پنل تولید محتوا</span></span>
          </div>
          <nav className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1" aria-label="بخش‌های داشبورد">
            {[
              { id: 'overview' as const, label: 'نمای کلی', icon: LayoutDashboard },
              { id: 'subjects' as const, label: 'موضوع‌ها', icon: Layers3 },
              { id: 'chapters' as const, label: 'فصل‌ها', icon: FileText },
              { id: 'lessons' as const, label: 'مدیریت درس‌ها', icon: BookOpen },
              { id: 'site' as const, label: 'ظاهر و متن سایت', icon: Settings2 },
            ].map((item) => {
              const Icon = item.icon;
              return <button key={item.id} type="button" onClick={() => navigateSection(item.id)} aria-current={section === item.id ? 'page' : undefined} className="dashboard-nav-item justify-center lg:justify-start"><Icon size={17} /><span className="text-xs">{item.label}</span></button>;
            })}
          </nav>
          <div className="mt-3 hidden rounded-2xl border border-border/70 bg-background/70 p-3 lg:block">
            <p className="flex items-center gap-2 text-[11px] font-black"><LockKeyhole size={13} className="text-emerald-500" /> دسترسی امن</p>
            <p className="mt-1.5 text-[10px] leading-5 text-muted-foreground">ذخیره‌سازی از طریق Supabase و سیاست‌های RLS انجام می‌شود.</p>
          </div>
        </aside>

        <div className="min-w-0">
          {section === 'overview' && (
            <section className="space-y-5">
              <div className="soft-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="text-lg font-black">وضعیت محتوای سایت</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">این صفحه فقط خلاصه‌ی مدیریتی است؛ فهرست‌ها و فرم‌ها در بخش‌های جدا قرار دارند.</p></div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">{isDemo ? 'داده‌ی نمونه' : 'دسترسی مدیر'}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <FilterSelect label="موضوع آمار" value={overviewSubject} onChange={setOverviewSubject}><option value="all">همه‌ی موضوع‌ها</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}</option>)}</FilterSelect>
                  <FilterSelect label="زمان آخرین ویرایش محتوا" value={overviewPeriod} onChange={setOverviewPeriod}><option value="all">همه‌ی زمان‌ها</option><option value="7">۷ روز گذشته</option><option value="30">۳۰ روز گذشته</option><option value="90">۹۰ روز گذشته</option></FilterSelect>
                </div>
                <p className="mt-3 text-[11px] leading-6 text-muted-foreground">فیلتر زمان، درس‌ها را بر اساس آخرین ویرایش محدود می‌کند؛ آمار بازدید مربوط به کل عمر همین درس‌هاست.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
                {[
                  { label: 'درس در محدوده‌ی انتخابی', value: overviewLessons.length, icon: BookOpen, color: 'bg-primary/10 text-primary' },
                  { label: 'منتشرشده', value: publishedCount, icon: Eye, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
                  { label: 'پیش‌نویس', value: draftCount, icon: FileText, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
                  { label: 'بازدید کل این درس‌ها', value: overviewLessons.reduce((sum, lesson) => sum + (lesson.view_count || 0), 0), icon: Globe2, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' },
                ].map((item) => {
                  const Icon = item.icon;
                  return <div key={item.label} className="soft-card p-5"><span className={`flex size-10 items-center justify-center rounded-xl ${item.color}`}><Icon size={18} /></span><span className="mt-4 block text-3xl font-black">{faNumber(item.value)}</span><span className="mt-2 block text-xs font-bold text-muted-foreground">{item.label}</span></div>;
                })}
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="soft-card p-5 sm:p-6">
                  <h2 className="text-base font-black">وضعیت انتشار</h2>
                  {overviewLessons.length > 0 ? <>
                    <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${faNumber(publishedCount)} منتشرشده و ${faNumber(draftCount)} پیش‌نویس`}><span className="bg-emerald-500" style={{ width: `${publishedCount / overviewLessons.length * 100}%` }} /><span className="bg-amber-400" style={{ width: `${draftCount / overviewLessons.length * 100}%` }} /></div>
                    <div className="mt-4 flex flex-wrap gap-5 text-xs font-bold"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500" />منتشرشده · {faNumber(publishedCount)}</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-400" />پیش‌نویس · {faNumber(draftCount)}</span></div>
                  </> : <p className="mt-6 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">در محدوده‌ی انتخابی، درسی وجود ندارد. فیلترها را تغییر بده.</p>}
                  <p className="mt-6 text-xs leading-7 text-muted-foreground">برای بررسی و انتشار پیش‌نویس‌ها به مدیریت درس‌ها برو؛ در نمای کلی هیچ فرم ایجاد محتوایی نمایش داده نمی‌شود.</p>
                  <button type="button" onClick={() => { resetLessonFilters(); setSubjectFilter(overviewSubject); setStatusFilter('draft'); navigateSection('lessons'); }} className="mt-3 inline-flex min-h-10 items-center gap-2 text-xs font-black text-primary">بررسی همه‌ی پیش‌نویس‌های این موضوع <ArrowLeft size={14} /></button>
                </div>
                <div className="soft-card p-5 sm:p-6">
                  <h2 className="text-base font-black">ساختار کتابخانه</h2>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">موضوع ← فصل ← درس؛ هر سطح، فهرست و فیلتر مستقل دارد.</p>
                  <div className="mt-5 space-y-3">
                    {[
                      { id: 'subjects' as const, title: 'موضوع‌ها', count: subjects.length, hint: 'دسته‌بندی‌های اصلی محتوا', icon: Layers3 },
                      { id: 'chapters' as const, title: 'فصل‌ها', count: chapters.length, hint: 'ساختار آموزشی هر موضوع', icon: FileText },
                      { id: 'lessons' as const, title: 'درس‌ها', count: lessons.length, hint: 'جست‌وجو، ویرایش و انتشار', icon: BookOpen },
                    ].map(({ id, title, count, hint, icon: Icon }) => <button key={id} type="button" onClick={() => { if (id === 'lessons') resetLessonFilters(); navigateSection(id); }} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-start transition hover:border-primary/40 hover:bg-primary/5"><Icon size={18} className="text-primary" /><span className="min-w-0 flex-1"><span className="text-sm font-black">{title} <span className="text-muted-foreground">· {faNumber(count)}</span></span><span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span></span><ArrowLeft size={15} className="shrink-0 text-muted-foreground" /></button>)}
                  </div>
                </div>
              </div>
            </section>
          )}

          {(section === 'subjects' || section === 'chapters') && (
            <section className="soft-card overflow-hidden">
              <div className="border-b border-border/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><h2 className="text-lg font-black">{section === 'subjects' ? 'فهرست موضوع‌ها' : 'فهرست فصل‌ها'}</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">{section === 'subjects' ? 'موضوع تازه بساز یا موضوع‌های موجود را ویرایش کن؛ هر موضوع می‌تواند فصل و درس‌های خودش را داشته باشد.' : 'فصل‌ها را بر اساس موضوع و وضعیت انتشار محدود کن.'}</p></div>
                  {section === 'subjects' && <button type="button" onClick={startNewSubject} disabled={isDemo} className="button-primary min-h-10 rounded-xl px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} /> موضوع جدید</button>}
                </div>
              </div>
              {section === 'subjects' && subjectEditorOpen && (
                <form onSubmit={handleSaveSubject} className="border-b border-border/70 bg-muted/25 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h3 className="text-base font-black">{editingSubjectId ? 'ویرایش موضوع' : 'ساخت موضوع تازه'}</h3><p className="mt-1 text-xs leading-6 text-muted-foreground">موضوع، دسته‌بندی اصلی سایت است؛ مثلاً «زبان پایتون». بعد از ساخت، برایش فصل و درس بساز تا در صفحه‌ی موضوع‌ها دیده شود.</p></div>
                    <button type="button" onClick={() => { setSubjectEditorOpen(false); setEditingSubjectId(null); setSubjectForm(emptySubject); }} className="text-xs font-bold text-primary">بستن فرم</button>
                  </div>
                  <fieldset disabled={isDemo} className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
                    <div><label htmlFor="subject-title" className="field-label">عنوان موضوع</label><input id="subject-title" required value={subjectForm.title} onChange={(event) => updateSubjectTitle(event.target.value)} className="dashboard-input" placeholder="مثلاً: زبان پایتون" /></div>
                    <div><label htmlFor="subject-slug" className="field-label">نشانی کوتاه (Slug)</label><input id="subject-slug" required value={subjectForm.slug} onChange={(event) => setSubjectForm((current) => ({ ...current, slug: slugify(event.target.value, 'topic') }))} className="dashboard-input text-left font-mono text-xs" placeholder="python" dir="ltr" /><p className="mt-1 text-[10px] text-muted-foreground">نشانی صفحه‌ی موضوع: /tutorials/{slugify(subjectForm.slug || subjectForm.title, 'topic')}</p></div>
                    <div className="sm:col-span-2"><label htmlFor="subject-description" className="field-label">توضیح کوتاه</label><textarea id="subject-description" rows={2} value={subjectForm.description} onChange={(event) => setSubjectForm((current) => ({ ...current, description: event.target.value }))} className="dashboard-input resize-y" placeholder="این موضوع چه چیزی را آموزش می‌دهد؟" /></div>
                    <div><label htmlFor="subject-kind" className="field-label">نوع محتوا</label><select id="subject-kind" value={subjectForm.kind} onChange={(event) => setSubjectForm((current) => ({ ...current, kind: event.target.value as SubjectKind }))} className="dashboard-input">{SUBJECT_KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}</select></div>
                    <div><label htmlFor="subject-level" className="field-label">سطح</label><select id="subject-level" value={subjectForm.level} onChange={(event) => setSubjectForm((current) => ({ ...current, level: event.target.value }))} className="dashboard-input"><option value="">بدون سطح</option>{SUBJECT_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</select></div>
                    <div><label htmlFor="subject-icon" className="field-label">آیکون کارت</label><select id="subject-icon" value={subjectForm.icon} onChange={(event) => setSubjectForm((current) => ({ ...current, icon: event.target.value }))} className="dashboard-input">{SUBJECT_ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></div>
                    <div><label htmlFor="subject-color" className="field-label">رنگ کارت</label><select id="subject-color" value={subjectForm.color} onChange={(event) => setSubjectForm((current) => ({ ...current, color: event.target.value }))} className="dashboard-input">{SUBJECT_COLORS.map((color) => <option key={color} value={color}>{color}</option>)}</select></div>
                    <div><label htmlFor="subject-order" className="field-label">ترتیب نمایش</label><input id="subject-order" type="number" min="1" max="999" value={subjectForm.order_index} onChange={(event) => setSubjectForm((current) => ({ ...current, order_index: event.target.value }))} className="dashboard-input" dir="ltr" /></div>
                    <label className="flex cursor-pointer items-center gap-3 self-end rounded-2xl border border-border bg-background p-3.5"><input type="checkbox" checked={subjectForm.is_published} onChange={(event) => setSubjectForm((current) => ({ ...current, is_published: event.target.checked }))} className="size-4 accent-violet-600" /><span><span className="block text-xs font-black">انتشار در سایت</span><span className="mt-1 block text-[10px] text-muted-foreground">اگر خاموش باشد، فقط در پنل دیده می‌شود.</span></span></label>
                    <div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={isSavingSubject || isDemo} className="button-primary flex-1 disabled:opacity-60">{isSavingSubject ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}{editingSubjectId ? 'ذخیره‌ی تغییرات موضوع' : 'ساخت موضوع'}</button><button type="button" onClick={() => { setSubjectEditorOpen(false); setEditingSubjectId(null); setSubjectForm(emptySubject); }} className="button-secondary px-4">انصراف</button></div>
                  </fieldset>
                </form>
              )}
              <ListFilters query={catalogQuery} onQueryChange={(value) => { setCatalogQuery(value); setCatalogPage(1); }} onReset={resetCatalogFilters}>
                {section === 'chapters' && <FilterSelect label="موضوع" value={catalogSubject} onChange={(value) => { setCatalogSubject(value); setCatalogPage(1); }}><option value="all">همه‌ی موضوع‌ها</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}</option>)}</FilterSelect>}
                <FilterSelect label="وضعیت انتشار" value={catalogStatus} onChange={(value) => { setCatalogStatus(value); setCatalogPage(1); }}><option value="all">همه‌ی وضعیت‌ها</option><option value="published">منتشرشده</option><option value="draft">پیش‌نویس</option></FilterSelect>
                <FilterSelect label="مرتب‌سازی" value={catalogSort} onChange={(value) => { setCatalogSort(value); setCatalogPage(1); }}><option value="order">ترتیب آموزشی</option><option value="title">عنوان</option><option value="lessons">بیشترین درس</option></FilterSelect>
              </ListFilters>
              <div className="divide-y divide-border/70">
                {pageItems(filteredCatalog, catalogPage, catalogPageSize).map((row) => <article key={row.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0"><h3 className="break-words text-sm font-black">{row.title}</h3><p className="mt-2 break-words text-xs leading-6 text-muted-foreground">{'subject_id' in row ? `${subjectById.get(row.subject_id)?.title || 'موضوع نامشخص'} · ` : ''}{row.is_published ? 'منتشرشده' : 'پیش‌نویس'} · {faNumber(('subject_id' in row ? chapterCounts.get(row.id) : subjectCounts.get(row.id)?.lessons) || 0)} درس{!('subject_id' in row) && ` · ${faNumber(subjectCounts.get(row.id)?.chapters || 0)} فصل`}</p></div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {!('subject_id' in row) && <button type="button" disabled={isDemo} onClick={() => startEditingSubject(subjectById.get(row.id) || (row as SubjectRow))} className="button-secondary min-h-9 rounded-xl px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40">ویرایش موضوع</button>}
                    {!('subject_id' in row) && <button type="button" onClick={() => { navigateSection('chapters'); setCatalogSubject(row.id); }} className="button-secondary min-h-9 rounded-xl px-3 py-2 text-xs">مشاهده فصل‌ها</button>}
                    <button type="button" onClick={() => showSubjectLessons('subject_id' in row ? row.subject_id : row.id, 'subject_id' in row ? row.id : 'all')} className="button-secondary min-h-9 rounded-xl px-3 py-2 text-xs">مشاهده درس‌ها <ArrowLeft size={13} /></button>
                  </div>
                </article>)}
                {filteredCatalog.length === 0 && <div className="p-10 text-center"><Search size={24} className="mx-auto text-muted-foreground/50" /><h3 className="mt-3 text-sm font-bold">نتیجه‌ای پیدا نشد.</h3><p className="mt-2 text-xs text-muted-foreground">جست‌وجو یا فیلترها را تغییر بده.</p></div>}
              </div>
              <Pagination total={filteredCatalog.length} page={catalogPage} pageSize={catalogPageSize} onPageChange={setCatalogPage} onPageSizeChange={(size) => { setCatalogPageSize(size); setCatalogPage(1); }} />
            </section>
          )}

          {section === 'lessons' && (
            <section className="space-y-5">
              {!editorOpen && <>
              <div className="soft-card overflow-hidden">
                <div className="border-b border-border/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h2 className="text-lg font-black">درس‌ها</h2><p className="mt-1 text-xs text-muted-foreground">ایجاد، ویرایش و انتشار محتوای آموزشی</p></div>
                    <button type="button" onClick={startNewLesson} disabled={isDemo} className="button-primary min-h-10 rounded-xl px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} /> درس جدید</button>
                  </div>
                </div>
                <ListFilters query={searchQuery} onQueryChange={(value) => { setSearchQuery(value); setLessonPage(1); }} onReset={resetLessonFilters}>
                  <FilterSelect label="موضوع" value={subjectFilter} onChange={(value) => { setSubjectFilter(value); setChapterFilter('all'); setLessonPage(1); }}><option value="all">همه‌ی موضوع‌ها</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}</option>)}</FilterSelect>
                  <FilterSelect label="فصل" value={chapterFilter} onChange={(value) => { setChapterFilter(value); setLessonPage(1); }}><option value="all">همه‌ی فصل‌ها</option>{chapters.filter((chapter) => subjectFilter === 'all' || chapter.subject_id === subjectFilter).map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title} · {subjectById.get(chapter.subject_id)?.title}</option>)}</FilterSelect>
                  <FilterSelect label="وضعیت انتشار" value={statusFilter} onChange={(value) => { setStatusFilter(value as 'all' | LessonStatus); setLessonPage(1); }}><option value="all">همه‌ی وضعیت‌ها</option><option value="published">منتشرشده</option><option value="draft">پیش‌نویس</option></FilterSelect>
                  <FilterSelect label="نمایش ویژه" value={featuredFilter} onChange={(value) => { setFeaturedFilter(value); setLessonPage(1); }}><option value="all">همه‌ی درس‌ها</option><option value="featured">فقط ویژه</option><option value="normal">غیر ویژه</option></FilterSelect>
                  <FilterSelect label="مرتب‌سازی" value={lessonSort} onChange={(value) => { setLessonSort(value); setLessonPage(1); }}><option value="updated">آخرین ویرایش</option><option value="title">عنوان</option><option value="views">بیشترین بازدید</option><option value="order">ترتیب آموزشی</option></FilterSelect>
                </ListFilters>
                <div className="divide-y divide-border/65">
                  {pageItems(filteredLessons, lessonPage, lessonPageSize).map((lesson) => (
                    <article key={lesson.id} className="p-4 transition hover:bg-muted/25 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${lesson.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'}`}><BookOpen size={17} /></span>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 text-sm font-black">{lesson.title}</h3>
                          <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground">{lesson.summary || 'بدون توضیح کوتاه'}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-muted-foreground">
                            <span>{subjectById.get(lesson.subject_id)?.title || 'موضوع حذف‌شده'}</span><span>{chapterById.get(lesson.chapter_id)?.title}</span><span>{lesson.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</span><span>{faNumber(lesson.duration_minutes || 20)} دقیقه</span>{lesson.is_featured && <span className="text-primary">ویژه</span>}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        {lesson.status === 'published' && <Link href={`/tutorials/${subjectById.get(lesson.subject_id)?.slug || 'c'}/${lesson.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"><Eye size={12} /> پیش‌نمایش</Link>}
                        <button type="button" disabled={isOpeningLesson} onClick={() => void startEditing(lesson)} className="disabled:cursor-wait disabled:opacity-50 rounded-lg bg-primary/8 px-3 py-1.5 text-[10px] font-black text-primary transition hover:bg-primary/15">ویرایش درس</button>
                      </div>
                    </article>
                  ))}
                  {filteredLessons.length === 0 && <div className="p-10 text-center"><Search size={24} className="mx-auto text-muted-foreground/50" /><p className="mt-3 text-sm font-bold">درسی با این مشخصات پیدا نشد.</p></div>}
                </div>
                <Pagination total={filteredLessons.length} page={lessonPage} pageSize={lessonPageSize} onPageChange={setLessonPage} onPageSizeChange={(size) => { setLessonPageSize(size); setLessonPage(1); }} />
              </div>

              </>}
              {editorOpen && <div className="soft-card mx-auto max-w-4xl overflow-hidden">
                <div className="border-b border-border/70 bg-muted/25 p-5">
                  <button type="button" onClick={() => setEditorOpen(false)} className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-primary"><ArrowLeft size={14} /> بازگشت به فهرست درس‌ها</button>
                  <h2 className="mt-1 text-lg font-black">{editingId ? 'ویرایش درس' : 'ساخت درس تازه'}</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">متن درس Markdown است. با نوار ابزار می‌توانی تیترها را شماره‌گذاری کنی، فهرست شماره‌دار بسازی و پیش‌نمایش بگیری.</p>
                </div>
                <form onSubmit={handleSaveLesson} className="space-y-4 p-5"><fieldset disabled={isDemo} className="min-w-0 space-y-4">
                  <div><label htmlFor="lesson-subject" className="field-label">موضوع</label><select id="lesson-subject" required value={showCreateSubject ? '__new__' : lessonForm.subject_id} onChange={(event) => { if (event.target.value === '__new__') { setShowCreateSubject(true); setShowCreateChapter(false); } else { setShowCreateSubject(false); handleSubjectChange(event.target.value); } }} className="dashboard-input"><option value="">انتخاب موضوع...</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}{!subject.is_published ? ' (پیش‌نویس)' : ''}</option>)}<option value="__new__">＋ ساخت موضوع تازه...</option></select>
                    {showCreateSubject && <div className="mt-2 space-y-2"><div className="flex gap-2"><input aria-label="نام موضوع جدید" value={newSubjectTitle} onChange={(event) => setNewSubjectTitle(event.target.value)} className="dashboard-input py-2 text-xs" placeholder="نام موضوع جدید، مثلاً زبان پایتون" /><button type="button" onClick={() => void createSubjectFromLesson()} aria-label="ساخت موضوع جدید" disabled={isDemo || isCreatingSubject || !newSubjectTitle.trim()} className="shrink-0 rounded-xl bg-primary/10 px-3 text-xs font-black text-primary disabled:opacity-50">{isCreatingSubject ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}</button></div><p className="text-[10px] leading-5 text-muted-foreground">موضوع تازه با نشانی <span dir="ltr" className="font-mono">/tutorials/{slugify(newSubjectTitle, 'topic')}</span> ساخته و منتشر می‌شود؛ آیکون و رنگش را بعداً از بخش «موضوع‌ها» تغییر بده.</p></div>}
                  </div>
                  <div><label htmlFor="lesson-chapter" className="field-label">فصل</label><select id="lesson-chapter" required value={lessonForm.chapter_id} onChange={(event) => { if (event.target.value === '__new__') setShowCreateChapter(true); else { setShowCreateChapter(false); setLessonForm((current) => ({ ...current, chapter_id: event.target.value })); } }} className="dashboard-input"><option value="">انتخاب فصل...</option>{selectedChapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}<option value="__new__">＋ ساخت فصل تازه...</option></select>
                    {(showCreateChapter || lessonForm.chapter_id === '') && lessonForm.subject_id && <div className="mt-2 flex gap-2"><input aria-label="نام فصل جدید" value={newChapterTitle} onChange={(event) => setNewChapterTitle(event.target.value)} className="dashboard-input py-2 text-xs" placeholder={`نام فصل جدید برای ${selectedSubject?.title || 'این موضوع'}`} /><button type="button" onClick={() => void createChapter()} aria-label="ساخت فصل جدید" disabled={isDemo || isCreatingChapter || !newChapterTitle.trim()} className="shrink-0 rounded-xl bg-primary/10 px-3 text-xs font-black text-primary disabled:opacity-50">{isCreatingChapter ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />}</button></div>}
                  </div>
                  <div><label htmlFor="lesson-title" className="field-label">عنوان درس</label><input id="lesson-title" required value={lessonForm.title} onChange={(event) => updateLessonTitle(event.target.value)} className="dashboard-input" placeholder="مثلاً: آشنایی با متغیرها" /></div>
                  <div><label htmlFor="lesson-slug" className="field-label">نشانی کوتاه (Slug)</label><input id="lesson-slug" required value={lessonForm.slug} onChange={(event) => setLessonForm((current) => ({ ...current, slug: slugify(event.target.value) }))} className="dashboard-input text-left font-mono text-xs" placeholder="variables-intro" dir="ltr" /><p className="mt-1 text-[10px] text-muted-foreground">نشانی درس: /tutorials/{selectedSubject?.slug || 'topic'}/{slugify(lessonForm.slug || lessonForm.title)}</p></div>
                  <div><label htmlFor="lesson-summary" className="field-label">توضیح کوتاه</label><textarea id="lesson-summary" rows={2} value={lessonForm.summary} onChange={(event) => setLessonForm((current) => ({ ...current, summary: event.target.value }))} className="dashboard-input resize-y" placeholder="این درس چه چیزی را آموزش می‌دهد؟" /></div>
                </fieldset>
                <MarkdownField value={lessonForm.content} onChange={(content) => setLessonForm((current) => ({ ...current, content }))} readOnly={isDemo} />
                <fieldset disabled={isDemo} className="min-w-0 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label htmlFor="lesson-duration" className="field-label">زمان مطالعه (دقیقه)</label><input id="lesson-duration" type="number" min="1" max="999" value={lessonForm.duration_minutes} onChange={(event) => setLessonForm((current) => ({ ...current, duration_minutes: event.target.value }))} className="dashboard-input" dir="ltr" /></div>
                    <div><label htmlFor="lesson-status" className="field-label">وضعیت انتشار</label><select id="lesson-status" value={lessonForm.status} onChange={(event) => setLessonForm((current) => ({ ...current, status: event.target.value as LessonStatus }))} className="dashboard-input"><option value="draft">پیش‌نویس</option><option value="published">منتشرشده</option></select></div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-background p-3.5"><input type="checkbox" checked={lessonForm.is_featured} onChange={(event) => setLessonForm((current) => ({ ...current, is_featured: event.target.checked }))} className="size-4 accent-violet-600" /><span><span className="block text-xs font-black">نمایش به‌عنوان درس ویژه</span><span className="mt-1 block text-[10px] text-muted-foreground">در صفحه‌ی اصلی بالاتر نمایش داده می‌شود.</span></span></label>
                  <div className="flex gap-2 pt-1"><button type="submit" disabled={isSaving || isDemo} className="button-primary flex-1 disabled:opacity-60">{isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}{editingId ? 'ذخیره‌ی تغییرات' : 'ساخت و ذخیره‌ی درس'}</button><button type="button" onClick={() => { setEditorOpen(false); setEditingId(null); setLessonForm(emptyLesson); setNotice(null); }} className="button-secondary px-4">انصراف</button></div>
                </fieldset></form>
              </div>}
            </section>
          )}

          {section === 'site' && (
            <section className="soft-card overflow-hidden">
              <div className="flex flex-col justify-between gap-3 border-b border-border/70 bg-gradient-to-l from-primary/[0.07] to-transparent p-5 sm:flex-row sm:items-center sm:p-7">
                <div><span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary"><Globe2 size={13} /> SITE CONTENT</span><h2 className="mt-2 text-xl font-black">ظاهر و متن سایت</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">متن‌های زیر در صفحه‌ی اصلی، هدر و فوتر نمایش داده می‌شوند.</p></div>
                <Link href="/" target="_blank" className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition hover:text-primary sm:self-auto"><Eye size={14} /> پیش‌نمایش سایت</Link>
              </div>
              <div className="border-b border-border p-5"><FilterSelect label="بخش تنظیمات" value={settingsGroup} onChange={setSettingsGroup}><option value="all">همه‌ی تنظیمات</option><option value="brand">هویت سایت</option><option value="hero">صفحه‌ی خانه</option><option value="cta">دعوت به یادگیری</option><option value="newsletter">خبرنامه</option></FilterSelect></div>
              <form onSubmit={handleSaveSite} className="p-5 sm:p-7"><fieldset disabled={isDemo} className="min-w-0 space-y-7">
                {(settingsGroup === 'all' || settingsGroup === 'brand') && <section data-settings-group="brand" className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><span className="text-sm font-black">هویت سایت</span><p className="mt-1 text-xs text-muted-foreground">نام و جمله‌ی معرفی در هدر و فوتر.</p></div>
                  <div><label htmlFor="brand-name" className="field-label">نام سایت</label><input id="brand-name" value={siteDraft.brand.name} onChange={(event) => setBrandField('name', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="brand-tagline" className="field-label">شعار کوتاه</label><input id="brand-tagline" value={siteDraft.brand.tagline} onChange={(event) => setBrandField('tagline', event.target.value)} className="dashboard-input" /></div>
                  <div className="sm:col-span-2"><label htmlFor="brand-description" className="field-label">توضیح فوتر</label><textarea id="brand-description" rows={2} value={siteDraft.brand.description} onChange={(event) => setBrandField('description', event.target.value)} className="dashboard-input resize-y" /></div>
                </section>}

                {(settingsGroup === 'all' || settingsGroup === 'hero') && <section data-settings-group="hero" className="grid gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
                  <div className="sm:col-span-2"><span className="text-sm font-black">بخش اصلی صفحه‌ی خانه</span><p className="mt-1 text-xs text-muted-foreground">عنوان، توضیح و دکمه‌های هیرو.</p></div>
                  <div><label htmlFor="hero-title" className="field-label">عنوان اصلی</label><input id="hero-title" value={siteDraft.hero.title} onChange={(event) => setHeroField('title', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="hero-highlight" className="field-label">بخش برجسته‌ی عنوان</label><input id="hero-highlight" value={siteDraft.hero.highlight} onChange={(event) => setHeroField('highlight', event.target.value)} className="dashboard-input" /></div>
                  <div className="sm:col-span-2"><label htmlFor="hero-subtitle" className="field-label">توضیح هیرو</label><textarea id="hero-subtitle" rows={3} value={siteDraft.hero.subtitle} onChange={(event) => setHeroField('subtitle', event.target.value)} className="dashboard-input resize-y" /></div>
                  <div><label htmlFor="hero-primary" className="field-label">متن دکمه‌ی اصلی</label><input id="hero-primary" value={siteDraft.hero.primary_cta} onChange={(event) => setHeroField('primary_cta', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="hero-primary-href" className="field-label">نشانی دکمه‌ی اصلی</label><input id="hero-primary-href" value={siteDraft.hero.primary_href} onChange={(event) => setHeroField('primary_href', event.target.value)} className="dashboard-input text-left font-mono text-xs" dir="ltr" /></div>
                  <div><label htmlFor="hero-secondary" className="field-label">متن دکمه‌ی دوم</label><input id="hero-secondary" value={siteDraft.hero.secondary_cta} onChange={(event) => setHeroField('secondary_cta', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="hero-secondary-href" className="field-label">نشانی دکمه‌ی دوم</label><input id="hero-secondary-href" value={siteDraft.hero.secondary_href} onChange={(event) => setHeroField('secondary_href', event.target.value)} className="dashboard-input text-left font-mono text-xs" dir="ltr" /></div>
                </section>}

                {(settingsGroup === 'all' || settingsGroup === 'cta') && <section data-settings-group="cta" className="grid gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
                  <div className="sm:col-span-2"><span className="text-sm font-black">باکس دعوت به یادگیری</span><p className="mt-1 text-xs text-muted-foreground">در بخش پایینی صفحه‌ی اصلی.</p></div>
                  <div><label htmlFor="cta-title" className="field-label">عنوان</label><input id="cta-title" value={siteDraft.cta.title} onChange={(event) => setCtaField('title', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="cta-button" className="field-label">متن دکمه</label><input id="cta-button" value={siteDraft.cta.button} onChange={(event) => setCtaField('button', event.target.value)} className="dashboard-input" /></div>
                  <div className="sm:col-span-2"><label htmlFor="cta-text" className="field-label">توضیح</label><textarea id="cta-text" rows={2} value={siteDraft.cta.text} onChange={(event) => setCtaField('text', event.target.value)} className="dashboard-input resize-y" /></div>
                  <div><label htmlFor="cta-href" className="field-label">نشانی دکمه</label><input id="cta-href" value={siteDraft.cta.href} onChange={(event) => setCtaField('href', event.target.value)} className="dashboard-input text-left font-mono text-xs" dir="ltr" /></div>
                </section>}

                {(settingsGroup === 'all' || settingsGroup === 'newsletter') && <section data-settings-group="newsletter" className="grid gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
                  <div className="sm:col-span-2"><span className="text-sm font-black">خبرنامه‌ی فوتر</span><p className="mt-1 text-xs text-muted-foreground">برای استفاده از فرم ایمیل، جدول newsletter_subscribers در Supabase لازم است.</p></div>
                  <div><label htmlFor="newsletter-title" className="field-label">عنوان</label><input id="newsletter-title" value={siteDraft.newsletter.title} onChange={(event) => setNewsletterField('title', event.target.value)} className="dashboard-input" /></div>
                  <div><label htmlFor="newsletter-text" className="field-label">توضیح</label><input id="newsletter-text" value={siteDraft.newsletter.text} onChange={(event) => setNewsletterField('text', event.target.value)} className="dashboard-input" /></div>
                </section>}

                <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles size={14} className="text-primary" /> تغییرات پس از ذخیره در سایت نمایش داده می‌شوند.</p>
                  <button type="submit" disabled={isSaving || isDemo} className="button-primary min-h-10 rounded-xl px-4 py-2 text-xs disabled:opacity-60">{isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />} ذخیره‌ی متن‌های سایت</button>
                </div>
              </fieldset></form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
