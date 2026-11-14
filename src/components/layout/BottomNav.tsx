'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CheckSquare,
  Users,
  Activity,
  MoreHorizontal,
  DollarSign,
  BarChart3,
  ShieldAlert,
  Settings,
  X,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { toBanglaNumber } from '@/lib/utils/bangla';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { tasks } = useData();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const pendingCount = tasks.filter((t) => t.status !== 'সম্পন্ন').length;

  const mainTabs = [
    { label: 'আজ', href: '/', icon: CalendarDays },
    {
      label: 'কাজ',
      href: '/tasks',
      icon: CheckSquare,
      badge: pendingCount > 0 ? toBanglaNumber(pendingCount) : undefined,
    },
    { label: 'ক্লায়েন্ট', href: '/clients', icon: Users },
    { label: 'ট্র্যাকার', href: '/tracker', icon: Activity },
  ];

  const moreItems = [
    { label: 'আয় ও হান্টিং', href: '/revenue', icon: DollarSign, desc: 'ক্লায়েন্ট রেভিনিউ ও আউটরিচ ট্র্যাকার' },
    { label: 'রিপোর্ট', href: '/reports', icon: BarChart3, desc: 'সাপ্তাহিক ও মাসিক অগ্রগতির গ্রাফ' },
    {
      label: 'urge সহায়তা',
      href: '/urge-help',
      icon: ShieldAlert,
      isEmergency: true,
      desc: 'জরুরি ১০ মিনিটের শান্ত কাউন্টডাউন ও সহায়তা',
    },
    { label: 'সেটিংস', href: '/settings', icon: Settings, desc: 'প্রোফাইল, টার্গেট ও ডেটা এক্সপোর্ট' },
  ];

  const isMoreActive = moreItems.some((item) => item.href === pathname);

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181715]/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 pb-[env(safe-area-inset-bottom)] shadow-lg shadow-stone-900/5">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-3 text-[10px] min-w-4 h-4 px-1 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-none tracking-tight">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isMoreActive
                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[11px] leading-none tracking-tight">মেনু</span>
          </button>
        </div>
      </nav>

      {/* Slide-up "More" Drawer for Mobile */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />

          {/* Drawer Content */}
          <div className="relative bg-white dark:bg-[#1c1b18] rounded-t-3xl border-t border-stone-200 dark:border-stone-800 p-5 shadow-2xl max-w-lg mx-auto w-full z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-base text-stone-900 dark:text-stone-100">
                অন্যান্য ফিচার
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all ${
                      item.isEmergency
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200/80 dark:border-rose-900/60'
                        : isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/60 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.isEmergency
                          ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{item.label}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
