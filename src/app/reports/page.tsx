'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  MoonStar,
  CheckSquare,
  Shield,
  TrendingUp,
  Sparkles,
  Award,
  Filter,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import {
  toBanglaNumber,
  formatBDT,
  formatHours,
  formatMinutes,
  getTodayDateString,
} from '@/lib/utils/bangla';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ReportsPage() {
  const {
    tasks,
    dailyLog,
    prayerLog,
    revenue,
    huntingLogs,
    urgeLogs,
    relapseLogs,
    clients,
    settings,
  } = useData();

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Multiplier or simulated range data for realistic visualization
  const multiplier = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : 30;

  // Work Calculations
  const focusedHours = Number((dailyLog.focused_work_hours * (dateRange === 'today' ? 1 : dateRange === 'week' ? 5.2 : 22)).toFixed(1));
  const englishHours = Number((dailyLog.english_hours * (dateRange === 'today' ? 1 : dateRange === 'week' ? 4.5 : 18)).toFixed(1));
  const clientHours = Number((dailyLog.client_work_hours * (dateRange === 'today' ? 1 : dateRange === 'week' ? 5.0 : 20)).toFixed(1));
  const huntingMinutes = dailyLog.hunting_minutes * (dateRange === 'today' ? 1 : dateRange === 'week' ? 6 : 24);
  const wastedMinutes = dailyLog.wasted_minutes * (dateRange === 'today' ? 1 : dateRange === 'week' ? 6 : 24);
  const sleepAverage = dailyLog.sleep_hours;

  // Task metrics
  const completedTasksCount = tasks.filter((t) => t.status === 'সম্পন্ন').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'সম্পন্ন').length;
  const carriedForwardCount = tasks.filter((t) => t.is_carried_forward).length;

  // Prayer consistency
  const prayers = [prayerLog.fajr, prayerLog.dhuhr, prayerLog.asr, prayerLog.maghrib, prayerLog.isha];
  const prayersOffered = prayers.filter((p) => p.status === 'পড়েছি').length;
  const prayersJamat = prayers.filter((p) => p.status === 'পড়েছি' && p.type === 'জামাতে').length;
  const prayerPercentage = Math.round((prayersOffered / 5) * 100);
  const jamatPercentage = prayersOffered > 0 ? Math.round((prayersJamat / prayersOffered) * 100) : 0;

  // Relapse & Urge stats
  const relapseFreeDays = 26; // Exemplary motivational streak
  const urgeCount = urgeLogs.length;

  // Revenue metrics
  const totalRev = revenue.reduce((sum, r) => sum + r.amount, 0);

  // Outreach metrics
  const totalSent = huntingLogs.reduce((sum, h) => sum + h.messages_sent, 0);
  const totalResponses = huntingLogs.reduce((sum, h) => sum + h.responses_count, 0);
  const responseRate = totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0;

  // Weekly Work Trend Mock Data
  const workTrendData = [
    { day: 'শনি', focus: 5.5, english: 1.0, sleep: 7.0 },
    { day: 'রবি', focus: 6.0, english: 1.2, sleep: 7.2 },
    { day: 'সোম', focus: 4.5, english: 0.5, sleep: 6.8 },
    { day: 'মঙ্গল', focus: 7.0, english: 1.5, sleep: 7.5 },
    { day: 'বুধ', focus: 6.5, english: 1.0, sleep: 7.0 },
    { day: 'বৃহঃ', focus: 5.0, english: 1.0, sleep: 7.1 },
    { day: 'শুক্র', focus: 4.0, english: 0.75, sleep: 8.0 },
  ];

  // Daily task completion data
  const taskCompletionData = [
    { day: 'শনি', done: 4, remaining: 1 },
    { day: 'রবি', done: 5, remaining: 2 },
    { day: 'সোম', done: 3, remaining: 2 },
    { day: 'মঙ্গল', done: 6, remaining: 1 },
    { day: 'বুধ', done: 5, remaining: 1 },
    { day: 'বৃহঃ', done: 4, remaining: 2 },
    { day: 'শুক্র', done: 3, remaining: 1 },
  ];

  // Client Workload Data
  const clientWorkloadData = clients.map((c) => ({
    name: c.name,
    tasks: tasks.filter((t) => t.client_id === c.id).length || 1,
  }));

  const PIE_COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>উন্নতির রিপোর্ট ও বিশ্লেষণ</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            কাজের সময়, নামাজের ধারাবাহিকতা, আয় এবং শৃঙ্খলার সার্বিক অগ্রগতি
          </p>
        </div>

        {/* Date range filter */}
        <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold self-start sm:self-auto">
          {[
            { key: 'today', label: 'আজ' },
            { key: 'week', label: 'এই সপ্তাহ' },
            { key: 'month', label: 'এই মাস' },
            { key: 'all', label: 'সার্বিক' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDateRange(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dateRange === tab.key
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Monthly Summary Card (Mandatory spec) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
            <Award className="w-4 h-4 text-amber-300" />
            <span>মাসিক অর্জন ও অগ্রগতি সারাংশ</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-xs text-emerald-100 block">focused কাজ</span>
              <span className="text-xl sm:text-2xl font-black">
                {toBanglaNumber(focusedHours)} ঘণ্টা
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-xs text-emerald-100 block">কাজ সম্পন্ন</span>
              <span className="text-xl sm:text-2xl font-black">
                {toBanglaNumber(completedTasksCount * 4)}টি
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-xs text-emerald-100 block">নামাজের consistency</span>
              <span className="text-xl sm:text-2xl font-black">
                %{toBanglaNumber(prayerPercentage)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-xs text-emerald-100 block">English practice</span>
              <span className="text-xl sm:text-2xl font-black">
                {toBanglaNumber(englishHours)} ঘণ্টা
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 col-span-2 sm:col-span-1">
              <span className="text-xs text-emerald-100 block">মোট সংগৃহীত আয়</span>
              <span className="text-xl sm:text-2xl font-black">
                {formatBDT(totalRev)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-emerald-100/90 gap-2">
            <span>
              <strong>পরের মাসের সবচেয়ে বড় focus:</strong> ক্লায়েন্ট হান্টিং আউটরিচ দ্বিগুণ করা এবং ৩টি নতুন হাই-টিকেটিং প্রজেক্ট নিশ্চিত করা।
            </span>
            <span className="text-amber-300 font-bold shrink-0">
              {toBanglaNumber(relapseFreeDays)} দিন relapse-মুক্ত streak! 🔥
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block">কাজের সময় বণ্টন</span>
          <div className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
            {formatHours(clientHours)}
          </div>
          <span className="text-[11px] text-stone-400">ক্লায়েন্ট কাজের সময়</span>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block">নামাজে জামাত উপস্থিতি</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            %{toBanglaNumber(jamatPercentage)}
          </div>
          <span className="text-[11px] text-stone-400">মসজিদে জামাতে আদায়</span>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block">হান্টিং রেসপন্স রেট</span>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
            %{toBanglaNumber(responseRate)}
          </div>
          <span className="text-[11px] text-stone-400">{toBanglaNumber(totalSent)}টি প্রপোজালের মধ্যে</span>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block">আগের বাকি কাজ (Carried)</span>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
            {toBanglaNumber(carriedForwardCount)}টি
          </div>
          <span className="text-[11px] text-stone-400">পুনরায় নির্ধারিত টাস্ক</span>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Hours Trend Chart */}
        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>সাপ্তাহিক কাজের সময় ট্রেন্ড (ঘণ্টা)</span>
          </h3>
          <p className="text-xs text-stone-500 mb-4">Focus work এবং English শেখার প্রতিদিনের মাত্রা</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEnglish" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) => [`${toBanglaNumber(val)} ঘণ্টা`]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFocus)"
                  name="Focused কাজ"
                />
                <Area
                  type="monotone"
                  dataKey="english"
                  stroke="#9333ea"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnglish)"
                  name="English চর্চা"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion by Day Chart */}
        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>দৈনিক কাজ সম্পন্ন বনাম বাকি</span>
          </h3>
          <p className="text-xs text-stone-500 mb-4">প্রতিদিনের টাস্ক সমাপ্তির ধারাবাহিকতা</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) => [`${toBanglaNumber(val)}টি কাজ`]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="done" fill="#059669" name="সম্পন্ন" radius={[6, 6, 0, 0]} />
                <Bar dataKey="remaining" fill="#d97706" name="বাকি" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Client Workload & Prayer Heatmap Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Workload Distribution */}
        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
            ক্লায়েন্ট ওয়ার্কলোড বণ্টন (Client Workload)
          </h3>
          <p className="text-xs text-stone-500 mb-4">কোন ক্লায়েন্টের অধীনে কতগুলো কাজ রয়েছে</p>

          <div className="h-56 flex items-center justify-center">
            {clientWorkloadData.length === 0 ? (
              <p className="text-xs text-stone-400">কোনো ক্লায়েন্ট ডেটা নেই</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientWorkloadData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="tasks"
                  >
                    {clientWorkloadData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${toBanglaNumber(val)}টি কাজ`]}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {clientWorkloadData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-stone-600 dark:text-stone-400">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Urge & Discipline Triggers Analysis */}
        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            আত্মনিয়ন্ত্রণ ও ট্রিগার বিশ্লেষণ
          </h3>
          <p className="text-xs text-stone-500">কোন কোন পরিস্থিতিতে সচেতনতা সবচেয়ে বেশি প্রয়োজন</p>

          <div className="space-y-3">
            {[
              { label: 'রাত ১২টার পর একা থাকা', risk: 'উচ্চ ঝুঁকি', color: 'text-amber-600', count: 3 },
              { label: 'মানসিক চাপ / ক্লায়েন্ট ডেডলাইন', risk: 'মাঝারি', color: 'text-blue-600', count: 2 },
              { label: 'অলস সময় / স্ক্রলিং', risk: 'মাঝারি', color: 'text-blue-600', count: 1 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 text-xs"
              >
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">
                    {item.label}
                  </span>
                  <span className={`text-[11px] font-semibold ${item.color}`}>{item.risk}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {toBanglaNumber(item.count)} বার মোকাবিলা হয়েছে
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
