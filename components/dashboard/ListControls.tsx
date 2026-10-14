'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Search } from 'lucide-react';

const number = (value: number) => new Intl.NumberFormat('fa-IR').format(value);

export function ListFilters({ query, onQueryChange, onReset, children }: {
  query: string;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-border/70 bg-muted/20 p-4 sm:p-5" role="search" aria-label="فیلتر فهرست">
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="search" aria-label="جست‌وجو در فهرست" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="جست‌وجوی عنوان، نامک یا توضیح…" className="dashboard-input ps-10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
      <button type="button" onClick={onReset} className="inline-flex min-h-9 items-center gap-2 text-xs font-bold text-primary"><RotateCcw size={13} /> پاک‌کردن فیلترها</button>
    </div>
  );
}

export function FilterSelect({ label, value, onChange, children }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return <label className="min-w-0 text-xs font-bold text-muted-foreground">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="dashboard-input mt-1.5 text-xs">{children}</select></label>;
}

export function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }: {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (value: number) => void;
  onPageSizeChange: (value: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 p-4 text-xs text-muted-foreground">
      <p role="status" aria-live="polite">{total ? `${number((current - 1) * pageSize + 1)}–${number(Math.min(current * pageSize, total))} از ${number(total)} نتیجه` : '۰ نتیجه'}</p>
      <label className="flex items-center gap-2">تعداد در صفحه<select aria-label="تعداد در صفحه" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="rounded-lg border border-border bg-card p-2">{[10, 25, 50].map((size) => <option key={size} value={size}>{number(size)}</option>)}</select></label>
      <nav aria-label="صفحه‌بندی" className="flex items-center gap-2">
        <button type="button" aria-label="صفحه‌ی قبل" disabled={current <= 1} onClick={() => onPageChange(current - 1)} className="rounded-lg border border-border p-2 disabled:opacity-35"><ChevronRight size={16} /></button>
        <span>صفحه {number(current)} از {number(pages)}</span>
        <button type="button" aria-label="صفحه‌ی بعد" disabled={current >= pages} onClick={() => onPageChange(current + 1)} className="rounded-lg border border-border p-2 disabled:opacity-35"><ChevronLeft size={16} /></button>
      </nav>
    </div>
  );
}
