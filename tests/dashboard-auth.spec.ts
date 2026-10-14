import { expect, test, type Page } from '@playwright/test';

// Opt-in: run against a dev server started with the fake public config below.
// All browser Supabase requests are intercepted; no real account or database is used.
const enabled = process.env.DASHBOARD_AUTH_TESTS === '1';
const project = 'dashboard-test';
const userId = '11111111-1111-4111-8111-111111111111';
const subjects = Array.from({ length: 31 }, (_, index) => ({
  id: `subject-${index}`, slug: `topic-${index}`, title: `موضوع ${index}`,
  order_index: index, is_published: index % 2 === 0,
}));
const chapters = subjects.map((subject, index) => ({
  id: `chapter-${index}`, subject_id: subject.id, slug: `chapter-${index}`,
  title: `فصل ${index}`, order_index: index, is_published: true,
}));

async function mockAdmin(page: Page, role = 'admin') {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: expiresAt, role: 'authenticated' })).toString('base64url');
  const session = {
    access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.fake-signature`, refresh_token: 'fake-refresh',
    token_type: 'bearer', expires_at: expiresAt, expires_in: 3600,
    user: { id: userId, email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() },
  };
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
    key: `sb-${project}-auth-token`, value: session,
  });
  const lessons = Array.from({ length: 1207 }, (_, index) => ({
    id: `lesson-${index}`, subject_id: subjects[index % subjects.length].id,
    chapter_id: chapters[index % chapters.length].id, slug: `lesson-${index}`,
    title: `درس ${String(index).padStart(4, '0')}`, summary: `خلاصه ${index}`,
    content: `## محتوای کامل ${index}`, duration_minutes: 20,
    status: index % 2 === 0 ? 'published' : 'draft', is_featured: index % 3 === 0,
    order_index: index, view_count: index, published_at: null, updated_at: '2026-10-14T00:00:00Z',
  }));
  const listRequests: string[] = [];
  const contentRequests: string[] = [];
  const writes: unknown[] = [];
  await page.route(`https://${project}.supabase.co/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const table = url.pathname.split('/').pop();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
      return;
    }
    let data: unknown = [];
    if (request.method() === 'PATCH' && table === 'lessons') {
      const update = request.postDataJSON();
      writes.push(update);
      const id = url.searchParams.get('id')?.replace('eq.', '');
      const lesson = lessons.find((item) => item.id === id);
      if (lesson) Object.assign(lesson, update);
    } else if (table === 'profiles') {
      data = { role, display_name: 'مدیر آزمایشی', email: 'test@example.com' };
    } else if (table === 'lessons' && url.searchParams.get('select') === 'content') {
      contentRequests.push(request.url());
      const id = url.searchParams.get('id')?.replace('eq.', '');
      data = { content: lessons.find((lesson) => lesson.id === id)?.content || '' };
    } else {
      const from = Number(url.searchParams.get('offset') || 0);
      const size = Number(url.searchParams.get('limit') || 500);
      if (table === 'subjects') data = subjects.slice(from, from + size);
      if (table === 'chapters') data = chapters.slice(from, from + size);
      if (table === 'lessons') {
        listRequests.push(request.url());
        // Honor the metadata-only selection.
        data = lessons.slice(from, from + size).map((lesson) => Object.fromEntries(Object.entries(lesson).filter(([key]) => key !== 'content')));
      }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(data) });
  });
  return { listRequests, contentRequests, writes };
}

test.describe('authenticated dashboard with mocked Supabase', () => {
  test.skip(!enabled, 'Requires DASHBOARD_AUTH_TESTS=1 and the fake dashboard-test Supabase dev configuration.');

  test('large lists paginate; content loads only when editing; saving refreshes the list', async ({ page }) => {
    const mock = await mockAdmin(page);
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'نمای کلی داشبورد', exact: true })).toBeVisible();
    expect(mock.listRequests).toHaveLength(3);
    expect(mock.contentRequests).toHaveLength(0);
    for (const request of mock.listRequests) {
      expect(new URL(request).searchParams.get('select')?.split(',')).not.toContain('content');
    }
    const nav = page.getByRole('navigation', { name: 'بخش‌های داشبورد' });
    await nav.getByRole('button', { name: 'مدیریت درس‌ها', exact: true }).click();
    await expect(page.locator('article')).toHaveCount(10);
    await expect(page.getByText('صفحه ۱ از ۱۲۱')).toBeVisible();
    await page.getByRole('button', { name: 'صفحه‌ی بعد' }).click();
    await expect(page.locator('article').first()).toContainText('درس 0010');
    await page.getByRole('searchbox', { name: 'جست‌وجو در فهرست' }).fill('درس 1206');
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.getByText('صفحه ۱ از ۱')).toBeVisible();
    await page.getByRole('button', { name: 'پاک‌کردن فیلترها' }).click();
    await page.getByRole('button', { name: 'ویرایش درس' }).first().click();
    await expect(page.locator('#lesson-content')).toHaveValue('## محتوای کامل 0');
    expect(mock.contentRequests).toHaveLength(1);
    await page.locator('#lesson-title').fill('درس ویرایش‌شده');
    await page.getByRole('button', { name: 'ذخیره‌ی تغییرات' }).click();
    await expect(page.getByText('تغییرات درس با موفقیت ذخیره شد.')).toBeVisible();
    await expect(page.locator('#lesson-title')).toHaveCount(0);
    await expect(page.locator('article').first()).toContainText('درس ویرایش‌شده');
    expect(mock.writes).toHaveLength(1);
    await nav.getByRole('button', { name: 'موضوع‌ها', exact: true }).click();
    await expect(page.locator('article')).toHaveCount(10);
    await page.getByLabel('تعداد در صفحه').selectOption('25');
    await expect(page.locator('article')).toHaveCount(25);
    await page.getByRole('button', { name: 'صفحه‌ی بعد' }).click();
    await expect(page.locator('article')).toHaveCount(6);
    await page.getByRole('searchbox', { name: 'جست‌وجو در فهرست' }).fill('موضوع 0');
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.getByText('صفحه ۱ از ۱')).toBeVisible();
  });

  test('non-admin users cannot access content controls', async ({ page }) => {
    const mock = await mockAdmin(page, 'student');
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'این حساب دسترسی مدیریت ندارد' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'بخش‌های داشبورد' })).toHaveCount(0);
    expect(mock.listRequests).toHaveLength(0);
    expect(mock.writes).toHaveLength(0);
  });
});
