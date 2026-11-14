'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'magic-link' | 'password'>('magic-link');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const isConfigured = isSupabaseConfigured();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!isConfigured || !supabase) {
      setMessage('ডেমো মোডে লগইন সফল! (Supabase কী সংযুক্ত না থাকলে এটি সরাসরি লোকাল স্টোরেজে চলে)');
      setTimeout(() => router.push('/'), 1200);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    setLoading(false);
    if (error) {
      setError(`লগইন লিংক পাঠাতে সমস্যা হয়েছে: ${error.message}`);
    } else {
      setMessage('আপনার ইমেইলে একটি সিকিউর ম্যাজিক লগইন লিংক পাঠানো হয়েছে!');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (!isConfigured || !supabase) {
      setMessage('ডেমো মোডে লগইন সফল!');
      setTimeout(() => router.push('/'), 1200);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setError(`ভুল ইমেইল বা পাসওয়ার্ড: ${error.message}`);
    } else {
      setMessage('সফলভাবে লগইন হয়েছে!');
      router.push('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-stone-100">আমার ডিসিপ্লিন</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            ব্যক্তিগত মালিকানাধীন অ্যাপ্লিকেশনে নিরাপদ প্রবেশ
          </p>
        </div>

        {/* Auth mode toggle */}
        <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setAuthMode('magic-link')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'magic-link'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            ইমেইল ম্যাজিক লিংক
          </button>
          <button
            onClick={() => setAuthMode('password')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'password'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500'
            }`}
          >
            পাসওয়ার্ড লগইন
          </button>
        </div>

        {/* Form */}
        {authMode === 'magic-link' ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                আপনার ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
              {loading ? 'লিংক পাঠানো হচ্ছে...' : 'লগইন লিংক পাঠান'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                ইমেইল
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
              {loading ? 'লগইন হচ্ছে...' : 'প্রবেশ করুন'}
            </Button>
          </form>
        )}

        {/* Success or Error messages */}
        {message && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Return to Dashboard */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-colors"
          >
            ← ড্যাশবোর্ডে ফিরে যান (ডেমো মোড)
          </Link>
        </div>
      </div>
    </div>
  );
}
