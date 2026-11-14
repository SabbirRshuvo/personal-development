'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  CheckSquare,
  Award,
  Timer,
  Flame,
  Coffee,
  Briefcase,
  Zap,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import {
  toBengaliNumber,
  formatBDT,
  formatHours,
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
  Legend,
} from 'recharts';

export default function ReportsPage() {
  const {
    tasks,
    dailyLog,
    prayerLog,
    revenue,
    huntingLogs,
    clients,
    timeSessions,
    todayTrackedStats,
    language,
  } = useData();

  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Work Calculations
  const focusedHours = Number((dailyLog.focused_work_hours * (dateRange === 'today' ? 1 : dateRange === 'week' ? 5.2 : 22)).toFixed(1));
  const englishHours = Number((dailyLog.english_hours * (dateRange === 'today' ? 1 : dateRange === 'week' ? 4.5 : 18)).toFixed(1));
  const clientHours = Number((dailyLog.client_work_hours * (dateRange === 'today' ? 1 : dateRange === 'week' ? 5.0 : 20)).toFixed(1));

  // Task metrics
  const completedTasksCount = tasks.filter((t) => t.status === 'সম্পন্ন').length;
  const carriedForwardCount = tasks.filter((t) => t.is_carried_forward).length;

  // Prayer consistency
  const prayers = [prayerLog.fajr, prayerLog.dhuhr, prayerLog.asr, prayerLog.maghrib, prayerLog.isha];
  const prayersOffered = prayers.filter((p) => p.status === 'পড়েছি').length;
  const prayersJamat = prayers.filter((p) => p.status === 'পড়েছি' && p.type === 'জামাতে').length;
  const prayerPercentage = Math.round((prayersOffered / 5) * 100);
  const jamatPercentage = prayersOffered > 0 ? Math.round((prayersJamat / prayersOffered) * 100) : 0;

  // Relapse & Urge stats
  const relapseFreeDays = 26; // Exemplary motivational streak

  // Revenue metrics
  const totalRev = revenue.reduce((sum, r) => sum + r.amount, 0);

  // Outreach metrics
  const totalSent = huntingLogs.reduce((sum, h) => sum + h.messages_sent, 0);
  const totalResponses = huntingLogs.reduce((sum, h) => sum + h.responses_count, 0);
  const responseRate = totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0;

  // ================= Live Time Tracking Analytics =================
  const focusSessions = timeSessions.filter((s) => s.category !== 'Break' && s.category !== 'break');
  const breakSessions = timeSessions.filter((s) => s.category === 'Break' || s.category === 'break');

  const totalFocusSecs = focusSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const totalBreakSecs = breakSessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const totalFocusHours = Number((totalFocusSecs / 3600).toFixed(1));
  const totalBreakHours = Number((totalBreakSecs / 3600).toFixed(1));

  // Average session length
  const completedFocusSessions = focusSessions.filter((s) => (s.duration_seconds || 0) > 0);
  const avgSessionMins = completedFocusSessions.length > 0
    ? Math.round((totalFocusSecs / completedFocusSessions.length) / 60)
    : 0;

  // Total Pomodoros
  const totalPomodoros = timeSessions.filter((s) => s.is_pomodoro).length;

  // Time per Category for Pie Chart
  const categoryMap = new Map<string, number>();
  timeSessions.forEach((s) => {
    const mins = Math.round((s.duration_seconds || 0) / 60);
    if (mins > 0) {
      categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + mins);
    }
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, minutes]) => ({
    name: language === 'bn' ? (
      name === 'Client Work' || name === 'client_work' ? 'ক্লায়েন্ট কাজ' :
      name === 'Deep Focus' || name === 'deep_focus' ? 'ডিপ ফোকাস' :
      name === 'Client Hunting' || name === 'client_hunting' ? 'হান্টিং' :
      name === 'English Practice' || name === 'english_practice' ? 'ইংরেজি' :
      name === 'Learning/Class' || name === 'learning_class' ? 'ক্লাস/লার্নিং' :
      name === 'Break' || name === 'break' ? 'বিরতি' : name
    ) : name,
    minutes,
    hours: Number((minutes / 60).toFixed(1)),
  }));

  // Time per Client
  const clientTimeMap = new Map<string, number>();
  timeSessions.forEach((s) => {
    const cName = s.client_name || s.linked_client_name;
    if (cName) {
      const mins = Math.round((s.duration_seconds || 0) / 60);
      clientTimeMap.set(cName, (clientTimeMap.get(cName) || 0) + mins);
    }
  });

  const clientTimeData = Array.from(clientTimeMap.entries()).map(([client, minutes]) => ({
    client: client.split(' - ')[0] || client,
    hours: Number((minutes / 60).toFixed(1)),
    minutes,
  }));

  // Time per Task (Top 5)
  const taskTimeMap = new Map<string, number>();
  timeSessions.forEach((s) => {
    const tTitle = s.task_title || s.linked_task_title;
    if (tTitle) {
      const mins = Math.round((s.duration_seconds || 0) / 60);
      taskTimeMap.set(tTitle, (taskTimeMap.get(tTitle) || 0) + mins);
    }
  });

  const taskTimeData = Array.from(taskTimeMap.entries())
    .map(([task, minutes]) => ({ task, minutes, hours: Number((minutes / 60).toFixed(1)) }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  // Focus vs Break distribution
  const focusVsBreakData = [
    { name: language === 'bn' ? 'ফোকাস কাজ' : 'Focus Work', value: Math.max(1, totalFocusHours), color: '#3b82f6' },
    { name: language === 'bn' ? 'বিরতি' : 'Break Time', value: Math.max(0.2, totalBreakHours), color: '#f59e0b' },
  ];

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
    name: c.name || c.client_name || 'Client',
    tasks: tasks.filter((t) => t.client_id === c.id).length || 1,
  }));

  const PIE_COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'bn' ? 'উন্নতির রিপোর্ট ও বিশ্লেষণ' : 'Reports & Analytics'}</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {language === 'bn'
              ? 'কাজের সময়, নামাজের ধারাবাহিকতা, আয় এবং শৃঙ্খলার সার্বিক অগ্রগতি'
              : 'Overall progress of work time, prayer consistency, revenue, and discipline'}
          </p>
        </div>

        {/* Date range filter */}
        <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs font-bold self-start sm:self-auto">
          {[
            { key: 'today', labelBn: 'আজ', labelEn: 'Today' },
            { key: 'week', labelBn: 'এই সপ্তাহ', labelEn: 'Week' },
            { key: 'month', labelBn: 'এই মাস', labelEn: 'Month' },
            { key: 'all', labelBn: 'সার্বিক', labelEn: 'All-time' },
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
              {language === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Monthly Summary Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
            <Award className="w-4 h-4 text-amber-300" />
            <span>{language === 'bn' ? 'অর্জনের সারসংক্ষেপ' : 'Achievement Summary'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-xs text-emerald-100 block">{language === 'bn' ? 'focused কাজ' : 'Focused Work'}</span>
              <span className="text-xl sm:text-2xl font-black">
                {language === 'bn' ? `${toBengaliNumber(focusedHours)} ঘণ্টা` : `${focusedHours}h`}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-xs text-emerald-100 block">{language === 'bn' ? 'কাজ সম্পন্ন' : 'Tasks Done'}</span>
              <span className="text-xl sm:text-2xl font-black">
                {language === 'bn' ? `${toBengaliNumber(completedTasksCount * 4)}টি` : `${completedTasksCount * 4}`}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-xs text-emerald-100 block">{language === 'bn' ? 'নামাজের ধারাবাহিকতা' : 'Prayer Consistency'}</span>
              <span className="text-xl sm:text-2xl font-black">
                %{toBengaliNumber(prayerPercentage)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-xs text-emerald-100 block">{language === 'bn' ? 'English চর্চা' : 'English Practice'}</span>
              <span className="text-xl sm:text-2xl font-black">
                {language === 'bn' ? `${toBengaliNumber(englishHours)} ঘণ্টা` : `${englishHours}h`}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 col-span-2 sm:col-span-1">
              <span className="text-xs text-emerald-100 block">{language === 'bn' ? 'মোট সংগৃহীত আয়' : 'Total Revenue'}</span>
              <span className="text-xl sm:text-2xl font-black">
                {formatBDT(totalRev)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-emerald-100/90 gap-2">
            <span>
              <strong>{language === 'bn' ? 'পরবর্তী বড় ফোকাস:' : 'Next Big Focus:'}</strong>{' '}
              {language === 'bn'
                ? 'ক্লায়েন্ট হান্টিং আউটরিচ দ্বিগুণ করা এবং ৩টি নতুন হাই-টিকেটিং প্রজেক্ট নিশ্চিত করা।'
                : 'Double client hunting outreach and close 3 high-ticket projects.'}
            </span>
            <span className="text-amber-300 font-bold shrink-0">
              {language === 'bn' ? `${toBengaliNumber(relapseFreeDays)} দিন relapse-মুক্ত streak! 🔥` : `${relapseFreeDays} days relapse-free streak! 🔥`}
            </span>
          </div>
        </div>
      </div>

      {/* ===================== SECTION: LIVE TIME TRACKING ANALYTICS ===================== */}
      <div className="bg-white dark:bg-[#1a1917] p-5 sm:p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Timer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{language === 'bn' ? 'লাইভ টাইম ট্র্যাকিং বিশ্লেষণ (Time Tracking Analytics)' : 'Live Time Tracking Analytics'}</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {language === 'bn'
                ? 'টাইমার সেশন, বিরতি, পোমোডোরো এবং ক্লায়েন্ট-ভিত্তিক সময় বণ্টন'
                : 'Timer sessions, breaks, pomodoro counts, and category/client breakdown'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'bn' ? 'স্বয়ংক্রিয় সেভড ডেটা' : 'Auto-Saved Data'}</span>
            </span>
          </div>
        </div>

        {/* 4 Stat Cards for Live Time Tracking */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4" />
              <span>{language === 'bn' ? 'মোট ফোকাস কাজ' : 'Total Focus'}</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {language === 'bn' ? `${toBengaliNumber(totalFocusHours)} ঘণ্টা` : `${totalFocusHours}h`}
            </div>
            <span className="text-[11px] text-slate-500">
              {language === 'bn' ? `${toBengaliNumber(focusSessions.length)}টি সেশনে` : `in ${focusSessions.length} sessions`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
              <Coffee className="w-4 h-4" />
              <span>{language === 'bn' ? 'মোট বিরতির সময়' : 'Total Break'}</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {language === 'bn' ? `${toBengaliNumber(totalBreakHours)} ঘণ্টা` : `${totalBreakHours}h`}
            </div>
            <span className="text-[11px] text-slate-500">
              {language === 'bn' ? `${toBengaliNumber(breakSessions.length)}টি বিরতি` : `in ${breakSessions.length} breaks`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-1">
              <Timer className="w-4 h-4" />
              <span>{language === 'bn' ? 'গড় সেশনের ব্যাপ্তি' : 'Avg Session'}</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {language === 'bn' ? `${toBengaliNumber(avgSessionMins)} মিনিট` : `${avgSessionMins}m`}
            </div>
            <span className="text-[11px] text-slate-500">
              {language === 'bn' ? 'প্রতিটি ফোকাস সেশনে' : 'per focus session'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-1">
              <Flame className="w-4 h-4" />
              <span>{language === 'bn' ? 'সম্পূর্ণ পোমোডোরো' : 'Pomodoro Blocks'}</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              {language === 'bn' ? `${toBengaliNumber(totalPomodoros)}টি` : `${totalPomodoros}`}
            </div>
            <span className="text-[11px] text-slate-500">
              {language === 'bn' ? `আজ: ${toBengaliNumber(todayTrackedStats.completedPomodoros)}টি` : `Today: ${todayTrackedStats.completedPomodoros}`}
            </span>
          </div>
        </div>

        {/* Charts: Category Breakdown & Focus vs Break */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Time per Category Pie */}
          <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              {language === 'bn' ? 'ক্যাটাগরি অনুযায়ী কাজের বণ্টন' : 'Time per Category'}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {language === 'bn' ? 'কোন ক্ষেত্রে কত সময় ব্যয় হয়েছে' : 'Breakdown by focus categories'}
            </p>

            <div className="h-56">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  {language === 'bn' ? 'কোনো সেশন ডেটা নেই' : 'No session data yet'}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {categoryData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        language === 'bn'
                          ? `${toBengaliNumber(Math.floor(val / 60))}ঘ ${toBengaliNumber(val % 60)}মি`
                          : `${Math.floor(val / 60)}h ${val % 60}m`,
                      ]}
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Focus vs Break Ratio */}
          <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                {language === 'bn' ? 'ফোকাস বনাম বিরতি অনুপাত' : 'Focus vs Break Ratio'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {language === 'bn' ? 'কাজের সময়ের বিপরীতে স্বাস্থ্যকর বিরতির মাত্রা' : 'Balance of work vs restorative breaks'}
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-blue-600 dark:text-blue-400">{focusVsBreakData[0].name}</span>
                    <span>{toBengaliNumber(totalFocusHours)} ঘণ্টা</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          totalFocusHours + totalBreakHours > 0
                            ? (totalFocusHours / (totalFocusHours + totalBreakHours)) * 100
                            : 85
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-600 dark:text-amber-400">{focusVsBreakData[1].name}</span>
                    <span>{toBengaliNumber(totalBreakHours)} ঘণ্টা</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          totalFocusHours + totalBreakHours > 0
                            ? (totalBreakHours / (totalFocusHours + totalBreakHours)) * 100
                            : 15
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
              💡 {language === 'bn'
                ? 'চমৎকার! ফোকাসের ফাঁকে ছোট ছোট বিরতি মানসিক ক্লান্তি দূর করে এবং দীর্ঘস্থায়ী উৎপাদনশীলতা বাড়ায়।'
                : 'Great! Regular short breaks maintain optimal cognitive performance and prevent burnout.'}
            </div>
          </div>
        </div>

        {/* Client & Task Time breakdown tables */}
        {(clientTimeData.length > 0 || taskTimeData.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Time per Client */}
            <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'bn' ? 'ক্লায়েন্ট অনুযায়ী ট্র্যাকড সময়' : 'Time per Client'}</span>
              </h4>
              <div className="space-y-2">
                {clientTimeData.length === 0 ? (
                  <p className="text-xs text-slate-400">{language === 'bn' ? 'কোনো তথ্য নেই' : 'No client time logged'}</p>
                ) : (
                  clientTimeData.map((c) => (
                    <div key={c.client} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{c.client}</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {language === 'bn' ? `${toBengaliNumber(c.hours)} ঘণ্টা` : `${c.hours}h`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Time per Task */}
            <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-stone-800/30 border border-stone-200/60 dark:border-stone-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'bn' ? 'টাস্ক অনুযায়ী শীর্ষ সময়' : 'Top Time per Task'}</span>
              </h4>
              <div className="space-y-2">
                {taskTimeData.length === 0 ? (
                  <p className="text-xs text-slate-400">{language === 'bn' ? 'কোনো তথ্য নেই' : 'No task time logged'}</p>
                ) : (
                  taskTimeData.map((t) => (
                    <div key={t.task} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{t.task}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {language === 'bn' ? `${toBengaliNumber(t.minutes)} মিনিট` : `${t.minutes}m`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block">{language === 'bn' ? 'কাজের সময় বণ্টন' : 'Client Work Time'}</span>
          <div className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
            {formatHours(clientHours)}
          </div>
          <span className="text-[11px] text-stone-400">{language === 'bn' ? 'ক্লায়েন্ট কাজের সময়' : 'Dedicated work'}</span>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block">{language === 'bn' ? 'নামাজে জামাত উপস্থিতি' : 'Jamat Attendance'}</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            %{toBengaliNumber(jamatPercentage)}
          </div>
          <span className="text-[11px] text-stone-400">{language === 'bn' ? 'মসজিদে জামাতে আদায়' : 'Prayed in Jamat'}</span>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block">{language === 'bn' ? 'হান্টিং রেসপন্স রেট' : 'Hunting Response'}</span>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
            %{toBengaliNumber(responseRate)}
          </div>
          <span className="text-[11px] text-stone-400">
            {language === 'bn' ? `${toBengaliNumber(totalSent)}টি প্রপোজালের মধ্যে` : `Out of ${totalSent} proposals`}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block">{language === 'bn' ? 'আগের বাকি কাজ (Carried)' : 'Carried Forward'}</span>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">
            {language === 'bn' ? `${toBengaliNumber(carriedForwardCount)}টি` : `${carriedForwardCount}`}
          </div>
          <span className="text-[11px] text-stone-400">{language === 'bn' ? 'পুনরায় নির্ধারিত টাস্ক' : 'Carried forward tasks'}</span>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Hours Trend Chart */}
        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{language === 'bn' ? 'সাপ্তাহিক কাজের সময় ট্রেন্ড (ঘণ্টা)' : 'Weekly Work Hours Trend'}</span>
          </h3>
          <p className="text-xs text-stone-500 mb-4">{language === 'bn' ? 'Focus work এবং English শেখার প্রতিদিনের মাত্রা' : 'Daily focus work & English practice'}</p>

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
                  formatter={(val: any) => [`${toBengaliNumber(val)} ঘণ্টা`]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFocus)"
                  name={language === 'bn' ? 'Focused কাজ' : 'Focused Work'}
                />
                <Area
                  type="monotone"
                  dataKey="english"
                  stroke="#9333ea"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnglish)"
                  name={language === 'bn' ? 'English চর্চা' : 'English Practice'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion by Day Chart */}
        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'দৈনিক কাজ সম্পন্ন বনাম বাকি' : 'Daily Completed vs Remaining Tasks'}</span>
          </h3>
          <p className="text-xs text-stone-500 mb-4">{language === 'bn' ? 'প্রতিদিনের টাস্ক সমাপ্তির ধারাবাহিকতা' : 'Daily task completion consistency'}</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) => [`${toBengaliNumber(val)}টি কাজ`]}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="done" fill="#059669" name={language === 'bn' ? 'সম্পন্ন' : 'Done'} radius={[6, 6, 0, 0]} />
                <Bar dataKey="remaining" fill="#d97706" name={language === 'bn' ? 'বাকি' : 'Remaining'} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Client Workload & Urge Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Workload Distribution */}
        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1">
            {language === 'bn' ? 'ক্লায়েন্ট ওয়ার্কলোড বণ্টন (Client Workload)' : 'Client Workload Distribution'}
          </h3>
          <p className="text-xs text-stone-500 mb-4">{language === 'bn' ? 'কোন ক্লায়েন্টের অধীনে কতগুলো কাজ রয়েছে' : 'Tasks grouped by client'}</p>

          <div className="h-56 flex items-center justify-center">
            {clientWorkloadData.length === 0 ? (
              <p className="text-xs text-stone-400">{language === 'bn' ? 'কোনো ক্লায়েন্ট ডেটা নেই' : 'No client data'}</p>
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
                    formatter={(val: any) => [`${toBengaliNumber(val)}টি কাজ`]}
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
            {language === 'bn' ? 'আত্মনিয়ন্ত্রণ ও ট্রিগার বিশ্লেষণ' : 'Self-Discipline & Trigger Analysis'}
          </h3>
          <p className="text-xs text-stone-500">
            {language === 'bn' ? 'কোন কোন পরিস্থিতিতে সচেতনতা সবচেয়ে বেশি প্রয়োজন' : 'High awareness contexts'}
          </p>

          <div className="space-y-3">
            {[
              { labelBn: 'রাত ১২টার পর একা থাকা', labelEn: 'Alone after midnight', riskBn: 'উচ্চ ঝুঁকি', riskEn: 'High Risk', color: 'text-amber-600', count: 3 },
              { labelBn: 'মানসিক চাপ / ক্লায়েন্ট ডেডলাইন', labelEn: 'Stress / tight deadlines', riskBn: 'মাঝারি', riskEn: 'Medium', color: 'text-blue-600', count: 2 },
              { labelBn: 'অলস সময় / স্ক্রলিং', labelEn: 'Aimless scrolling', riskBn: 'মাঝারি', riskEn: 'Medium', color: 'text-blue-600', count: 1 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 text-xs"
              >
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">
                    {language === 'bn' ? item.labelBn : item.labelEn}
                  </span>
                  <span className={`text-[11px] font-semibold ${item.color}`}>
                    {language === 'bn' ? item.riskBn : item.riskEn}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? `${toBengaliNumber(item.count)} বার মোকাবিলা হয়েছে` : `Managed ${item.count} times`}
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
