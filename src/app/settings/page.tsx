'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Clock,
  DollarSign,
  Download,
  Trash2,
  RefreshCw,
  Smartphone,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useTheme } from '@/context/ThemeContext';
import { exportTasksToCSV, exportRevenueToCSV } from '@/lib/utils/export-csv';
import { toBanglaNumber } from '@/lib/utils/bangla';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    tasks,
    revenue,
    resetToDemoData,
    clearAllUserData,
    isOnlineDemo,
  } = useData();

  const { theme, toggleTheme, setTheme } = useTheme();

  // Local form state
  const [profileName, setProfileName] = useState(settings.profile_name);
  const [workTarget, setWorkTarget] = useState(settings.daily_work_target_hours);
  const [englishTarget, setEnglishTarget] = useState(settings.daily_english_target_hours);
  const [huntTarget, setHuntTarget] = useState(settings.daily_hunting_target_minutes);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '৳');
  const [prayerEnabled, setPrayerEnabled] = useState(settings.prayer_tracking_enabled);
  const [savedNotice, setSavedNotice] = useState(false);

  // PWA install prompt handler
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('আপনার ব্রাউজার মেনু থেকে "Add to Home Screen" বা "Install App" নির্বাচন করুন।');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      profile_name: profileName.trim() || 'ব্যবহারকারী',
      daily_work_target_hours: Number(workTarget) || 6,
      daily_english_target_hours: Number(englishTarget) || 1,
      daily_hunting_target_minutes: Number(huntTarget) || 45,
      currency_symbol: currencySymbol,
      prayer_tracking_enabled: prayerEnabled,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleResetDemo = () => {
    if (confirm('আপনি কি ডেমো ডেটা পুনরায় লোড করতে চান? আপনার আগের লোকাল পরিবর্তন মুছে যাবে।')) {
      resetToDemoData();
      alert('ডেমো ডেটা সফলভাবে রিলোড করা হয়েছে!');
    }
  };

  const handleClearAll = () => {
    if (confirm('সতর্কতা: এটি আপনার সব টাস্ক, ক্লায়েন্ট ও দৈনিক লগ স্থায়ীভাবে মুছে ফেলবে। আপনি কি নিশ্চিত?')) {
      clearAllUserData();
      alert('সব তথ্য মুছে ফেলা হয়েছে।');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          <span>অ্যাপ সেটিংস ও পছন্দসমূহ</span>
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          ব্যক্তিগত লক্ষ্য, থিম, ডেটা এক্সপোর্ট ও অ্যাপ পরিচালনা
        </p>
      </div>

      {/* 1. Profile & Daily Targets Form */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-5 shadow-xs">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          <span>প্রোফাইল ও দৈনিক লক্ষ্যমাত্রা</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              ব্যবহারকারীর নাম
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                দৈনিক কাজের লক্ষ্য (ঘণ্টা)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="14"
                value={workTarget}
                onChange={(e) => setWorkTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                English শেখার লক্ষ্য (ঘণ্টা)
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="4"
                value={englishTarget}
                onChange={(e) => setEnglishTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                ক্লায়েন্ট হান্টিং লক্ষ্য (মিনিট)
              </label>
              <input
                type="number"
                step="5"
                min="10"
                max="180"
                value={huntTarget}
                onChange={(e) => setHuntTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                পছন্দের মুদ্রা প্রতীক (Currency Symbol)
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                টাইমজোন
              </label>
              <input
                type="text"
                disabled
                value="Asia/Dhaka (বাংলাদেশ সময়)"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/50 text-stone-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          {savedNotice && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              পরিবর্তন সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </form>

      {/* 2. Theme Preferences */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          অ্যাপ থিম ও মোড (Dark / Light)
        </h2>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
              theme === 'light'
                ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs">লাইট মোড</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-stone-800 border-emerald-500 text-emerald-300 font-bold shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600'
            }`}
          >
            <Moon className="w-4 h-4 text-emerald-400" />
            <span className="text-xs">ডার্ক মোড</span>
          </button>
        </div>
      </div>

      {/* 3. PWA Installation Instructions & Button */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          <span>মোবাইল ও ডেস্কটপে PWA ইনস্টল</span>
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          &ldquo;আমার ডিসিপ্লিন&rdquo; একটি পূর্ণাঙ্গ PWA। আপনি এটি অ্যান্ড্রয়েড ফোনে বা কম্পিউটারে কোনো অ্যাপ স্টোর ছাড়াই হোম স্ক্রিনে সরাসরি অ্যাপের মতো ইনস্টল করে চালাতে পারেন।
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>হোম স্ক্রিনে ইনস্টল করুন</span>
          </button>

          <span className="text-xs text-stone-400">
            (অ্যান্ড্রয়েড ক্রোম: মেনু → &ldquo;Add to Home screen&rdquo; / আইফোন সাফারি: Share → &ldquo;Add to Home Screen&rdquo;)
          </span>
        </div>
      </div>

      {/* 4. Export Data to CSV */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          <span>ডেটা ব্যাকআপ ও CSV এক্সপোর্ট</span>
        </h2>
        <p className="text-xs text-stone-500">
          আপনার কাজ এবং আয়ের সকল ডেটা এক্সেল বা স্প্রেডশীটে ব্যবহারের জন্য সরাসরি ডাউনলোড করুন
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => exportTasksToCSV(tasks)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-colors border border-stone-200 dark:border-stone-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>কাজের তালিকা CSV ({toBanglaNumber(tasks.length)}টি কাজ)</span>
          </button>

          <button
            onClick={() => exportRevenueToCSV(revenue)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-colors border border-stone-200 dark:border-stone-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>আয়ের রেকর্ড CSV ({toBanglaNumber(revenue.length)}টি এন্ট্রি)</span>
          </button>
        </div>
      </div>

      {/* 5. Demo Data Management & Reset */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          ডেটা রিসেট ও ডেমো মোড
        </h2>
        <p className="text-xs text-stone-500">
          বর্তমান স্ট্যাটাস: {isOnlineDemo ? 'লোকাল ডেমো মোড সক্রিয়' : 'Supabase ক্লাউড সক্রিয়'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ডেমো ডেটায় রিসেট করুন</span>
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>সকল ব্যক্তিগত ডেটা মুছুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
