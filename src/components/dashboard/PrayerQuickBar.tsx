'use client';

import React from 'react';
import { Check, MoonStar, Users2 } from 'lucide-react';
import { PrayerLog, PrayerStatus, PrayerType } from '@/lib/types/database';
import { toBanglaNumber } from '@/lib/utils/bangla';

interface PrayerQuickBarProps {
  prayerLog: PrayerLog;
  onUpdatePrayerStatus: (
    prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    status: PrayerStatus,
    type?: PrayerType
  ) => void;
}

export const PrayerQuickBar: React.FC<PrayerQuickBarProps> = ({
  prayerLog,
  onUpdatePrayerStatus,
}) => {
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

  const completedCount = prayers.filter((p) => prayerLog[p.key].status === 'পড়েছি').length;

  const togglePrayer = (
    key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
    currentStatus: PrayerStatus,
    currentType: PrayerType
  ) => {
    if (currentStatus === 'পড়িনি') {
      // Toggle to পড়েছি (জামাতে)
      onUpdatePrayerStatus(key, 'পড়েছি', 'জামাতে');
    } else if (currentType === 'জামাতে') {
      // Toggle to পড়েছি (একা)
      onUpdatePrayerStatus(key, 'পড়েছি', 'একা');
    } else {
      // Toggle back to পড়িনি
      onUpdatePrayerStatus(key, 'পড়িনি', 'একা');
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <MoonStar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              পাঁচ ওয়াক্ত নামাজ
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              ক্লিক করে স্ট্যাটাস পরিবর্তন করুন (পড়েছি → একা → পড়িনি)
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
          {toBanglaNumber(completedCount)}/৫ ওয়াক্ত আদায়
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {prayers.map((prayer) => {
          const info = prayerLog[prayer.key];
          const isDone = info.status === 'পড়েছি';
          const isJamat = info.type === 'জামাতে';

          return (
            <button
              key={prayer.key}
              onClick={() => togglePrayer(prayer.key, info.status, info.type)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-150 select-none text-center ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                  : 'bg-stone-50/70 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold">{prayer.name}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'border border-stone-300 dark:border-stone-700 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
                {isDone ? (
                  isJamat ? (
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                      <Users2 className="w-3 h-3" /> জামাতে
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">একা</span>
                  )
                ) : (
                  <span className="text-stone-400 dark:text-stone-500">বাকি</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
