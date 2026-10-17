// A tiny Persian-first Markdown renderer shared by the public lesson page and
// the dashboard editor preview, so what the author writes is what the reader sees.
// Besides headings/lists/quotes/code it understands lesson extras: images,
// light-weight math ($x^2$, $$…$$) and ` ```diagram ` figures (SVG, no deps).

import { diagramToSvg } from './diagram';

export type CodeSnippet = {
  language: string;
  code: string;
};

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
// The info string may carry an extra kind word (`diagram flow` / `diagram plot`).
const CODE_FENCE = /```([\w+#-]+(?:[ \t]+[\w-]+)?)?[ \t]*\r?\n([\s\S]*?)```/g;
const TOKEN_PATTERN = /CODEMAGE(BLOCK|MATH|IMG|INLINE)(\d+)END/g;
const CODE_TOKEN = /^CODEMAGE(BLOCK|MATH|IMG|INLINE)(\d+)END$/;
const HEADING_LINE = /^<h([1-6])>[\s\S]*<\/h[1-6]>$/;
const QUOTE_LINE = /^&gt;[ \t]?(.*)$/;
// `۱.` / `1)` / `۱٫` all start a numbered item; the digit lookahead keeps decimals such as `3.14` as text.
const ORDERED_LINE = /^([ \t]*)([\d۰-۹٠-٩]{1,4})[.)٫][ \t]*(?![\d۰-۹٠-٩])(.*)$/;
const BULLET_LINE = /^([ \t]*)[-*+][ \t]+(.*)$/;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/** `۱۲` → `12` so authors can type Persian digits and still get correct numbering. */
export function toLatinDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persian = PERSIAN_DIGITS.indexOf(digit);
    return String(persian >= 0 ? persian : digit.charCodeAt(0) - 0x0660);
  });
}

export function toPersianDigits(value: number | string) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

// ── Math: `$x^2$` inline and `$$…$$` display, rendered to HTML (no KaTeX) ──

const MATH_SYMBOLS: Array<[RegExp, string]> = [
  [/\\leftarrow/g, '←'],
  [/\\to|\\rightarrow/g, '→'],
  [/\\Rightarrow/g, '⇒'],
  [/\\times/g, '×'],
  [/\\div/g, '÷'],
  [/\\cdot/g, '·'],
  [/\\pm/g, '±'],
  [/\\leq?/g, '≤'],
  [/\\geq?/g, '≥'],
  [/\\neq?/g, '≠'],
  [/\\approx/g, '≈'],
  [/\\equiv/g, '≡'],
  [/\\infty/g, '∞'],
  [/\\partial/g, '∂'],
  [/\\nabla/g, '∇'],
  [/\\int/g, '∫'],
  [/\\sum/g, '∑'],
  [/\\prod/g, '∏'],
  [/\\pi/g, 'π'],
  [/\\alpha/g, 'α'],
  [/\\beta/g, 'β'],
  [/\\gamma/g, 'γ'],
  [/\\theta/g, 'θ'],
  [/\\lambda/g, 'λ'],
  [/\\mu/g, 'μ'],
  [/\\sigma/g, 'σ'],
  [/\\phi/g, 'φ'],
  [/\\omega/g, 'ω'],
  [/\\Delta/g, 'Δ'],
  [/\\lim/g, 'lim'],
  [/\\sin/g, 'sin'],
  [/\\cos/g, 'cos'],
  [/\\tan/g, 'tan'],
  [/\\log/g, 'log'],
  [/\\ln/g, 'ln'],
  [/\\left\(/g, '('],
  [/\\right\)/g, ')'],
  [/\\left\[/g, '['],
  [/\\right\]/g, ']'],
  [/\\,/g, '&#8201;'],
  [/\\;/g, '&nbsp;'],
  [/\\quad/g, '&nbsp;&nbsp;&nbsp;&nbsp;'],
  [/\\ /g, '&nbsp;'],
];

/** Pulls one balanced `{…}` group off `text` starting at `start`; returns inner content + end index. */
function readBraceGroup(text: string, start: number): { inner: string; end: number } | null {
  if (text[start] !== '{') return null;
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    else if (text[index] === '}') {
      depth -= 1;
      if (depth === 0) return { inner: text.slice(start + 1, index), end: index + 1 };
    }
  }
  return null;
}

function replaceCommandGroups(html: string, command: string, wrap: (inner: string) => string): string {
  let result = html;
  for (let at = result.indexOf(command); at !== -1; at = result.indexOf(command, at)) {
    const group = readBraceGroup(result, at + command.length);
    if (!group) {
      at += command.length;
      continue;
    }
    const replacement = wrap(replaceCommandGroups(group.inner, command, wrap));
    result = `${result.slice(0, at)}${replacement}${result.slice(group.end)}`;
    at += replacement.length;
  }
  return result;
}

/** `\frac{a}{b}` takes two brace groups; nested fractions recurse. */
function replaceFractions(html: string): string {
  let result = html;
  for (let at = result.indexOf('\\frac'); at !== -1; at = result.indexOf('\\frac', at)) {
    const numerator = readBraceGroup(result, at + 5);
    const denominator = numerator ? readBraceGroup(result, numerator.end) : null;
    if (!numerator || !denominator) {
      at += 5;
      continue;
    }
    const replacement = `<span class="math-frac"><span class="math-frac-top">${replaceFractions(numerator.inner)}</span><span class="math-frac-bottom">${replaceFractions(denominator.inner)}</span></span>`;
    result = `${result.slice(0, at)}${replacement}${result.slice(denominator.end)}`;
    at += replacement.length;
  }
  return result;
}

function replaceScripts(html: string, marker: '^' | '_', tag: 'sup' | 'sub'): string {
  let result = '';
  let index = 0;
  while (index < html.length) {
    const character = html[index];
    if (character !== marker || index === 0) {
      result += character;
      index += 1;
      continue;
    }
    let inner: string;
    if (html[index + 1] === '{') {
      const group = readBraceGroup(html, index + 1);
      if (!group) {
        result += character;
        index += 1;
        continue;
      }
      inner = group.inner;
      index = group.end;
    } else if (html[index + 1] && html[index + 1] !== ' ') {
      inner = html[index + 1];
      index += 2;
    } else {
      result += character;
      index += 1;
      continue;
    }
    result += `<${tag}>${inner}</${tag}>`;
  }
  return result;
}

/** `lim_{x → 0}` and `x^2` walk through `x_{0}^{2}` safely because each pass re-scans. */
export function renderMathHtml(source: string, display = false): string {
  let html = escapeHtml(source.trim());
  html = replaceFractions(html);
  html = replaceCommandGroups(html, '\\sqrt', (inner) => `<span class="math-sqrt">√<span class="math-sqrt-body">${inner}</span></span>`);
  html = replaceScripts(html, '^', 'sup');
  html = replaceScripts(html, '_', 'sub');
  for (const [pattern, symbol] of MATH_SYMBOLS) html = html.replace(pattern, symbol);
  html = html.replace(/\\([a-zA-Z]+)/g, '$1');
  const className = display ? 'lesson-math lesson-math-block' : 'lesson-math';
  return `<span class="${className}" dir="ltr">${html}</span>`;
}

export function extractCode(content: string): CodeSnippet[] {
  const snippets: CodeSnippet[] = [];
  const pattern = new RegExp(CODE_FENCE.source, 'g');
  let match = pattern.exec(content);
  while (match) {
    const language = (match[1] || 'code').toLowerCase();
    if (!language.startsWith('diagram')) snippets.push({ language: match[1] || 'code', code: match[2].trimEnd() });
    match = pattern.exec(content);
  }
  return snippets;
}

type ListLine = { marker: 'ul' | 'ol'; indent: number; start: number; text: string };

function indentWidth(prefix: string) {
  return prefix.replace(/\t/g, '  ').length;
}

function parseListLine(line: string): ListLine | null {
  const ordered = ORDERED_LINE.exec(line);
  if (ordered) {
    return { marker: 'ol', indent: indentWidth(ordered[1]), start: Number(toLatinDigits(ordered[2])), text: ordered[3].trim() };
  }
  const bullet = BULLET_LINE.exec(line);
  if (bullet) return { marker: 'ul', indent: indentWidth(bullet[1]), start: 0, text: bullet[2].trim() };
  return null;
}

type ListRender = { html: string; next: number; end: number };

/** Renders one indentation level; deeper items become nested lists inside their parent item. */
function renderList(items: ListLine[], position: number, indent: number, continuesFrom: number): ListRender {
  const marker = items[position].marker;
  let start = marker === 'ol' ? items[position].start : 0;
  if (marker === 'ol' && continuesFrom > 0 && start <= 1) start = continuesFrom + 1;

  const rows: string[] = [];
  let index = position;
  let end = start > 0 ? start - 1 : 0;

  while (index < items.length && items[index].indent >= indent && (items[index].indent > indent || items[index].marker === marker)) {
    if (items[index].indent > indent) {
      const nested = renderList(items, index, items[index].indent, 0);
      if (rows.length) rows[rows.length - 1] = rows[rows.length - 1].replace(/<\/li>$/, `${nested.html}</li>`);
      else rows.push(`<li>${nested.html}</li>`);
      index = nested.next;
      continue;
    }
    rows.push(`<li>${items[index].text}</li>`);
    end += 1;
    index += 1;
  }

  const attributes = marker === 'ol' && start > 1 ? ` start="${start}"` : '';
  return { html: `<${marker}${attributes}>${rows.join('')}</${marker}>`, next: index, end };
}

export function markdownToHtml(markdown: string) {
  const assets: Record<'BLOCK' | 'MATH' | 'IMG' | 'INLINE', string[]> = { BLOCK: [], MATH: [], IMG: [], INLINE: [] };
  const stash = (kind: 'BLOCK' | 'MATH' | 'IMG' | 'INLINE', html: string) => {
    assets[kind].push(html);
    return `CODEMAGE${kind}${assets[kind].length - 1}END`;
  };

  // Fenced code becomes <pre>; ```diagram fences become inline SVG figures.
  const withFences = markdown.replace(CODE_FENCE, (_match, language: string | undefined, code: string) => {
    const label = (language || 'code').toLowerCase();
    const body = code.trimEnd();
    if (label === 'diagram' || label.startsWith('diagram ') || label.startsWith('diagram-')) {
      const kind = label.replace(/^diagram[-\s]?/, '');
      const svg = diagramToSvg(body, kind || undefined);
      return `\n\n${stash('BLOCK', `<figure class="lesson-figure lesson-diagram">${svg}</figure>`)}\n\n`;
    }
    return `\n\n${stash('BLOCK', `<pre dir="ltr"><code class="language-${escapeHtml(label)}">${escapeHtml(body)}</code></pre>`)}\n\n`;
  });

  // Inline code first (so `$x$` and `$$` inside code stay literal), then display
  // math, then inline math and images; everything becomes a restorable token.
  const withInlineCode = withFences.replace(/`([^`]+)`/g, (_match, code: string) => stash('INLINE', `<code>${escapeHtml(code)}</code>`));
  const withMath = withInlineCode.replace(/\$\$([\s\S]+?)\$\$/g, (_match, tex: string) => `\n\n${stash('MATH', renderMathHtml(tex, true))}\n\n`);
  const withInlineMath = withMath.replace(/\$([^$\n]+)\$/g, (_match, tex: string) => stash('INLINE', renderMathHtml(tex)));
  const withImages = withInlineMath.replace(
    /!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)/g,
    (match: string, alt: string, src: string, title: string | undefined, offset: number, whole: string) => {
      const caption = (title || alt || '').trim();
      const before = whole.slice(0, offset);
      const after = whole.slice(offset + match.length);
      const aloneOnLine = (before === '' || before.endsWith('\n')) && (after === '' || after.startsWith('\n'));
      const figure = aloneOnLine
        ? `<figure class="lesson-figure"><img src="${escapeHtml(src)}" alt="${escapeHtml(alt || caption)}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`
        : `<img class="lesson-inline-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt || caption)}" loading="lazy" />`;
      return stash('IMG', figure);
    },
  );

  let safe = escapeHtml(withImages);
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
  safe = safe.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  safe = safe.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  safe = safe.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  safe = safe.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  safe = safe.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  safe = safe.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  const blocks: string[] = [];
  let paragraph: string[] = [];
  let orderedRunEnd = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    // A line that is only a figure/math token becomes its own block, not <p> content.
    const chunks: string[] = [];
    let textLines: string[] = [];
    const flushText = () => {
      if (!textLines.length) return;
      chunks.push(`<p>${textLines.map((line) => line.trim()).join('<br/>')}</p>`);
      textLines = [];
    };
    for (const line of paragraph) {
      const trimmed = line.trim();
      const token = CODE_TOKEN.exec(trimmed);
      if (token && (token[1] === 'MATH' || token[1] === 'IMG')) {
        flushText();
        chunks.push(trimmed);
      } else {
        textLines.push(line);
      }
    }
    flushText();
    if (chunks.length) blocks.push(...chunks);
    paragraph = [];
    orderedRunEnd = 0;
  };

  const lines = safe.split(/\r?\n/);
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      // A blank line closes a paragraph but keeps a numbered run alive, so a
      // list written with blank lines between items keeps counting up.
      flushParagraph();
      index += 1;
      continue;
    }

    const codeToken = /^CODEMAGEBLOCK(\d+)END$/.exec(trimmed);
    if (codeToken) {
      flushParagraph();
      blocks.push(trimmed);
      orderedRunEnd = 0;
      index += 1;
      continue;
    }

    if (HEADING_LINE.test(trimmed)) {
      flushParagraph();
      blocks.push(trimmed);
      orderedRunEnd = 0;
      index += 1;
      continue;
    }

    if (QUOTE_LINE.test(line)) {
      flushParagraph();
      const quote: string[] = [];
      while (index < lines.length && QUOTE_LINE.test(lines[index])) {
        quote.push((QUOTE_LINE.exec(lines[index]) as RegExpExecArray)[1].trim());
        index += 1;
      }
      blocks.push(`<blockquote>${quote.join('<br/>')}</blockquote>`);
      orderedRunEnd = 0;
      continue;
    }

    const items: ListLine[] = [];
    while (index < lines.length) {
      const item = parseListLine(lines[index]);
      if (!item) break;
      items.push(item);
      index += 1;
    }
    if (items.length) {
      flushParagraph();
      const continuesFrom = blocks.length && blocks[blocks.length - 1].endsWith('</ol>') ? orderedRunEnd : 0;
      const rendered = renderList(items, 0, items[0].indent, continuesFrom);
      blocks.push(rendered.html);
      orderedRunEnd = rendered.end;
      continue;
    }

    paragraph.push(line);
    index += 1;
  }
  flushParagraph();

  return blocks
    .join('\n')
    .replace(TOKEN_PATTERN, (_match, kind: 'BLOCK' | 'MATH' | 'IMG' | 'INLINE', index: string) => assets[kind][Number(index)] || '');
}

/** `## عنوان` → `## ۱. عنوان`; existing numbers are replaced, not doubled. */
export function numberHeadings(markdown: string, level = 2) {
  const prefix = '#'.repeat(level);
  let counter = 0;
  const stripped = markdown.replace(
    new RegExp(`^(${prefix} )(?:(?:[۰-۹٠-٩\\d]{1,3})[.)٫、-]?[ \\t]*)?(.+)$`, 'gm'),
    (_match, head: string, title: string) => {
      counter += 1;
      return `${head}${toPersianDigits(counter)}. ${title.trim()}`;
    },
  );
  return stripped;
}

export type EditorEdit = { value: string; selectionStart: number; selectionEnd: number };

/** Expands a caret/selection into the full lines it touches. */
function selectionLines(markdown: string, selectionStart: number, selectionEnd: number) {
  const lineStart = markdown.lastIndexOf('\n', Math.max(selectionStart - 1, 0)) + 1;
  let lineEnd = markdown.indexOf('\n', selectionEnd);
  if (lineEnd === -1) lineEnd = markdown.length;
  return { lineStart, lineEnd, lines: markdown.slice(lineStart, lineEnd).split('\n') };
}

function replaceLines(markdown: string, lineStart: number, lineEnd: number, rewritten: string[]): EditorEdit {
  const body = rewritten.join('\n');
  return {
    value: `${markdown.slice(0, lineStart)}${body}${markdown.slice(lineEnd)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart + body.length,
  };
}

/** Adds `-`/`۱.` markers to every line touched by the selection (or the caret line). */
export function markLinesAsList(
  markdown: string,
  selectionStart: number,
  selectionEnd: number,
  kind: 'ul' | 'ol',
): EditorEdit | null {
  const { lineStart, lineEnd, lines } = selectionLines(markdown, selectionStart, selectionEnd);
  const filled = lines.filter((line) => line.trim().length > 0);
  if (!filled.length) return null;

  const markerOf = (position: number) => (kind === 'ol' ? `${toPersianDigits(position + 1)}. ` : '- ');
  let counter = 0;
  const rewritten = lines.map((line) => {
    if (!line.trim()) return line;
    const text = line
      .replace(/^[ \t]*(?:[-*+]|[۰-۹٠-٩]{1,4}[.)٫])[ \t]*/, '');
    counter += 1;
    return `${markerOf(counter - 1)}${text}`;
  });

  return replaceLines(markdown, lineStart, lineEnd, rewritten);
}

/** Toggles a line prefix such as `## ` or `> ` on the touched lines. */
export function prefixLines(
  markdown: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
): EditorEdit | null {
  const { lineStart, lineEnd, lines } = selectionLines(markdown, selectionStart, selectionEnd);
  const filled = lines.filter((line) => line.trim().length > 0);
  if (!filled.length) return null;

  const isHeading = prefix.startsWith('#');
  const marker = new RegExp(`^[ \\t]*${isHeading ? '#{1,6}' : prefix.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[ \\t]*`);
  const allPrefixed = filled.every((line) => line.trimStart().startsWith(prefix.trim()));

  const rewritten = lines.map((line) => {
    if (!line.trim()) return line;
    const text = line.trimStart();
    if (allPrefixed) return text.replace(marker, '');
    return `${prefix}${isHeading ? text.replace(/^#{1,6}[ \t]*/, '') : text}`;
  });

  return replaceLines(markdown, lineStart, lineEnd, rewritten);
}

/** Wraps the selection (or inserts a placeholder) in `before`/`after` markers. */
export function wrapSelection(
  markdown: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string,
  placeholder: string,
) {
  const selected = markdown.slice(selectionStart, selectionEnd);
  const body = selected || placeholder;
  const value = `${markdown.slice(0, selectionStart)}${before}${body}${after}${markdown.slice(selectionEnd)}`;
  return {
    value,
    selectionStart: selectionStart + before.length,
    selectionEnd: selectionStart + before.length + body.length,
  };
}
