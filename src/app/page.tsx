'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Clock,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { TopThreeCard } from '@/components/dashboard/TopThreeCard';
import { TimeSummaryCard } from '@/components/dashboard/TimeSummaryCard';
import { PrayerQuickBar } from '@/components/dashboard/PrayerQuickBar';
import { DailyTaskList } from '@/components/dashboard/DailyTaskList';
import {
  QuickAddTaskModal,
  QuickLogModal,
} from '@/components/dashboard/QuickActionModals';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Task } from '@/lib/types/database';
import { formatBanglaDate, getTodayDateString, toBanglaNumber } from '@/lib/utils/bangla';

export default function TodayDashboardPage() {
  const {
    tasks,
    clients,
    dailyLog,
    prayerLog,
    settings,
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    rescheduleTaskForToday,
    updateDailyLog,
    updatePrayerStatus,
  } = useData();

  const [todayStr, setTodayStr] = useState('2026-11-14');
  const [formattedDate, setFormattedDate] = useState('১৪ নভেম্বর ২০২৬, শনিবার');

  React.useEffect(() => {
    const td = getTodayDateString();
    setTodayStr(td);
    setFormattedDate(formatBanglaDate(td, true));
  }, []);

  // Filter tasks for today (tasks whose due_date is today or carried forward)
  const todayTasks = tasks.filter((t) => t.due_date === todayStr || t.is_carried_forward);
  const completedCount = todayTasks.filter((t) => t.status === 'সম্পন্ন').length;
  const totalCount = todayTasks.length;

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* 1. Greeting & Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 dark:from-emerald-950 dark:via-stone-900 dark:to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{formattedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              আসসালামু আলাইকুম, {settings.profile_name}!
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base font-medium max-w-xl">
              আজকের মূল লক্ষ্য কী? ছোট ছোট কাজের নিখুঁত সমাপ্তিই তোমার বড় সাফল্য তৈরি করে।
            </p>

            {/* Quick Action Buttons on Hero */}
            <div className="pt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setIsAddTaskOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>আজকের কাজ যোগ করুন</span>
              </button>

              <button
                onClick={() => setIsQuickLogOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all"
              >
                <Sliders className="w-4 h-4" />
                <span>সময়/অভ্যাস আপডেট করুন</span>
              </button>

              <Link
                href="/urge-help"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-rose-500/80 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-sm"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>urge সহায়তা</span>
              </Link>
            </div>
          </div>

          {/* Progress Ring Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex items-center justify-center shrink-0 self-start md:self-auto">
            <div className="flex items-center gap-4">
              <ProgressRing completed={completedCount} total={totalCount} size={96} strokeWidth={8} />
              <div className="text-left space-y-1">
                <span className="text-xs text-emerald-200 font-medium block">
                  দৈনিক কাজের অগ্রগতি
                </span>
                <span className="text-lg font-bold">
                  {toBanglaNumber(completedCount)} টি শেষ
                </span>
                <span className="text-xs text-emerald-100/80 block">
                  {totalCount > completedCount
                    ? `${toBanglaNumber(totalCount - completedCount)} টি বাকি`
                    : 'সব কাজ শেষ আলহামদুলিল্লাহ!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top 3 Most Important Tasks Card */}
      <TopThreeCard
        tasks={todayTasks}
        onToggleComplete={toggleTaskComplete}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
      />

      {/* 3. Today's Time Summary ("আজকের সময়") */}
      <TimeSummaryCard
        dailyLog={dailyLog}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
      />

      {/* 4. Five Prayers Quick Bar */}
      <PrayerQuickBar
        prayerLog={prayerLog}
        onUpdatePrayerStatus={updatePrayerStatus}
      />

      {/* 5. Daily Task List (Grouped by Priority, Carry-forward badges, reorder) */}
      <DailyTaskList
        tasks={todayTasks}
        onToggleComplete={toggleTaskComplete}
        onRescheduleForToday={rescheduleTaskForToday}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
        onOpenEditTask={(task) => setEditingTask(task)}
      />

      {/* MODALS */}
      <QuickAddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        clients={clients}
        onAddTask={addTask}
      />

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        dailyLog={dailyLog}
        onUpdateDailyLog={updateDailyLog}
      />

      <TaskModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        clients={clients}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onRescheduleForToday={rescheduleTaskForToday}
      />
    </div>
  );
}
