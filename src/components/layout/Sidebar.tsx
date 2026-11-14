'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CheckSquare,
  Users,
  Activity,
  DollarSign,
  BarChart3,
  ShieldAlert,
  Settings,
  Flame,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { toBanglaNumber } from '@/lib/utils/bangla';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { tasks, settings } = useData();

  // Pending tasks count
  const pendingCount = tasks.filter((t) => t.status !== 'সম্পন্ন').length;

  const navItems = [
    { label: 'আজ', href: '/', icon: CalendarDays },
    { label: 'কাজসমূহ', href: '/tasks', icon: CheckSquare, badge: pendingCount > 0 ? toBanglaNumber(pendingCount) : undefined },
    { label: 'ক্লায়েন্ট', href: '/clients', icon: Users },
    { label: 'ট্র্যাকার', href: '/tracker', icon: Activity },
    { label: 'আয় ও হান্টিং', href: '/revenue', icon: DollarSign },
    { label: 'রিপোর্ট', href: '/reports', icon: BarChart3 },
    {
      label: 'urge সহায়তা',
      href: '/urge-help',
      icon: ShieldAlert,
      isEmergency: true,
    },
    { label: 'সেটিংস', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-stone-200/80 dark:border-stone-800/80 bg-white/70 dark:bg-[#1a1917]/70 backdrop-blur-md p-4 sticky top-16 h-[calc(100vh-4rem)]">
      {/* Navigation list */}
      <nav className="flex-1 space-y-1.5 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isEmergency) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mt-4 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span>{item.label}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs border border-emerald-200/60 dark:border-emerald-800/50'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Motivational / Discipline Card */}
      <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800/80">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-50 to-emerald-50/40 dark:from-stone-900 dark:to-emerald-950/20 border border-stone-200/80 dark:border-stone-800/80">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>আজকের ডিসিপ্লিন মন্ত্র</span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            &ldquo;অনুপ্রেরণা সাময়িক, ডিসিপ্লিন স্থায়ী। ছোট ছোট কাজের ধারাবাহিকতাই আসল জয়।&rdquo;
          </p>
          <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-xs text-stone-500">
            <span>{settings.profile_name}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">ইনশাআল্লাহ</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
