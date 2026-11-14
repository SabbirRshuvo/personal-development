'use client';

import React from 'react';
import { Target, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Task } from '@/lib/types/database';
import { PriorityBadge } from '@/components/ui/Badge';
import { toBanglaNumber } from '@/lib/utils/bangla';
import confetti from 'canvas-confetti';

interface TopThreeCardProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onOpenAddTask: () => void;
}

export const TopThreeCard: React.FC<TopThreeCardProps> = ({
  tasks,
  onToggleComplete,
  onOpenAddTask,
}) => {
  // Select top 3 pending or high-priority tasks
  const topTasks = tasks
    .sort((a, b) => {
      const priorityOrder = { জরুরি: 1, গুরুত্বপূর্ণ: 2, সাধারণ: 3 };
      if (a.status === 'সম্পন্ন' && b.status !== 'সম্পন্ন') return 1;
      if (a.status !== 'সম্পন্ন' && b.status === 'সম্পন্ন') return -1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);

  const handleCheck = (task: Task) => {
    if (task.status !== 'সম্পন্ন') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // ignore if confetti is not available
      }
    }
    onToggleComplete(task.id);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:from-emerald-950/30 dark:via-stone-900/40 dark:to-stone-900/80 rounded-3xl border border-emerald-500/20 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/15 dark:bg-emerald-400/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              আজকের Top ৩
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              আজকের দিনের সবচেয়ে গুরুত্বপূর্ণ তিনটি কাজ
            </p>
          </div>
        </div>
      </div>

      {topTasks.length === 0 ? (
        <div className="text-center py-6 bg-white/60 dark:bg-stone-900/60 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-500 mb-2">আজকের কোনো কাজ যোগ করা হয়নি</p>
          <button
            onClick={onOpenAddTask}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + আজকের কাজ যোগ করুন
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {topTasks.map((task, idx) => {
            const isDone = task.status === 'সম্পন্ন';

            return (
              <div
                key={task.id}
                onClick={() => handleCheck(task)}
                className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer border ${
                  isDone
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 opacity-75'
                    : 'bg-white dark:bg-[#1f1e1b] border-stone-200/80 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs'
                }`}
              >
                {/* Number & Check */}
                <div className="pt-0.5 shrink-0 text-stone-400">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pop-check" />
                  ) : (
                    <Circle className="w-5 h-5 hover:text-emerald-600 transition-colors" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-bold text-stone-400">
                      #{toBanglaNumber(idx + 1)}
                    </span>
                    <PriorityBadge priority={task.priority} />
                    {task.client_name && (
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium truncate max-w-[150px]">
                        • {task.client_name}
                      </span>
                    )}
                    {task.is_carried_forward && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                        আগের বাকি কাজ
                      </span>
                    )}
                  </div>
                  <h4
                    className={`text-sm font-semibold leading-snug line-clamp-2 ${
                      isDone
                        ? 'line-through text-stone-400 dark:text-stone-500'
                        : 'text-stone-800 dark:text-stone-100'
                    }`}
                  >
                    {task.title}
                  </h4>
                </div>

                {/* Estimated minutes */}
                <div className="text-[11px] text-stone-400 flex items-center gap-1 shrink-0 pt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{toBanglaNumber(task.estimated_minutes)} মি.</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
