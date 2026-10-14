import { expect, test } from '@playwright/test';

// Catch the missing global stylesheet seen in the original screenshot,
// not just the presence of Tailwind utility classes in the HTML.
for (const width of [320, 390, 768, 1024, 1440]) {
  test(`home styles and RTL navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const styles = await page.evaluate(() => {
      const hero = document.querySelector('.hero-panel')!;
      const container = document.querySelector('.page-container')!;
      const css = getComputedStyle(container);
      return {
        background: getComputedStyle(hero).backgroundImage,
        maxWidth: parseFloat(css.maxWidth),
        padding: parseFloat(css.paddingInlineStart),
        overflow: document.documentElement.scrollWidth > innerWidth,
        persianFont: [...document.fonts].some((font) => font.family === 'Vazirmatn' && font.status === 'loaded' && font.unicodeRange.includes('600-6FF')),
      };
    });
    expect(styles.background).toContain('linear-gradient');
    expect(styles.maxWidth).toBe(1280);
    expect(styles.padding).toBeGreaterThanOrEqual(16);
    expect(styles.overflow).toBe(false);
    expect(styles.persianFont).toBe(true);
    await expect(page.locator('.hero-panel h1')).toBeVisible();

    // Floating badges must not obscure the code window's filename.
    const codeTitle = await page.locator('.hero-window-top').boundingBox();
    const topBadge = await page.locator('.float-card').last().boundingBox();
    expect(topBadge!.y + topBadge!.height).toBeLessThanOrEqual(codeTitle!.y + 1);

    if (width < 1024) {
      const menu = page.getByRole('button', { name: 'بازکردن منو' });
      await menu.click();
      await expect(page.locator('#mobile-navigation')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#mobile-navigation')).toHaveCount(0);
      await expect(menu).toBeFocused();
      await menu.click();
      await page.locator('#mobile-navigation').getByRole('link', { name: 'درس‌ها', exact: true }).click();
      await expect(page).toHaveURL('/tutorials');
      await expect(page.locator('#mobile-navigation')).toHaveCount(0);
    } else {
      await expect(page.getByRole('navigation', { name: 'ناوبری اصلی' })).toBeVisible();
    }
  });
}

for (const width of [320, 768, 1440]) {
  test(`public pages have gutters and no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/tutorials', '/tutorials/c', '/learning-paths', '/about', '/dashboard']) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      const container = await page.locator('main .page-container').boundingBox();
      expect(container!.x).toBeGreaterThanOrEqual(0);
    }
    await page.goto('/tutorials/c');
    const lessonHref = await page.getByRole('link', { name: 'شروع اولین درس' }).getAttribute('href');
    expect(lessonHref).toBeTruthy();
    await page.goto(lessonHref!);
    await expect(page.locator('.lesson-prose')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('tab', { name: /نمونه‌کدها/ }).click();
    await expect(page.getByRole('tab', { name: /نمونه‌کدها/ })).toHaveAttribute('aria-selected', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('RTL search icon has its own padding; search works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'بازکردن منو' }).click();
  const menuInput = page.locator('#mobile-navigation input');
  const padding = await menuInput.evaluate((input) => getComputedStyle(input).paddingRight);
  expect(parseFloat(padding)).toBeGreaterThanOrEqual(40);
  await menuInput.fill('متغیر');
  await menuInput.press('Enter');
  await expect(page).toHaveURL(/\/tutorials\?q=/);
  const search = page.getByRole('searchbox', { name: 'جست‌وجو بین موضوع‌ها و درس‌ها' });
  await expect(search).toHaveValue('متغیر');
  await search.fill('عبارت ناموجود آزمایشی');
  await page.getByRole('button', { name: 'جست‌وجو', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'چیزی پیدا نکردیم' })).toBeVisible();
});

test('dark mode preserves styles and survives navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'فعال‌کردن حالت تاریک' }).filter({ visible: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  const background = await page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor);
  await page.goto('/learning-paths');
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(await page.locator('body').evaluate((body) => getComputedStyle(body).backgroundColor)).toBe(background);
});
