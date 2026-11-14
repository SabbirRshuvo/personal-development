'use client';

import React from 'react';
import { Clock, BookOpen, UserSearch, AlertCircle, Moon, Edit3 } from 'lucide-react';
import { DailyLog } from '@/lib/types/database';
import { toBanglaNumber } from '@/lib/utils/bangla';

interface TimeSummaryCardProps {
  dailyLog: DailyLog;
  onOpenQuickLog: () => void;
}

export const TimeSummaryCard: React.FC<TimeSummaryCardProps> = ({
  dailyLog,
  onOpenQuickLog,
}) => {
  const metrics = [
    {
      label: 'focused কাজ',
      value: `${toBanglaNumber(dailyLog.focused_work_hours)} ঘণ্টা`,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-100 dark:border-blue-900/40',
    },
    {
      label: 'English শেখা',
      value: `${toBanglaNumber(dailyLog.english_hours)} ঘণ্টা`,
      icon: BookOpen,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-100 dark:border-purple-900/40',
    },
    {
      label: 'Client hunting',
      value: `${toBanglaNumber(dailyLog.hunting_minutes)} মিনিট`,
      icon: UserSearch,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-100 dark:border-emerald-900/40',
    },
    {
      label: 'নষ্ট সময়',
      value: `${toBanglaNumber(dailyLog.wasted_minutes)} মিনিট`,
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-100 dark:border-amber-900/40',
    },
    {
      label: 'ঘুমের সময়',
      value: `${toBanglaNumber(dailyLog.sleep_hours)} ঘণ্টা`,
      icon: Moon,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-100 dark:border-indigo-900/40',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            আজকের সময় হিসাব
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            আজকের ফোকাস, দক্ষতা এবং বিশ্রামের হিসাব
          </p>
        </div>
        <button
          onClick={onOpenQuickLog}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>আপডেট</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${item.bgColor} ${item.borderColor} flex flex-col justify-between`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
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
