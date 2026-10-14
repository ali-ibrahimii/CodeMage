// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// پشتیبانی از هر دو نام کلید: نام جدید PUBLISHABLE_KEY و نام قدیمی ANON_KEY
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

// اگر env ست نشده باشد، در حالت dev یک هشدار نشان بده ولی کرش نکن
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] متغیرهای محیطی تنظیم نشده‌اند! ' +
      'NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY (یا PUBLISHABLE_KEY) را در .env.local قرار بده.'
  );
}

// اگر url یا key خالی باشد، یک کلاینت dummy می‌سازیم تا بیلد نشکند
// اما کوئری‌ها خالی برمی‌گردانند و در کنسول خطا لاگ می‌شود
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);