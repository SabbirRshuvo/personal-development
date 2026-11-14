'use client';

import React from 'react';
import { Clock, BookOpen, UserSearch, AlertCircle, Moon, Coffee, Edit3, Flame } from 'lucide-react';
import { DailyLog } from '@/lib/types/database';
import { toBanglaNumber, toBengaliNumber } from '@/lib/utils/bangla';
import { useData } from '@/context/DataContext';

interface TimeSummaryCardProps {
  dailyLog?: DailyLog | null;
  onOpenQuickLog?: () => void;
}

export const TimeSummaryCard: React.FC<TimeSummaryCardProps> = ({
  dailyLog,
  onOpenQuickLog,
}) => {
  const dataContext = useData();
  const todayTrackedStats = dataContext?.todayTrackedStats;
  const language = (dataContext as any)?.language || 'bn';

  const safeNumber = (val: number | string | undefined | null) => {
    return toBengaliNumber ? toBengaliNumber(val) : toBanglaNumber(val);
  };

  const safeDailyLog = dailyLog || {
    focused_work_hours: 0,
    english_hours: 0,
    hunting_minutes: 0,
    wasted_minutes: 0,
    sleep_hours: 7,
  };

  // Safely extract minutes from either minute fields or seconds fields
  const totalFocusMinutes =
    todayTrackedStats?.totalFocusMinutes ??
    Math.round((todayTrackedStats?.focusedWorkSeconds || 0) / 60);

  const englishMinutes =
    todayTrackedStats?.englishMinutes ??
    Math.round((todayTrackedStats?.englishSeconds || 0) / 60);

  const huntingMinutes =
    todayTrackedStats?.huntingMinutes ??
    Math.round((todayTrackedStats?.huntingSeconds || 0) / 60);

  const breakMinutes =
    todayTrackedStats?.breakMinutes ??
    Math.round((todayTrackedStats?.breakSeconds || 0) / 60);

  const wastedMinutes =
    todayTrackedStats?.wastedMinutes ??
    Math.round((todayTrackedStats?.wastedSeconds || 0) / 60);

  const completedPomodoros =
    todayTrackedStats?.completedPomodoros ??
    todayTrackedStats?.pomodoroSessionsCount ??
    0;

  const formatHoursMinutes = (totalMinutes: number, fallbackHours: number) => {
    const mins = totalMinutes > 0 ? totalMinutes : Math.round((fallbackHours || 0) * 60);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) {
      return language === 'bn'
        ? `${safeNumber(h)} ঘণ্টা ${safeNumber(m)} মি.`
        : `${h}h ${m}m`;
    } else if (h > 0) {
      return language === 'bn' ? `${safeNumber(h)} ঘণ্টা` : `${h}h`;
    } else {
      return language === 'bn' ? `${safeNumber(m)} মিনিট` : `${m}m`;
    }
  };

  const metrics = [
    {
      label: language === 'bn' ? 'focused কাজের সময়' : 'Focused Work',
      value: formatHoursMinutes(totalFocusMinutes, safeDailyLog.focused_work_hours),
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/70 dark:bg-blue-950/40',
      borderColor: 'border-blue-100 dark:border-blue-900/40',
    },
    {
      label: language === 'bn' ? 'English শেখার সময়' : 'English Practice',
      value: formatHoursMinutes(englishMinutes, safeDailyLog.english_hours),
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50/70 dark:bg-purple-950/40',
      borderColor: 'border-purple-100 dark:border-purple-900/40',
    },
    {
      label: language === 'bn' ? 'Client hunting সময়' : 'Client Hunting',
      value: formatHoursMinutes(huntingMinutes, safeDailyLog.hunting_minutes / 60),
      icon: UserSearch,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50/70 dark:bg-teal-950/40',
      borderColor: 'border-teal-100 dark:border-teal-900/40',
    },
    {
      label: language === 'bn' ? 'মোট বিরতি' : 'Break Time',
      value: formatHoursMinutes(breakMinutes, 0),
      icon: Coffee,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/70 dark:bg-amber-950/40',
      borderColor: 'border-amber-100 dark:border-amber-900/40',
    },
    {
      label: language === 'bn' ? 'নষ্ট সময়' : 'Wasted Time',
      value: formatHoursMinutes(wastedMinutes, safeDailyLog.wasted_minutes / 60),
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50/70 dark:bg-rose-950/40',
      borderColor: 'border-rose-100 dark:border-rose-900/40',
    },
    {
      label: language === 'bn' ? 'ঘুমের সময়' : 'Sleep Hours',
      value: language === 'bn'
        ? `${safeNumber(safeDailyLog.sleep_hours)} ঘণ্টা`
        : `${safeDailyLog.sleep_hours}h`,
      icon: Moon,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/70 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-100 dark:border-indigo-900/40',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'আজকের সময় সারসংক্ষেপ' : "Today's Time Summary"}</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {language === 'bn'
              ? 'লাইভ ট্র্যাকার থেকে স্বয়ংক্রিয়ভাবে হিসাবকৃত সময়'
              : 'Automatically calculated from live timer sessions'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completedPomodoros > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>
                {language === 'bn'
                  ? `${safeNumber(completedPomodoros)} পোমোডোরো`
                  : `${completedPomodoros} Pomodoro`}
              </span>
            </div>
          )}

          {onOpenQuickLog && (
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ম্যানুয়াল আপডেট' : 'Manual Log'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${item.bgColor} ${item.borderColor} flex flex-col justify-between`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 truncate">
                  {item.label}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-100">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
