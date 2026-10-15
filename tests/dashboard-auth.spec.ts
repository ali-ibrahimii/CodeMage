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
  const subjectWrites: Record<string, unknown>[] = [];
  await page.route(`https://${project}.supabase.co/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const table = url.pathname.split('/').pop();
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
      return;
    }
    let data: unknown = [];
    if (request.method() === 'POST' && table === 'subjects') {
      const body = request.postDataJSON() as Record<string, unknown>;
      subjectWrites.push(body);
      const created = {
        id: `subject-created-${subjectWrites.length}`, description: null, icon: 'Braces', color: 'blue',
        kind: 'programming', level: null, order_index: subjects.length + 1, is_published: true, ...body,
      };
      subjects.push(created as typeof subjects[number]);
      const wantsRow = String(request.headers().accept || '').includes('pgrst.object');
      await route.fulfill({
        status: 201, contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: wantsRow ? JSON.stringify(created) : '',
      });
      return;
    }
    if (request.method() === 'PATCH' && table === 'subjects') {
      const update = request.postDataJSON() as Record<string, unknown>;
      subjectWrites.push(update);
      const id = url.searchParams.get('id')?.replace('eq.', '');
      const subject = subjects.find((item) => item.id === id);
      if (subject) Object.assign(subject, update);
      await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' }, body: '' });
      return;
    }
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
  return { listRequests, contentRequests, writes, subjectWrites };
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

  test('an admin can add a subject such as Python and number the sections of a lesson', async ({ page }) => {
    const mock = await mockAdmin(page);
    await page.goto('/dashboard');
    const nav = page.getByRole('navigation', { name: 'بخش‌های داشبورد' });

    await nav.getByRole('button', { name: 'موضوع‌ها', exact: true }).click();
    await page.getByRole('button', { name: 'موضوع جدید', exact: true }).click();
    await page.locator('#subject-title').fill('زبان پایتون');
    await expect(page.locator('#subject-slug')).toHaveValue('zban-paytvn');
    await page.getByRole('button', { name: 'ساخت موضوع' }).click();
    await expect(page.getByText('موضوع «زبان پایتون» ساخته شد')).toBeVisible();
    await page.getByRole('searchbox', { name: 'جست‌وجو در فهرست' }).fill('پایتون');
    await expect(page.locator('article')).toHaveCount(1);
    expect(mock.subjectWrites).toHaveLength(1);
    expect(mock.subjectWrites[0]).toMatchObject({ title: 'زبان پایتون', slug: 'zban-paytvn', kind: 'programming', is_published: true });

    // The new subject can be picked (or created inline) when writing a lesson.
    await nav.getByRole('button', { name: 'مدیریت درس‌ها', exact: true }).click();
    await page.getByRole('button', { name: 'درس جدید', exact: true }).click();
    await expect(page.locator('#lesson-subject').getByRole('option', { name: 'زبان پایتون' })).toHaveCount(1);
    await page.locator('#lesson-subject').selectOption('__new__');
    await expect(page.getByLabel('نام موضوع جدید')).toBeVisible();

    // Numbered sections and numbered steps render in the preview.
    await page.locator('#lesson-content').fill('## آشنایی\n\nمراحل:\n1. نصب پایتون\n2. اجرای برنامه');
    await page.getByRole('tab', { name: 'پیش‌نمایش' }).click();
    await expect(page.locator('[data-markdown-preview] h2')).toContainText('آشنایی');
    await expect(page.locator('[data-markdown-preview] ol li')).toHaveText(['نصب پایتون', 'اجرای برنامه']);

    await page.getByRole('tab', { name: 'نوشتن' }).click();
    await page.getByRole('button', { name: 'شماره‌گذاری تیترها' }).click();
    await expect(page.locator('#lesson-content')).toHaveValue('## ۱. آشنایی\n\nمراحل:\n1. نصب پایتون\n2. اجرای برنامه');

    await page.locator('#lesson-content').fill('نصب پایتون\nاجرای برنامه');
    await page.locator('#lesson-content').selectText();
    await page.getByRole('button', { name: 'فهرست شماره‌دار' }).click();
    await expect(page.locator('#lesson-content')).toHaveValue('۱. نصب پایتون\n۲. اجرای برنامه');
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
