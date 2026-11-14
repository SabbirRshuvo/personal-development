'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Priority, TaskStatus, Client, DailyLog, Task } from '@/lib/types/database';
import { toBanglaNumber, getTodayDateString } from '@/lib/utils/bangla';

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onAddTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<any>;
}

export const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({
  isOpen,
  onClose,
  clients,
  onAddTask,
}) => {
  const [todayStr, setTodayStr] = useState('2026-11-14');
  React.useEffect(() => {
    setTodayStr(getTodayDateString());
  }, []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('জরুরি');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [dueDate, setDueDate] = useState(todayStr);
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const selectedClient = clients.find((c) => c.id === clientId);

    await onAddTask({
      title: title.trim(),
      description: description.trim(),
      client_id: clientId || null,
      client_name: selectedClient ? selectedClient.name : undefined,
      priority,
      status: 'বাকি',
      estimated_minutes: Number(estimatedMinutes) || 30,
      due_date: dueDate || todayStr,
      created_date: todayStr,
      completed_at: null,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      blocker_notes: '',
      is_carried_forward: false,
      carried_forward_count: 0,
      original_due_date: dueDate || todayStr,
      display_order: 1,
    });

    setTitle('');
    setDescription('');
    setClientId('');
    setPriority('জরুরি');
    setEstimatedMinutes(45);
    setTagsInput('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="আজকের কাজ যোগ করুন">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            কাজের শিরোনাম *
          </label>
          <input
            type="text"
            required
            placeholder="যেমন: পেমেন্ট এপিআই টেস্ট ও ভ্যালিডেশন"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              অগ্রাধিকার
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="জরুরি">জরুরি</option>
              <option value="গুরুত্বপূর্ণ">গুরুত্বপূর্ণ</option>
              <option value="সাধারণ">সাধারণ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              আনুমানিক সময় (মিনিট)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            সংশ্লিষ্ট ক্লায়েন্ট / প্রজেক্ট (ঐচ্ছিক)
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">কোনো ক্লায়েন্ট যুক্ত নেই (ব্যক্তিগত কাজ)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.project_name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
          </label>
          <textarea
            rows={2}
            placeholder="কাজের বিশেষ কোনো নির্দেশনা বা চেকলিস্ট..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'যোগ হচ্ছে...' : 'কাজটি সংরক্ষণ করুন'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLog: DailyLog;
  onUpdateDailyLog: (updates: Partial<DailyLog>) => Promise<void>;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  dailyLog,
  onUpdateDailyLog,
}) => {
  const [focusedWork, setFocusedWork] = useState(dailyLog.focused_work_hours);
  const [englishHours, setEnglishHours] = useState(dailyLog.english_hours);
  const [huntingMins, setHuntingMins] = useState(dailyLog.hunting_minutes);
  const [wastedMins, setWastedMins] = useState(dailyLog.wasted_minutes);
  const [sleepHours, setSleepHours] = useState(dailyLog.sleep_hours);
  const [exerciseMins, setExerciseMins] = useState(dailyLog.exercise_minutes);
  const [bestThing, setBestThing] = useState(dailyLog.best_thing_today);
  const [tomorrowIntention, setTomorrowIntention] = useState(dailyLog.tomorrow_intention);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onUpdateDailyLog({
      focused_work_hours: Number(focusedWork),
      english_hours: Number(englishHours),
      hunting_minutes: Number(huntingMins),
      wasted_minutes: Number(wastedMins),
      sleep_hours: Number(sleepHours),
      exercise_minutes: Number(exerciseMins),
      best_thing_today: bestThing,
      tomorrow_intention: tomorrowIntention,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="আজকের সময় ও অভ্যাস আপডেট করুন" maxWidth="lg">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Sliders and number inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <div className="flex justify-between text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
              <span>focused কাজ (ঘণ্টা)</span>
              <span>{toBanglaNumber(focusedWork)} ঘণ্টা</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="0.5"
              value={focusedWork}
              onChange={(e) => setFocusedWork(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
            <div className="flex justify-between text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1">
              <span>English শেখার সময় (ঘণ্টা)</span>
              <span>{toBanglaNumber(englishHours)} ঘণ্টা</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.25"
              value={englishHours}
              onChange={(e) => setEnglishHours(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
              <span>Client hunting (মিনিট)</span>
              <span>{toBanglaNumber(huntingMins)} মিনিট</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={huntingMins}
              onChange={(e) => setHuntingMins(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
            <div className="flex justify-between text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
              <span>নষ্ট সময় (মিনিট)</span>
              <span>{toBanglaNumber(wastedMins)} মিনিট</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="5"
              value={wastedMins}
              onChange={(e) => setWastedMins(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
              <span>ঘুমের সময় (ঘণ্টা)</span>
              <span>{toBanglaNumber(sleepHours)} ঘণ্টা</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="p-3 rounded-2xl bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
            <div className="flex justify-between text-xs font-semibold text-stone-800 dark:text-stone-300 mb-1">
              <span>শরীরচর্চা / হাঁটার সময় (মিনিট)</span>
              <span>{toBanglaNumber(exerciseMins)} মিনিট</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={exerciseMins}
              onChange={(e) => setExerciseMins(Number(e.target.value))}
              className="w-full accent-stone-700"
            />
          </div>
        </div>

        {/* Reflection */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            আজকের সবচেয়ে ভালো কাজ কী ছিল?
          </label>
          <input
            type="text"
            placeholder="যেমন: ক্লায়েন্ট ইস্যু দ্রুত সমাধান করেছি..."
            value={bestThing}
            onChange={(e) => setBestThing(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            আগামীকালের মূল সংকল্প / লক্ষ্য
          </label>
          <input
            type="text"
            placeholder="যেমন: সকালে ২ ঘণ্টা ডিপ কোডিং করবো..."
            value={tomorrowIntention}
            onChange={(e) => setTomorrowIntention(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট সম্পন্ন করুন'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
