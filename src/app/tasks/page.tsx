'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  RotateCcw,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Tag,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Task } from '@/lib/types/database';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { TaskModal } from '@/components/tasks/TaskModal';
import { QuickAddTaskModal } from '@/components/dashboard/QuickActionModals';
import {
  toBanglaNumber,
  formatBanglaDate,
  getRelativeBanglaDate,
  getTodayDateString,
} from '@/lib/utils/bangla';
import confetti from 'canvas-confetti';

export default function TasksPage() {
  const {
    tasks,
    clients,
    addTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    rescheduleTaskForToday,
  } = useData();

  const [todayStr, setTodayStr] = useState('2026-11-14');

  React.useEffect(() => {
    setTodayStr(getTodayDateString());
  }, []);

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'today' | 'pending' | 'completed' | 'overdue' | 'carried'
  >('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchClient = (t.client_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchClient) return false;
    }

    // Client filter
    if (selectedClient !== 'all' && t.client_id !== selectedClient) {
      return false;
    }

    // Priority filter
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
      return false;
    }

    // Status / date filters
    if (activeFilter === 'today') {
      return t.due_date === todayStr;
    }
    if (activeFilter === 'pending') {
      return t.status !== 'সম্পন্ন';
    }
    if (activeFilter === 'completed') {
      return t.status === 'সম্পন্ন';
    }
    if (activeFilter === 'overdue') {
      return t.status !== 'সম্পন্ন' && t.due_date < todayStr;
    }
    if (activeFilter === 'carried') {
      return t.is_carried_forward;
    }

    return true;
  });

  const handleToggle = (task: Task) => {
    if (task.status !== 'সম্পন্ন') {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#059669', '#10b981', '#3b82f6'],
        });
      } catch {}
    }
    toggleTaskComplete(task.id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>কাজসমূহ</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            সব কাজ তৈরি, পরিচালনা, অগ্রগতি পর্যবেক্ষণ ও ফিল্টার করুন
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>নতুন কাজ যোগ করুন</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800/80 p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="কাজের শিরোনাম, ক্লায়েন্ট বা বিবরণ দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          {[
            { key: 'all', label: 'সব কাজ', count: tasks.length },
            {
              key: 'today',
              label: 'আজকের কাজ',
              count: tasks.filter((t) => t.due_date === todayStr).length,
            },
            {
              key: 'pending',
              label: 'বাকি কাজ',
              count: tasks.filter((t) => t.status !== 'সম্পন্ন').length,
            },
            {
              key: 'completed',
              label: 'সম্পন্ন কাজ',
              count: tasks.filter((t) => t.status === 'সম্পন্ন').length,
            },
            {
              key: 'overdue',
              label: 'অতিরিক্ত সময় পার হয়েছে',
              count: tasks.filter((t) => t.status !== 'সম্পন্ন' && t.due_date < todayStr).length,
            },
            {
              key: 'carried',
              label: 'আগের বাকি কাজ',
              count: tasks.filter((t) => t.is_carried_forward).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === tab.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.key
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}
              >
                {toBanglaNumber(tab.count)}
              </span>
            </button>
          ))}
        </div>

        {/* Dropdowns for Client & Priority */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">ক্লায়েন্ট:</span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">সব ক্লায়েন্ট</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">অগ্রাধিকার:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">সব অগ্রাধিকার</option>
              <option value="জরুরি">জরুরি</option>
              <option value="গুরুত্বপূর্ণ">গুরুত্বপূর্ণ</option>
              <option value="সাধারণ">সাধারণ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1a1917] rounded-3xl border border-dashed border-stone-200 dark:border-stone-800">
          <p className="text-stone-500 dark:text-stone-400 text-sm mb-3">
            নির্দিষ্ট ফিল্টারে কোনো কাজ পাওয়া যায়নি
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm"
          >
            + নতুন কাজ যোগ করুন
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'সম্পন্ন';
            const isOverdue = !isDone && task.due_date < todayStr;

            return (
              <div
                key={task.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl border transition-all ${
                  isDone
                    ? 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800/60 opacity-75'
                    : 'bg-white dark:bg-[#1a1917] border-stone-200/80 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs'
                }`}
              >
                {/* Left Section: Checkbox & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(task)}
                    className="pt-1 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pop-check" />
                    ) : (
                      <Circle className="w-5 h-5 hover:border-emerald-500 transition-all" />
                    )}
                  </button>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setEditingTask(task)}
                  >
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />

                      {task.client_name && (
                        <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {task.client_name}
                        </span>
                      )}

                      {task.is_carried_forward && (
                        <span className="text-[11px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          আগের বাকি কাজ ({toBanglaNumber(task.carried_forward_count)} বার)
                        </span>
                      )}

                      {isOverdue && (
                        <span className="text-[11px] bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          সময় পার হয়েছে
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-base font-semibold leading-relaxed ${
                        isDone
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Blocker notes if any */}
                    {task.blocker_notes && (
                      <div className="mt-2 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-xl border border-rose-200/60 flex items-center gap-1.5 inline-flex">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>আটকে আছে: {task.blocker_notes}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {task.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded-lg flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-stone-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section: Time, Date, History */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {toBanglaNumber(task.estimated_minutes)} মিনিট
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {getRelativeBanglaDate(task.due_date)}
                    </span>
                  </div>

                  {/* If completed, show completion date */}
                  {task.completed_at && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      সম্পন্ন: {formatBanglaDate(task.completed_at, false)}
                    </span>
                  )}

                  {/* Reschedule action for postponed task */}
                  {!isDone && (
                    <button
                      onClick={() => rescheduleTaskForToday(task.id)}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>আজকের জন্য নির্ধারণ</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <QuickAddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        clients={clients}
        onAddTask={addTask}
      />

      {/* Edit Task Modal */}
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
