'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Sun, Moon, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { formatBanglaDate, getTodayDateString } from '@/lib/utils/bangla';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isOnlineDemo, isSaving } = useData();
  const [formattedToday, setFormattedToday] = React.useState('১৪ নভেম্বর ২০২৬, শনিবার');

  React.useEffect(() => {
    setFormattedToday(formatBanglaDate(getTodayDateString(), true));
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#1a1917]/85 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Title & Date */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                আমার ডিসিপ্লিন
              </span>
              <span className="hidden sm:block text-xs text-stone-500 dark:text-stone-400 font-medium">
                প্রতিদিনের কাজ, ইবাদত ও উন্নতির হিসাব
              </span>
            </div>
          </Link>
        </div>

        {/* Date Display (Center on larger screens) */}
        <div className="hidden md:flex items-center text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300 bg-stone-100/80 dark:bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-200/50 dark:border-stone-700/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          {formattedToday}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Urge Help Button - High visibility, calm styling */}
          <Link
            href="/urge-help"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm ${
              pathname === '/urge-help'
                ? 'bg-rose-600 text-white shadow-rose-600/30'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>urge সহায়তা</span>
          </Link>

          {/* Sync status */}
          <div className="hidden lg:flex items-center text-xs px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
            {isSaving ? (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                সংরক্ষণ হচ্ছে...
              </span>
            ) : isOnlineDemo ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                অফলাইন/ডেমো
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                ক্লাউড সিঙ্ক
              </span>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
