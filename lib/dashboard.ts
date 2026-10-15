import type { PostgrestError } from '@supabase/supabase-js';
import { slugify } from '@/lib/slug';

export type SubjectDraft = {
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  kind: string;
  level: string;
  order_index: string;
  is_published: boolean;
};

export type SubjectPayload = {
  slug: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  kind: string;
  level: string | null;
  order_index: number;
  is_published: boolean;
};

/** Shapes the subject form into a `subjects` row; empty text stays NULL, not an empty string. */
export function buildSubjectPayload(draft: SubjectDraft, fallbackOrder: number): SubjectPayload {
  return {
    slug: slugify(draft.slug || draft.title, 'topic'),
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    icon: draft.icon,
    color: draft.color,
    kind: draft.kind,
    level: draft.level.trim() || null,
    order_index: Math.max(1, Number(draft.order_index) || fallbackOrder),
    is_published: draft.is_published,
  };
}

/** Persian message for the reasons a subject cannot be saved yet; empty means valid. */
export function subjectDraftError(draft: SubjectDraft) {
  if (!draft.title.trim()) return 'عنوان موضوع را وارد کن؛ مثلاً «زبان پایتون».';
  if (!slugify(draft.slug || draft.title, 'topic')) return 'نشانی کوتاه (Slug) معتبر نیست.';
  return '';
}

/** Normalize common Persian/Arabic keyboard differences before searching. */
export function normalizeSearch(value: string) {
  return value.toLocaleLowerCase('fa-IR').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\u200c\u200f\u200e]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function pageItems<T>(items: T[], page: number, size: number): T[] {
  const current = Math.min(Math.max(1, page), Math.max(1, Math.ceil(items.length / size)));
  return items.slice((current - 1) * size, current * size);
}

/** Supabase caps a single response; never silently truncate a large library. */
export async function readAllRows<T>(request: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>) {
  const rows: T[] = [];
  const batchSize = 500;
  for (let from = 0; ; from += batchSize) {
    const result = await request(from, from + batchSize - 1);
    if (result.error) return { data: null, error: result.error };
    rows.push(...(result.data || []));
    if (!result.data || result.data.length < batchSize) return { data: rows, error: null };
  }
}
