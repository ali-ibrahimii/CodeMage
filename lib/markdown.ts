// A tiny Persian-first Markdown renderer shared by the public lesson page and
// the dashboard editor preview, so what the author writes is what the reader sees.

export type CodeSnippet = {
  language: string;
  code: string;
};

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const CODE_FENCE = /```([\w+#-]+)?[ \t]*\r?\n([\s\S]*?)```/g;
const CODE_TOKEN = /^CODEMAGEBLOCK(\d+)END$/;
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

export function extractCode(content: string): CodeSnippet[] {
  const snippets: CodeSnippet[] = [];
  const pattern = new RegExp(CODE_FENCE.source, 'g');
  let match = pattern.exec(content);
  while (match) {
    snippets.push({ language: match[1] || 'code', code: match[2].trimEnd() });
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
  const codeBlocks: string[] = [];
  const withTokens = markdown.replace(CODE_FENCE, (_match, language: string | undefined, code: string) => {
    const index = codeBlocks.length;
    const label = language || 'code';
    codeBlocks.push(`<pre dir="ltr"><code class="language-${escapeHtml(label)}">${escapeHtml(code.trimEnd())}</code></pre>`);
    return `\n\nCODEMAGEBLOCK${index}END\n\n`;
  });

  let safe = escapeHtml(withTokens);
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
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
    blocks.push(`<p>${paragraph.map((line) => line.trim()).join('<br/>')}</p>`);
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

    const codeToken = CODE_TOKEN.exec(trimmed);
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
    .replace(/CODEMAGEBLOCK(\d+)END/g, (_match, token: string) => codeBlocks[Number(token)] || '');
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
