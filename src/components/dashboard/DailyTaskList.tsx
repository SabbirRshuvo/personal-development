'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { Task, Priority } from '@/lib/types/database';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { toBanglaNumber, getRelativeBanglaDate } from '@/lib/utils/bangla';
import confetti from 'canvas-confetti';

interface DailyTaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onRescheduleForToday: (id: string) => void;
  onOpenAddTask: () => void;
  onOpenEditTask: (task: Task) => void;
}

export const DailyTaskList: React.FC<DailyTaskListProps> = ({
  tasks,
  onToggleComplete,
  onRescheduleForToday,
  onOpenAddTask,
  onOpenEditTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'carried'>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status !== 'সম্পন্ন';
    if (filter === 'completed') return task.status === 'সম্পন্ন';
    if (filter === 'carried') return task.is_carried_forward;
    return true;
  });

  // Group by priority
  const priorities: Priority[] = ['জরুরি', 'গুরুত্বপূর্ণ', 'সাধারণ'];

  const handleToggle = (task: Task) => {
    if (task.status !== 'সম্পন্ন') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#059669', '#10b981', '#34d399'],
        });
      } catch {
        // ignore
      }
    }
    onToggleComplete(task.id);
  };

  return (
    <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div>
          <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            আজকের কাজের তালিকা
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            অগ্রাধিকার অনুযায়ী সাজানো প্রতিদিনের অ্যাকশন লিস্ট
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter buttons */}
          <div className="flex p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              সব ({toBanglaNumber(tasks.length)})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              বাকি ({toBanglaNumber(tasks.filter((t) => t.status !== 'সম্পন্ন').length)})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              সম্পন্ন ({toBanglaNumber(tasks.filter((t) => t.status === 'সম্পন্ন').length)})
            </button>
            <button
              onClick={() => setFilter('carried')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'carried'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              আগের বাকি ({toBanglaNumber(tasks.filter((t) => t.is_carried_forward).length)})
            </button>
          </div>

          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">কাজ যোগ করুন</span>
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl space-y-3">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            {tasks.length === 0
              ? 'এখনো কোনো কাজ নেই। প্রথম কাজটি যোগ করো।'
              : 'এই ফিল্টারে কোনো কাজ নেই'}
          </p>
          <button
            onClick={onOpenAddTask}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>কাজ যোগ করুন</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {priorities.map((priority) => {
            const groupTasks = filteredTasks.filter((t) => t.priority === priority);
            if (groupTasks.length === 0) return null;

            return (
              <div key={priority} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 px-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        priority === 'জরুরি'
                          ? 'bg-rose-500'
                          : priority === 'গুরুত্বপূর্ণ'
                          ? 'bg-amber-500'
                          : 'bg-stone-400'
                      }`}
                    />
                    <span>{priority} কাজ</span>
                    <span className="text-[11px] font-normal">
                      ({toBanglaNumber(groupTasks.length)})
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {groupTasks.map((task) => {
                    const isDone = task.status === 'সম্পন্ন';

                    return (
                      <div
                        key={task.id}
                        className={`group flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-stone-50/60 dark:bg-stone-900/30 border-stone-200/50 dark:border-stone-800/50 opacity-70'
                            : 'bg-white dark:bg-[#1f1e1b] border-stone-200/80 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs'
                        }`}
                      >
                        {/* Left: Checkbox & Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggle(task)}
                            className="pt-0.5 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pop-check" />
                            ) : (
                              <Circle className="w-5 h-5 hover:border-emerald-500 transition-all" />
                            )}
                          </button>

                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => onOpenEditTask(task)}
                          >
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <PriorityBadge priority={task.priority} />
                              <StatusBadge status={task.status} />

                              {task.is_carried_forward && (
                                <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <RotateCcw className="w-2.5 h-2.5" />
                                  আগের বাকি কাজ{' '}
                                  {task.carried_forward_count > 1 &&
                                    `(${toBanglaNumber(task.carried_forward_count)} বার)`}
                                </span>
                              )}

                              {task.client_name && (
                                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                                  {task.client_name}
                                </span>
                              )}
                            </div>

                            <h4
                              className={`text-sm font-semibold leading-relaxed ${
                                isDone
                                  ? 'line-through text-stone-400 dark:text-stone-500'
                                  : 'text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                              }`}
                            >
                              {task.title}
                            </h4>

                            {task.description && (
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions, time, date */}
                        <div className="flex items-center gap-2 shrink-0 self-center">
                          <div className="hidden sm:flex flex-col items-end text-right">
                            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {toBanglaNumber(task.estimated_minutes)} মি.
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {getRelativeBanglaDate(task.due_date)}
                            </span>
                          </div>

                          {/* Quick reschedule button for postponed tasks */}
                          {!isDone && (
                            <button
                              onClick={() => onRescheduleForToday(task.id)}
                              title="আজকের জন্য পুনরায় নির্ধারণ করুন"
                              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
