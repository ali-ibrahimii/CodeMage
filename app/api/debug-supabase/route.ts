import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const checks: any = {
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '***set***' : 'missing',
    },
    tests: {} as any,
  };

  // تست subjects
  try {
    const { data, error, count } = await supabase.from('subjects').select('*', { count: 'exact' }).limit(5);
    checks.tests.subjects = { error: error?.message || null, count, sample: data?.slice(0, 2) || [] };
  } catch (e: any) {
    checks.tests.subjects = { error: e.message };
  }

  // تست lessons با اسکیمای جدید
  try {
    const { data, error, count } = await supabase.from('lessons').select('id, slug, title, status', { count: 'exact' }).limit(5);
    checks.tests.lessons_new = { error: error?.message || null, count, sample: data || [] };
  } catch (e: any) {
    checks.tests.lessons_new = { error: e.message };
  }

  // تست v_lessons_full
  try {
    const { data, error } = await supabase.from('v_lessons_full').select('*').limit(3);
    checks.tests.v_lessons_full = { error: error?.message || null, count: data?.length, sample: data?.slice(0, 1) || [] };
  } catch (e: any) {
    checks.tests.v_lessons_full = { error: e.message };
  }

  // تست اسکیمای قدیمی tech_slug
  try {
    const { data, error } = await supabase.from('lessons').select('tech_slug, lesson_slug').limit(1);
    checks.tests.lessons_legacy = { error: error?.message || null, hasLegacyColumns: !error, sample: data || [] };
  } catch (e: any) {
    checks.tests.lessons_legacy = { error: e.message };
  }

  return NextResponse.json(checks, { status: 200 });
}
