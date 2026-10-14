import type { PostgrestError } from '@supabase/supabase-js';

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
