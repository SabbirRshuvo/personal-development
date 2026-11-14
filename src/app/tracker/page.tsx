'use client';

import React, { useState } from 'react';
import {
  Activity,
  Clock,
  MoonStar,
  Heart,
  Shield,
  Smile,
  Meh,
  Frown,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  Users2,
  Save,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Mood, PrayerStatus, PrayerType, TriggerType } from '@/lib/types/database';
import { toBanglaNumber, formatBanglaDate, getTodayDateString } from '@/lib/utils/bangla';

export default function TrackerPage() {
  const {
    dailyLog,
    prayerLog,
    updateDailyLog,
    updatePrayerStatus,
    updatePrayerNotes,
    addUrgeLog,
    addRelapseLog,
    isSaving,
  } = useData();

  // Local state for auto-save and immediate responsiveness
  const [activeTab, setActiveTab] = useState<'work' | 'prayer' | 'wellbeing' | 'urge'>('work');

  // Urge & Relapse Form State
  const [urgeOccurred, setUrgeOccurred] = useState<'yes' | 'no'>('no');
  const [urgeIntensity, setUrgeIntensity] = useState<number>(3);
  const [urgeTime, setUrgeTime] = useState('');
  const [urgeTrigger, setUrgeTrigger] = useState<TriggerType>('stress');
  const [urgeRecovery, setUrgeRecovery] = useState('');
  const [urgeNote, setUrgeNote] = useState('');
  const [urgeSavedSuccess, setUrgeSavedSuccess] = useState(false);

  // Relapse Form State
  const [relapseOccurred, setRelapseOccurred] = useState<'yes' | 'no'>('no');
  const [timeLostMins, setTimeLostMins] = useState(30);
  const [relapseTrigger, setRelapseTrigger] = useState<TriggerType>('রাত জাগা');
  const [relapseRecovery, setRelapseRecovery] = useState('');
  const [relapseNote, setRelapseNote] = useState('');
  const [relapseSavedSuccess, setRelapseSavedSuccess] = useState(false);

  const [todayStr, setTodayStr] = useState('2026-11-14');
  const [formattedToday, setFormattedToday] = useState('১৪ নভেম্বর ২০২৬, শনিবার');

  React.useEffect(() => {
    const td = getTodayDateString();
    setTodayStr(td);
    setFormattedToday(formatBanglaDate(td, true));
  }, []);

  const handleUrgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urgeOccurred === 'yes') {
      await addUrgeLog({
        date: todayStr,
        occurred: true,
        intensity: urgeIntensity,
        time_of_day: urgeTime || 'আজকের কোনো এক সময়',
        trigger: urgeTrigger,
        recovery_action: urgeRecovery,
        private_note: urgeNote,
      });
    }
    setUrgeSavedSuccess(true);
    setTimeout(() => setUrgeSavedSuccess(false), 4000);
  };

  const handleRelapseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (relapseOccurred === 'yes') {
      await addRelapseLog({
        date: todayStr,
        occurred: true,
        time_lost_minutes: Number(timeLostMins) || 0,
        trigger: relapseTrigger,
        recovery_action_taken: relapseRecovery,
        private_note: relapseNote,
      });
    }
    setRelapseSavedSuccess(true);
  };

  const prayers: Array<{
    key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    name: string;
  }> = [
    { key: 'fajr', name: 'ফজর' },
    { key: 'dhuhr', name: 'যোহর' },
    { key: 'asr', name: 'আসর' },
    { key: 'maghrib', name: 'মাগরিব' },
    { key: 'isha', name: 'এশা' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>দৈনিক ট্র্যাকার</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {formattedToday} • সময়, ইবাদত, সুস্থতা ও রিল্যাপ্স প্রিভেনশন
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              সংরক্ষণ হচ্ছে...
            </span>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              স্বয়ংক্রিয়ভাবে সংরক্ষিত
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-stone-100 dark:bg-stone-800/70 rounded-2xl">
        <button
          onClick={() => setActiveTab('work')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'work'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-500" />
          <span>কাজের সময়</span>
        </button>

        <button
          onClick={() => setActiveTab('prayer')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'prayer'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <MoonStar className="w-4 h-4 text-emerald-500" />
          <span>নামাজ ও ইবাদত</span>
        </button>

        <button
          onClick={() => setActiveTab('wellbeing')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'wellbeing'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Heart className="w-4 h-4 text-purple-500" />
          <span>সুস্থতা ও আত্মদর্শন</span>
        </button>

        <button
          onClick={() => setActiveTab('urge')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'urge'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
          }`}
        >
          <Shield className="w-4 h-4 text-rose-500" />
          <span>Urge ও Relapse</span>
        </button>
      </div>

      {/* ===================== TAB 1: WORK TIME ===================== */}
      {activeTab === 'work' && (
        <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              আজকের সময় বণ্টন ট্র্যাকার
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              স্লাইডার বা ইনপুট পরিবর্তন করলেই স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে
            </p>
          </div>

          <div className="space-y-5">
            {/* 1. Focused work */}
            <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                    মোট focused কাজের সময়
                  </span>
                  <span className="text-xs text-stone-500">গভীর মনোযোগ দিয়ে কাজ করার সময়</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="16"
                    value={dailyLog.focused_work_hours}
                    onChange={(e) =>
                      updateDailyLog({ focused_work_hours: parseFloat(e.target.value) || 0 })
                    }
                    className="w-16 px-2 py-1 text-center font-bold text-sm rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-stone-800"
                  />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    ঘণ্টা
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={dailyLog.focused_work_hours}
                onChange={(e) => updateDailyLog({ focused_work_hours: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            {/* 2. Client Work */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                    ক্লায়েন্ট প্রজেক্টের কাজ
                  </span>
                  <span className="text-xs text-stone-500">ক্লায়েন্টের ডেলিভারির জন্য সময়</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="14"
                    value={dailyLog.client_work_hours}
                    onChange={(e) =>
                      updateDailyLog({ client_work_hours: parseFloat(e.target.value) || 0 })
                    }
                    className="w-16 px-2 py-1 text-center font-bold text-sm rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-stone-800"
                  />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    ঘণ্টা
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={dailyLog.client_work_hours}
                onChange={(e) => updateDailyLog({ client_work_hours: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* 3. Learning hours */}
            <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                    নতুন কিছু শেখার সময় (Learning)
                  </span>
                  <span className="text-xs text-stone-500">টেক স্কিল, বই পড়া বা টিউটোরিয়াল</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="6"
                    value={dailyLog.learning_hours}
                    onChange={(e) =>
                      updateDailyLog({ learning_hours: parseFloat(e.target.value) || 0 })
                    }
                    className="w-16 px-2 py-1 text-center font-bold text-sm rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-stone-800"
                  />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    ঘণ্টা
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.25"
                value={dailyLog.learning_hours}
                onChange={(e) => updateDailyLog({ learning_hours: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>

            {/* 4. English communication */}
            <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block">
                    English communication চর্চা
                  </span>
                  <span className="text-xs text-stone-500">স্পিকিং, লিসেনিং বা রাইটিং প্র্যাকটিস</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="4"
                    value={dailyLog.english_hours}
                    onChange={(e) =>
                      updateDailyLog({ english_hours: parseFloat(e.target.value) || 0 })
                    }
                    className="w-16 px-2 py-1 text-center font-bold text-sm rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-stone-800"
                  />
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    ঘণ্টা
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="0.25"
                value={dailyLog.english_hours}
                onChange={(e) => updateDailyLog({ english_hours: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* 5. Client Hunting & Wasted Time & Sleep */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                  Client hunting (মিনিট)
                </span>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="300"
                  value={dailyLog.hunting_minutes}
                  onChange={(e) =>
                    updateDailyLog({ hunting_minutes: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                  নষ্ট / unfocused সময় (মিনিট)
                </span>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="300"
                  value={dailyLog.wasted_minutes}
                  onChange={(e) =>
                    updateDailyLog({ wasted_minutes: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-stone-800 text-sm font-bold text-amber-700"
                />
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-2">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">
                  ঘুমের সময় (ঘণ্টা)
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="14"
                  value={dailyLog.sleep_hours}
                  onChange={(e) =>
                    updateDailyLog({ sleep_hours: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-stone-800 text-sm font-bold text-blue-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: PRAYER ===================== */}
      {activeTab === 'prayer' && (
        <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <MoonStar className="w-5 h-5 text-emerald-600" />
              <span>পাঁচ ওয়াক্ত নামাজের পূর্ণাঙ্গ হিসাব</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              নামাজের স্ট্যাটাস ও জামাত বা একা নির্বাচন করুন।
            </p>
          </div>

          <div className="space-y-3">
            {prayers.map((prayer) => {
              const current = prayerLog[prayer.key];

              return (
                <div
                  key={prayer.key}
                  className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/40 dark:bg-stone-800/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-stone-900 dark:text-stone-100 min-w-[60px]">
                      {prayer.name}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        current.status === 'পড়েছি'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
                      }`}
                    >
                      {current.status} {current.status === 'পড়েছি' && `(${current.type})`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* পড়েছি (জামাতে) */}
                    <button
                      onClick={() => updatePrayerStatus(prayer.key, 'পড়েছি', 'জামাতে')}
                      className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-all ${
                        current.status === 'পড়েছি' && current.type === 'জামাতে'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <Users2 className="w-3.5 h-3.5" />
                      <span>জামাতে</span>
                    </button>

                    {/* পড়েছি (একা) */}
                    <button
                      onClick={() => updatePrayerStatus(prayer.key, 'পড়েছি', 'একা')}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                        current.status === 'পড়েছি' && current.type === 'একা'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      একা
                    </button>

                    {/* কাজা */}
                    <button
                      onClick={() => updatePrayerStatus(prayer.key, 'পড়েছি', 'কাজা')}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                        current.status === 'পড়েছি' && current.type === 'কাজা'
                          ? 'bg-amber-600 text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      কাজা
                    </button>

                    {/* পড়িনি / বাদ */}
                    <button
                      onClick={() => updatePrayerStatus(prayer.key, 'পড়িনি', 'বাদ')}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                        current.status === 'পড়িনি'
                          ? 'bg-stone-600 text-white font-bold'
                          : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      পড়িনি
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              নামাজ ও ইবাদত সংক্রান্ত নোট (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: মসজিদে সময়মতো ফজর পেয়েছি, আলহামদুলিল্লাহ..."
              value={prayerLog.notes || ''}
              onChange={(e) => updatePrayerNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* ===================== TAB 3: WELLBEING ===================== */}
      {activeTab === 'wellbeing' && (
        <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-150">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-600" />
              <span>দৈনিক সুস্থতা ও আত্মদর্শন</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              মানসিক অবস্থা, শারীরিক শক্তি এবং ইতিবাচক মনোভাব রেকর্ড রাখুন
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Mood selector */}
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                আজকের মানসিক অবস্থা (Mood)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'ভালো', icon: Smile, color: 'text-emerald-600' },
                  { value: 'মাঝারি', icon: Meh, color: 'text-amber-600' },
                  { value: 'খারাপ', icon: Frown, color: 'text-rose-600' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = dailyLog.mood === m.value;

                  return (
                    <button
                      key={m.value}
                      onClick={() => updateDailyLog({ mood: m.value as Mood })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-1 ${m.color}`} />
                      <span className="text-xs">{m.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy Level (1 to 5) */}
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                শারীরিক শক্তির মাত্রা (Energy 1-5): {toBanglaNumber(dailyLog.energy_level)}
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => updateDailyLog({ energy_level: lvl })}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${
                      dailyLog.energy_level === lvl
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {toBanglaNumber(lvl)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Minutes */}
          <div className="p-4 rounded-2xl bg-stone-50/50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                শরীরচর্চা / হাঁটার সময় (মিনিট): {toBanglaNumber(dailyLog.exercise_minutes)} মিনিট
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={dailyLog.exercise_minutes}
              onChange={(e) => updateDailyLog({ exercise_minutes: Number(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Reflections */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                আজকের সবচেয়ে ভালো কাজ কী ছিল?
              </label>
              <textarea
                rows={2}
                placeholder="আজকের এমন একটি কাজ যা তোমাকে তৃপ্তি দিয়েছে..."
                value={dailyLog.best_thing_today || ''}
                onChange={(e) => updateDailyLog({ best_thing_today: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                আগামীকালের সংকল্প (Tomorrow Intention)
              </label>
              <textarea
                rows={2}
                placeholder="আগামীকাল কোন কাজটি সবার আগে শেষ করতে চাও..."
                value={dailyLog.tomorrow_intention || ''}
                onChange={(e) => updateDailyLog({ tomorrow_intention: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: URGE & RELAPSE (COMPASSIONATE & SHAME-FREE) ===================== */}
      {activeTab === 'urge' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Compassionate Statement Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-100 to-emerald-50/50 dark:from-stone-900 dark:to-emerald-950/30 border border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>লজ্জাহীন, বাস্তবমুখী ও নিরাপদ আত্ম-পর্যবেক্ষণ</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              উত্থান-পতন প্রতিটি মানুষের যাত্রার স্বাভাবিক অংশ। এখানে কোনো বিচার বা লজ্জা নেই।
              সততার সাথে ট্র্যাক করা তোমাকে নিজের ট্রিগার চিনতে এবং দীর্ঘমেয়াদে মুক্ত থাকতে সাহায্য করে।
            </p>
          </div>

          {/* URGE LOGGING */}
          <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              ১. আজ কোনো Urge (প্রবল আকর্ষণ/তাড়না) অনুভূত হয়েছিল?
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUrgeOccurred('yes')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  urgeOccurred === 'yes'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200'
                }`}
              >
                হ্যাঁ, হয়েছিল
              </button>
              <button
                type="button"
                onClick={() => setUrgeOccurred('no')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  urgeOccurred === 'no'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200'
                }`}
              >
                না, হয়নি (আলহামদুলিল্লাহ)
              </button>
            </div>

            {urgeOccurred === 'yes' && (
              <form onSubmit={handleUrgeSubmit} className="space-y-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      তীব্রতা (Intensity 1-5): {toBanglaNumber(urgeIntensity)}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={urgeIntensity}
                      onChange={(e) => setUrgeIntensity(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      মূল ট্রিগার (Trigger)
                    </label>
                    <select
                      value={urgeTrigger}
                      onChange={(e) => setUrgeTrigger(e.target.value as TriggerType)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                    >
                      <option value="একা থাকা">একা থাকা</option>
                      <option value="boredom">বোরডম / অলস সময়</option>
                      <option value="stress">মানসিক চাপ / স্ট্রেস</option>
                      <option value="রাত জাগা">দেরিতে রাত জাগা</option>
                      <option value="social media">সোশ্যাল মিডিয়া স্ক্রলিং</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      সময় (যেমন: রাত ১১:৩০)
                    </label>
                    <input
                      type="text"
                      placeholder="রাত ১১:৩০"
                      value={urgeTime}
                      onChange={(e) => setUrgeTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    কী পদক্ষেপ নিয়ে সামাল দিয়েছো?
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ফোন অন্য ঘরে রেখে পানি খেয়েছি ও ওযু করেছি..."
                    value={urgeRecovery}
                    onChange={(e) => setUrgeRecovery(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                >
                  Urge রেকর্ড সংরক্ষণ করুন
                </button>

                {urgeSavedSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold">
                    ✓ চমৎকার! Urge সুন্দরভাবে নিয়ন্ত্রণ করে রেকর্ড করা হয়েছে।
                  </p>
                )}
              </form>
            )}
          </div>

          {/* RELAPSE LOGGING (SHAME-FREE) */}
          <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              ২. কোনো কারণে কি স্লিপ বা রিল্যাপ্স হয়েছিল?
            </h3>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRelapseOccurred('no')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  relapseOccurred === 'no'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200'
                }`}
              >
                না, আমি সম্পূর্ণ সুরক্ষিত (Clean)
              </button>
              <button
                type="button"
                onClick={() => setRelapseOccurred('yes')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  relapseOccurred === 'yes'
                    ? 'bg-stone-700 text-white border-stone-700 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200'
                }`}
              >
                হ্যাঁ, হয়েছিল
              </button>
            </div>

            {relapseOccurred === 'yes' && (
              <div className="space-y-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                {/* Compassionate encouragement box (Mandatory instruction) */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed font-medium">
                  &ldquo;আজকের দিন শেষ নয়। এখন শুধু পরের ছোট সঠিক কাজটি বেছে নাও। পানি খাও, ওযু করো বা ১০ মিনিট হাঁটো, তারপর একটি ছোট কাজ শুরু করো।&rdquo;
                </div>

                <form onSubmit={handleRelapseSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        নষ্ট হওয়া সময় (মিনিট)
                      </label>
                      <input
                        type="number"
                        min="5"
                        value={timeLostMins}
                        onChange={(e) => setTimeLostMins(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        কী কারণে ট্রিগার হয়েছিল?
                      </label>
                      <select
                        value={relapseTrigger}
                        onChange={(e) => setRelapseTrigger(e.target.value as TriggerType)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                      >
                        <option value="একা থাকা">একা থাকা</option>
                        <option value="boredom">বোরডম / অলস সময়</option>
                        <option value="stress">মানসিক চাপ</option>
                        <option value="রাত জাগা">দেরিতে রাত জাগা</option>
                        <option value="social media">সোশ্যাল মিডিয়া স্ক্রলিং</option>
                        <option value="অন্যান্য">অন্যান্য</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      এখন রিকভারির জন্য কী অ্যাকশন নিলে?
                    </label>
                    <input
                      type="text"
                      placeholder="পানি খেয়েছি, ওযু করেছি এবং টেবিলে ফিরে এসেছি..."
                      value={relapseRecovery}
                      onChange={(e) => setRelapseRecovery(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs"
                  >
                    লগ সংরক্ষণ করে আবার কাজে ফিরুন
                  </button>

                  {relapseSavedSuccess && (
                    <p className="text-xs text-emerald-600 font-semibold">
                      ✓ তথ্য সংরক্ষিত হয়েছে। অতীত ফেলে এখন সামনের কাজে মন দাও!
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
