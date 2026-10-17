'use client';

import { useState } from 'react';
import { Bold, CircleHelp, Code2, Eye, Hash, Heading, Image, List, ListOrdered, PenLine, Quote, SquareFunction, Workflow } from 'lucide-react';
import {
  markdownToHtml,
  markLinesAsList,
  numberHeadings,
  prefixLines,
  wrapSelection,
  type EditorEdit,
} from '@/lib/markdown';

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  rows?: number;
};

const HELP_ITEMS: Array<{ title: string; sample: string; hint: string }> = [
  { title: 'تیتر بخش', sample: '## عنوان بخش', hint: 'هر بخش از درس را با یک تیتر شروع کن.' },
  { title: 'شماره‌گذاری بخش‌ها', sample: '## ۱. عنوان بخش', hint: 'دستی بنویس یا دکمه‌ی «شماره‌گذاری تیترها» را بزن تا خودش ۱، ۲، ۳ بگذارد.' },
  { title: 'فهرست شماره‌دار', sample: '1. قدم اول\n2. قدم دوم', hint: 'عدد فارسی (۱. ۲.) هم قبول است؛ شماره‌ها در سایت فارسی نمایش داده می‌شوند.' },
  { title: 'زیرمجموعه‌ی فهرست', sample: '1. قدم اول\n   - جزئیات الف\n   - جزئیات ب', hint: 'سه فاصله قبل از `-` آن را زیرمجموعه می‌کند.' },
  { title: 'فهرست نقطه‌ای', sample: '- مورد اول\n- مورد دوم', hint: 'برای نکته‌های بدون ترتیب.' },
  { title: 'متن پررنگ', sample: '**نکته‌ی مهم**', hint: 'دو ستاره قبل و بعد.' },
  { title: 'کادر نکته', sample: '> **نکته:** همیشه ورودی را بررسی کن.', hint: 'خط را با `>` شروع کن.' },
  { title: 'کد', sample: '```python\nprint("سلام")\n```', hint: 'سه بک‌تیک، نام زبان، کد، سه بک‌تیک.' },
  { title: 'شکل و نمودار', sample: '```diagram flow\\nقدم اول -> قدم دوم\\n```', hint: 'سه نوع دارد: flow (جعبه و فلش، پیشفرض) ، steps (مراحل شماره‌دار) و plot (نمودار تابع مثل y = x^2).' },
  { title: 'فرمول ریاضی', sample: '$$\\frac{1}{2} + x^2$$', hint: 'بین دو علامت دلار بنویس; $x^2$ برای داخل متن و $$...$$ برای فرمول جداگانه. کسر (\\frac) و جذر (\\sqrt) هم پشتیبانی می‌شود.' },
  { title: 'عکس', sample: '![توضیح عکس](/media/pic.png)', hint: 'عکس آپلودشده در media یا هر آدرس دیگری; وقتی تنها در یک خط باشد، با توضیح زیرش نمایش داده می‌شود.' },
];

export function MarkdownField({ id = 'lesson-content', value, onChange, readOnly = false, rows = 12 }: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  // Looked up in the click handlers (never during render) so the toolbar keeps the caret position.
  function area() {
    if (typeof document === 'undefined') return null;
    return document.getElementById(id) as HTMLTextAreaElement | null;
  }

  function applyEdit(edit: EditorEdit | null) {
    if (!edit) return;
    onChange(edit.value);
    const node = area();
    if (!node) return;
    requestAnimationFrame(() => {
      node.focus();
      node.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    });
  }

  function editSelection(action: (text: string, start: number, end: number) => EditorEdit | null) {
    const node = area();
    if (!node || readOnly) return;
    applyEdit(action(value, node.selectionStart, node.selectionEnd));
  }

  function insertCodeBlock() {
    const node = area();
    if (!node || readOnly) return;
    const start = node.selectionStart;
    const end = node.selectionEnd;
    const body = value.slice(start, end) || 'print("سلام دنیا")';
    const lead = start > 0 && value[start - 1] !== '\n' ? '\n\n' : '';
    const tail = end < value.length && value[end] !== '\n' ? '\n\n' : '';
    const block = `${lead}\`\`\`python\n${body}\n\`\`\`${tail}`;
    applyEdit({
      value: `${value.slice(0, start)}${block}${value.slice(end)}`,
      selectionStart: start + lead.length + 10,
      selectionEnd: start + lead.length + 10 + body.length,
    });
  }

  function insertBlock(template: string, selectStart: number, selectLength: number) {
    const node = area();
    if (!node || readOnly) return;
    const start = node.selectionStart;
    const end = node.selectionEnd;
    const lead = start > 0 && value[start - 1] !== '\\n' ? '\\n\\n' : '';
    const tail = end < value.length && value[end] !== '\\n' ? '\\n\\n' : '';
    const block = lead + template + tail;
    applyEdit({
      value: `${value.slice(0, start)}${block}${value.slice(end)}`,
      selectionStart: start + lead.length + selectStart,
      selectionEnd: start + lead.length + selectStart + selectLength,
    });
  }

  function insertDiagramBlock() {
    const template = '```diagram flow\\nقدم اول -> قدم دوم -> قدم سوم\\n```';
    insertBlock(template, 16, template.length - 22);
  }

  function insertMathBlock() {
    const template = '$$\\frac{1}{2} + x^2$$';
    insertBlock(template, 2, template.length - 4);
  }

  function insertImage() {
    const template = '![توضیح عکس](/media/pic.png)';
    insertBlock(template, 2, 9);
  }

  function renumberHeadings() {
    if (readOnly) return;
    const next = numberHeadings(value, 2);
    if (next === value) return;
    onChange(next);
  }

  const tools: Array<{ label: string; icon: typeof Heading; run: () => void }> = [
    { label: 'تیتر بخش', icon: Heading, run: () => editSelection((text, start, end) => prefixLines(text, start, end, '## ')) },
    { label: 'شماره‌گذاری تیترها', icon: Hash, run: renumberHeadings },
    { label: 'متن پررنگ', icon: Bold, run: () => editSelection((text, start, end) => wrapSelection(text, start, end, '**', '**', 'متن مهم')) },
    { label: 'فهرست شماره‌دار', icon: ListOrdered, run: () => editSelection((text, start, end) => markLinesAsList(text, start, end, 'ol')) },
    { label: 'فهرست نقطه‌ای', icon: List, run: () => editSelection((text, start, end) => markLinesAsList(text, start, end, 'ul')) },
    { label: 'کادر نکته', icon: Quote, run: () => editSelection((text, start, end) => prefixLines(text, start, end, '> ')) },
    { label: 'کد', icon: Code2, run: insertCodeBlock },
    { label: 'شکل', icon: Workflow, run: insertDiagramBlock },
    { label: 'فرمول', icon: SquareFunction, run: insertMathBlock },
    { label: 'عکس', icon: Image, run: insertImage },
  ];

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="field-label !mb-0">محتوای درس <span className="font-normal text-muted-foreground">(Markdown)</span></label>
        <div className="flex rounded-xl border border-border bg-muted/40 p-1" role="tablist" aria-label="نمایش محتوای درس">
          <button type="button" role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black transition ${tab === 'write' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><PenLine size={13} /> نوشتن</button>
          <button type="button" role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black transition ${tab === 'preview' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Eye size={13} /> پیش‌نمایش</button>
        </div>
      </div>

      {tab === 'write' && (
        <>
          <div className="mt-2 flex flex-wrap gap-1.5" role="toolbar" aria-label="ابزارهای نوشتن محتوا">
            {tools.map(({ label, icon: Icon, run }) => (
              <button key={label} type="button" title={label} aria-label={label} disabled={readOnly} onClick={run} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 text-[11px] font-bold text-muted-foreground transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40">
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          <textarea
            id={id}
            rows={rows}
            value={value}
            disabled={readOnly}
            onChange={(event) => onChange(event.target.value)}
            className="dashboard-input mt-2 min-h-64 resize-y font-mono text-xs leading-7 disabled:opacity-60"
            placeholder={'## ۱. عنوان بخش\n\ntوضیح درس را اینجا بنویس...\n\n1. قدم اول\n2. قدم دوم\n\n```python\nprint("سلام دنیا")\n```'}
            dir="rtl"
          />
        </>
      )}

      {tab === 'preview' && (
        <div className="mt-2 rounded-2xl border border-border bg-card p-4 sm:p-6" data-markdown-preview>
          {value.trim()
            ? <div className="lesson-prose" dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
            : <p className="text-xs text-muted-foreground">هنوز متنی ننوشته‌ای؛ به تب «نوشتن» برگرد.</p>}
        </div>
      )}

      <details className="mt-2 rounded-2xl border border-border/70 bg-muted/25 p-3">
        <summary className="flex cursor-pointer items-center gap-2 text-[11px] font-black text-primary"><CircleHelp size={14} /> راهنمای نوشتن و شماره‌گذاری</summary>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {HELP_ITEMS.map((item) => (
            <li key={item.title} className="rounded-xl border border-border/60 bg-card p-3">
              <span className="block text-[11px] font-black">{item.title}</span>
              <pre className="mt-1.5 overflow-x-auto rounded-lg bg-muted/60 p-2 text-left text-[10px] leading-5" dir="ltr">{item.sample}</pre>
              <span className="mt-1.5 block text-[10px] leading-5 text-muted-foreground">{item.hint}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
