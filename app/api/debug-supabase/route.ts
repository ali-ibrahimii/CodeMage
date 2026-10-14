import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type DebugChecks = {
  env: {
    hasUrl: boolean;
    hasAnonKey: boolean;
    url: string;
  };
  tests: Record<string, unknown>;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET() {
  const checks: DebugChecks = {
    env: {
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '***set***' : 'missing',
    },
    tests: {},
  };

  try {
    const { data, error, count } = await supabase.from('subjects').select('*', { count: 'exact' }).limit(5);
    checks.tests.subjects = { error: error?.message || null, count, sample: data?.slice(0, 2) || [] };
  } catch (error: unknown) {
    checks.tests.subjects = { error: errorMessage(error) };
  }

  try {
    const { data, error, count } = await supabase.from('lessons').select('id, slug, title, status', { count: 'exact' }).limit(5);
    checks.tests.lessons_new = { error: error?.message || null, count, sample: data || [] };
  } catch (error: unknown) {
    checks.tests.lessons_new = { error: errorMessage(error) };
  }

  try {
    const { data, error } = await supabase.from('v_lessons_full').select('*').limit(3);
    checks.tests.v_lessons_full = { error: error?.message || null, count: data?.length, sample: data?.slice(0, 1) || [] };
  } catch (error: unknown) {
    checks.tests.v_lessons_full = { error: errorMessage(error) };
  }

  try {
    const { data, error } = await supabase.from('lessons').select('tech_slug, lesson_slug').limit(1);
    checks.tests.lessons_legacy = { error: error?.message || null, hasLegacyColumns: !error, sample: data || [] };
  } catch (error: unknown) {
    checks.tests.lessons_legacy = { error: errorMessage(error) };
  }

  return NextResponse.json(checks, { status: 200 });
}
