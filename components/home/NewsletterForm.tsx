'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, Check, Send } from 'lucide-react';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!hasSupabaseConfig) {
      setMessage('برای فعال‌شدن خبرنامه، اتصال Supabase را تنظیم کنید.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
    setIsLoading(false);

    if (error) {
      setMessage(error.code === '23505' ? 'این ایمیل قبلاً ثبت شده است.' : 'ثبت ایمیل انجام نشد؛ دوباره تلاش کن.');
      return;
    }

    setIsSuccess(true);
    setMessage('ایمیل تو با موفقیت ثبت شد؛ ممنون که همراه مایی!');
    setEmail('');
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">ایمیل شما</label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ایمیل خودت را وارد کن"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#a9ef8f] focus:ring-4 focus:ring-[#a9ef8f]/10"
          dir="rtl"
        />
        <button type="submit" disabled={isLoading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#b7f486] px-5 text-sm font-black text-[#182239] transition hover:bg-[#caf79f] disabled:cursor-wait disabled:opacity-70">
          {isSuccess ? <Check size={16} /> : isLoading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Send size={15} />}
          {isLoading ? 'در حال ثبت' : 'عضویت'}
          <ArrowLeft size={14} />
        </button>
      </form>
      {message && <p className={`mt-2 text-xs ${isSuccess ? 'text-[#b7f486]' : 'text-rose-200'}`} role="status">{message}</p>}
    </div>
  );
}
