import { expect, test } from '@playwright/test';
import {
  markdownToHtml,
  markLinesAsList,
  numberHeadings,
  prefixLines,
  renderMathHtml,
  wrapSelection,
} from '../lib/markdown';

test('numbered steps become an ordered list, with Persian digits too', () => {
  expect(markdownToHtml('1. نصب پایتون\n2. ساخت فایل\n3. اجرا'))
    .toBe('<ol><li>نصب پایتون</li><li>ساخت فایل</li><li>اجرا</li></ol>');
  expect(markdownToHtml('۱. نصب پایتون\n۲. اجرا'))
    .toBe('<ol><li>نصب پایتون</li><li>اجرا</li></ol>');
  expect(markdownToHtml('1) نصب پایتون\n2) اجرا'))
    .toBe('<ol><li>نصب پایتون</li><li>اجرا</li></ol>');
});

test('a numbered list keeps counting across blank lines and paragraphs restart it', () => {
  const loose = markdownToHtml('1. قدم اول\n\n2. قدم دوم\n\n3. قدم سوم');
  expect(loose.match(/<li>/g)).toHaveLength(3);
  expect(loose).toContain('<ol start="2">');
  expect(loose).toContain('<ol start="3">');

  const restarted = markdownToHtml('1. الف\n2. ب\n\nیک توضیح وسط فهرست\n\n1. یک\n2. دو');
  expect(restarted).toContain('<p>یک توضیح وسط فهرست</p>');
  const lists = restarted.match(/<ol[^>]*>/g) || [];
  expect(lists).toEqual(['<ol>', '<ol>']);
});

test('a lead-in line no longer swallows the numbered list that follows it', () => {
  const html = markdownToHtml('مراحل کار:\n1. بازکردن ترمینال\n2. نوشتن کد');
  expect(html).toBe('<p>مراحل کار:</p>\n<ol><li>بازکردن ترمینال</li><li>نوشتن کد</li></ol>');
});

test('indented items become nested lists', () => {
  const html = markdownToHtml('1. قدم اول\n   - جزئیات الف\n   - جزئیات ب\n2. قدم دوم');
  expect(html).toBe('<ol><li>قدم اول<ul><li>جزئیات الف</li><li>جزئیات ب</li></ul></li><li>قدم دوم</li></ol>');
});

test('headings, emphasis, quotes and code still render inside and around lists', () => {
  const html = markdownToHtml('## ۱. نصب\n\n**پایتون** را نصب کن:\n\n> **نکته:** نسخه‌ی ۳ را بگیر.\n\n```python\nprint("سلام")\n```\n\n1. دانلود\n2. نصب');
  expect(html).toContain('<h2>۱. نصب</h2>');
  expect(html).toContain('<p><strong>پایتون</strong> را نصب کن:</p>');
  expect(html).toContain('<blockquote><strong>نکته:</strong> نسخه‌ی ۳ را بگیر.</blockquote>');
  expect(html).toContain('<pre dir="ltr"><code class="language-python">print(&quot;سلام&quot;)</code></pre>');
  expect(html).toContain('<ol><li>دانلود</li><li>نصب</li></ol>');
});

test('decimals in prose are not mistaken for numbered items', () => {
  expect(markdownToHtml('عدد 3.14 تقریبی است')).toBe('<p>عدد 3.14 تقریبی است</p>');
});

test('numberHeadings renumbers sections instead of stacking numbers', () => {
  const once = numberHeadings('## آشنایی\n\nمتن\n\n## نصب\n\n### زیربخش\n\n## اجرا');
  expect(once).toBe('## ۱. آشنایی\n\nمتن\n\n## ۲. نصب\n\n### زیربخش\n\n## ۳. اجرا');
  expect(numberHeadings(once)).toBe(once);
});

test('toolbar helpers edit the touched lines and the selection', () => {
  const steps = 'بازکردن ترمینال\nنوشتن کد';
  const numbered = markLinesAsList(steps, 0, steps.length, 'ol');
  expect(numbered?.value).toBe('۱. بازکردن ترمینال\n۲. نوشتن کد');
  expect(markLinesAsList(steps, 0, 5, 'ol')?.value).toBe('۱. بازکردن ترمینال\nنوشتن کد');

  const bullets = markLinesAsList('۱. بازکردن ترمینال\n- نوشتن کد', 0, 3, 'ul');
  expect(bullets?.value).toBe('- بازکردن ترمینال\n- نوشتن کد');

  const heading = prefixLines('آشنایی', 0, 3, '## ');
  expect(heading?.value).toBe('## آشنایی');
  expect(prefixLines(heading!.value, 0, 3, '## ')?.value).toBe('آشنایی');

  const bold = wrapSelection('نکته', 0, 4, '**', '**', 'متن مهم');
  expect(bold.value).toBe('**نکته**');
  expect([bold.selectionStart, bold.selectionEnd]).toEqual([2, 6]);
});

test('inline and display math render as HTML without extra libraries', () => {
  expect(renderMathHtml('x^2 + 3x_1')).toBe('<span class="lesson-math" dir="ltr">x<sup>2</sup> + 3x<sub>1</sub></span>');
  expect(renderMathHtml('\\frac{1}{2}')).toContain('math-frac-top');
  expect(renderMathHtml('\\sqrt{x}')).toContain('math-sqrt');
  expect(renderMathHtml('F = m \\times a')).toContain('F = m × a');

  const inline = markdownToHtml('مساحت برابر است با $a^2$.');
  expect(inline).toContain('<span class="lesson-math" dir="ltr">a<sup>2</sup></span>');
  expect(inline).toContain('مساحت برابر است با');

  const display = markdownToHtml('$$\\int_0^1 x\\,dx$$');
  expect(display).toContain('class="lesson-math lesson-math-block"');
  expect(display).not.toContain('<p>');

  // Dollars inside inline code stay literal.
  expect(markdownToHtml('`$x$`')).toBe('<p><code>$x$</code></p>');
});

test('images become figures alone on a line and inline images inside text', () => {
  const figure = markdownToHtml('![نمودار سهمی](/media/parabola.png)');
  expect(figure).toContain('<figure class="lesson-figure">');
  expect(figure).toContain('<img src="/media/parabola.png" alt="نمودار سهمی"');
  expect(figure).toContain('<figcaption>نمودار سهمی</figcaption>');

  const inline = markdownToHtml('این عکس ![کوچک](/a.png) داخل متن است.');
  expect(inline).toContain('<img class="lesson-inline-image" src="/a.png" alt="کوچک"');
  expect(inline).not.toContain('<figure');
});

test('diagram fences render deterministic SVG figures', () => {
  const flow = markdownToHtml('```diagram flow\nشروع -> اجرا\n```');
  expect(flow).toContain('<figure class="lesson-figure lesson-diagram">');
  expect(flow).toContain('<svg');
  expect(flow).toContain('شروع');
  expect(flow).toContain('marker-end');

  const steps = markdownToHtml('```diagram steps\nنصب | از سایت رسمی\n```');
  expect(steps).toContain('<circle');

  const plot = markdownToHtml('```diagram plot\ny = x^2\ndomain: -2..2\n```');
  expect(plot).toContain('<svg');
  expect(plot).toContain('y = x^2');

  // Diagram fences never leak into the code-snippet tab.
  expect(markdownToHtml('```diagram\nA -> B\n```')).toContain('<svg');
});
