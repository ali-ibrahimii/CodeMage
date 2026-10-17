import { PostgrestError } from '@supabase/supabase-js';
import { expect, test } from '@playwright/test';
import { buildSubjectPayload, normalizeSearch, pageItems, readAllRows, subjectDraftError, type SubjectDraft } from '../lib/dashboard';

const pythonDraft: SubjectDraft = {
  title: '  زبان پایتون  ', slug: '', description: '  ', icon: 'Braces',
  color: 'blue', kind: 'programming', level: 'مقدماتی', order_index: '', is_published: true,
};

test('a new subject is shaped into a valid subjects row', () => {
  const payload = buildSubjectPayload(pythonDraft, 4);
  expect(payload.title).toBe('زبان پایتون');
  expect(payload.slug).toBe('zban-paytvn');
  expect(payload.description).toBeNull();
  expect(payload.order_index).toBe(4);
  expect(payload.kind).toBe('programming');
  expect(payload.is_published).toBe(true);

  const custom = buildSubjectPayload({ ...pythonDraft, slug: 'python', order_index: '0', level: '  ' }, 4);
  expect(custom.slug).toBe('python');
  expect(custom.order_index).toBe(4);
  expect(custom.level).toBeNull();
});

test('an untitled subject is rejected before any write happens', () => {
  expect(subjectDraftError(pythonDraft)).toBe('');
  expect(subjectDraftError({ ...pythonDraft, title: '   ' })).toContain('عنوان موضوع');
});

test('dashboard helpers normalize Persian search and clamp pagination', () => {
  expect(normalizeSearch('  كد يک  درس\u200cجدید ')).toBe('کد یک درس جدید');
  const rows = Array.from({ length: 26 }, (_, id) => id);
  expect(pageItems(rows, 1, 10)).toEqual(rows.slice(0, 10));
  expect(pageItems(rows, 2, 10)).toEqual(rows.slice(10, 20));
  expect(pageItems(rows, 9, 10)).toEqual(rows.slice(20));
  expect(pageItems([], 9, 10)).toEqual([]);
});

test('large libraries are not truncated at the Supabase response limit', async () => {
  const rows = Array.from({ length: 1207 }, (_, id) => ({ id }));
  const ranges: number[][] = [];
  const result = await readAllRows(async (from, to) => {
    ranges.push([from, to]);
    return { data: rows.slice(from, to + 1), error: null };
  });
  expect(result.data).toEqual(rows);
  expect(ranges).toEqual([[0, 499], [500, 999], [1000, 1499]]);
});

test('a failed batch does not masquerade as a complete library', async () => {
  const error = new PostgrestError({ message: 'Access denied', code: '42501', details: '', hint: '' });
  const result = await readAllRows(async (from) => from === 0
    ? { data: Array.from({ length: 500 }, (_, id) => ({ id })), error: null }
    : { data: null, error });
  expect(result.error).toEqual(error);
  expect(result.data).toBeNull();
});

for (const width of [320, 768, 1440]) {
  test(`dashboard is isolated, filtered and responsive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/dashboard');
    await expect(page.locator('.site-header')).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);
    await page.getByRole('button', { name: 'مشاهده‌ی نمونه‌ی فقط‌خواندنی داشبورد' }).click();
    await expect(page.getByRole('heading', { name: 'نمای کلی داشبورد', exact: true })).toBeVisible();
    await expect(page.locator('#lesson-title')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'آخرین تغییرات' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'درس جدید', exact: true })).toHaveCount(0);
    await page.getByLabel('موضوع آمار').selectOption('demo-c');
    await page.getByLabel('زمان آخرین ویرایش محتوا').selectOption('7');
    await expect(page.getByText('در محدوده‌ی انتخابی، درسی وجود ندارد. فیلترها را تغییر بده.')).toBeVisible();

    const navigation = page.getByRole('navigation', { name: 'بخش‌های داشبورد' });
    for (const section of ['موضوع‌ها', 'فصل‌ها', 'مدیریت درس‌ها', 'ظاهر و متن سایت']) {
      await navigation.getByRole('button', { name: section, exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), section).toBe(true);
    }
    await page.getByLabel('بخش تنظیمات').selectOption('hero');
    await expect(page.locator('#hero-title')).toBeVisible();
    await expect(page.locator('#brand-name')).toHaveCount(0);
    await expect(page.locator('#newsletter-title')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'ذخیره‌ی متن‌های سایت' })).toBeDisabled();

    await navigation.getByRole('button', { name: 'مدیریت درس‌ها', exact: true }).click();
    await expect(page.locator('article')).toHaveCount(7);
    await expect(page.locator('#lesson-title')).toHaveCount(0);
    await page.getByLabel('موضوع', { exact: true }).selectOption('demo-c');
    await expect(page.locator('article')).toHaveCount(1);
    await page.getByLabel('وضعیت انتشار', { exact: true }).selectOption('draft');
    await expect(page.getByText('درسی با این مشخصات پیدا نشد.')).toBeVisible();
    await page.getByRole('button', { name: 'پاک‌کردن فیلترها' }).click();
    await page.getByLabel('نمایش ویژه', { exact: true }).selectOption('featured');
    await expect(page.locator('article')).toHaveCount(2);
    await page.getByRole('button', { name: 'پاک‌کردن فیلترها' }).click();
    await page.getByRole('searchbox', { name: 'جست‌وجو در فهرست' }).fill('نیوتن');
    await expect(page.locator('article')).toHaveCount(1);
    await page.getByRole('button', { name: 'ویرایش درس' }).click();
    await expect(page.locator('#lesson-title')).toHaveValue('قوانین نیوتن');
    await expect(page.locator('#lesson-title')).toBeDisabled();
    // The read-only demo still previews Markdown but blocks the writing tools.
    await expect(page.getByRole('button', { name: 'فهرست شماره‌دار' })).toBeDisabled();
    await page.getByRole('tab', { name: 'پیش‌نمایش' }).click();
    await expect(page.locator('[data-markdown-preview] h2').first()).toContainText('قانون دوم نیوتن');
    await page.getByRole('tab', { name: 'نوشتن' }).click();
    await expect(page.locator('#lesson-content')).toBeDisabled();
    await expect(page.getByRole('searchbox', { name: 'جست‌وجو در فهرست' })).toHaveCount(0);
    await page.getByRole('button', { name: 'بازگشت به فهرست درس‌ها' }).click();
    await expect(page.getByRole('searchbox', { name: 'جست‌وجو در فهرست' })).toHaveValue('نیوتن');

    await navigation.getByRole('button', { name: 'موضوع‌ها', exact: true }).click();
    await expect(page.getByRole('button', { name: 'موضوع جدید', exact: true })).toBeDisabled();
    await page.getByRole('searchbox', { name: 'جست‌وجو در فهرست' }).fill('ریاضی');
    await expect(page.locator('article')).toHaveCount(1);
    await page.getByRole('button', { name: 'مشاهده فصل‌ها' }).click();
    await expect(page.getByLabel('موضوع', { exact: true })).toHaveValue('demo-math');
    await page.getByRole('button', { name: 'مشاهده درس‌ها' }).click();
    await expect(page.getByLabel('موضوع', { exact: true })).toHaveValue('demo-math');
    await expect(page.getByLabel('فصل', { exact: true })).toHaveValue('demo-ch-math');
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'درس جدید', exact: true })).toBeDisabled();

    await page.getByRole('link', { name: 'مشاهده‌ی سایت', exact: true }).click();
    await expect(page.locator('.site-header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
}
