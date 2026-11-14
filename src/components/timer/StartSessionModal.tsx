'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TimeSessionCategory, Client, Task } from '@/lib/types/database';
import { Play, Timer } from 'lucide-react';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  tasks: Task[];
  initialCategory?: TimeSessionCategory;
  onStartSession: (params: {
    category: TimeSessionCategory;
    clientId?: string | null;
    taskId?: string | null;
    title?: string;
    note?: string;
    isPomodoro?: boolean;
    pomodoroFocusMinutes?: number;
    pomodoroBreakMinutes?: number;
  }) => Promise<any>;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  isOpen,
  onClose,
  clients,
  tasks,
  initialCategory = 'deep_focus',
  onStartSession,
}) => {
  const [category, setCategory] = useState<TimeSessionCategory>(initialCategory);
  const [clientId, setClientId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  // Pomodoro options
  const [isPomodoro, setIsPomodoro] = useState(false);
  const [pomodoroPreset, setPomodoroPreset] = useState<'25-5' | '50-10' | '90-15' | 'custom'>('25-5');
  const [customFocusMins, setCustomFocusMins] = useState(25);
  const [customBreakMins, setCustomBreakMins] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  // Filter tasks for selected client
  const availableTasks = taskId
    ? tasks
    : clientId
      ? tasks.filter((t) => t.client_id === clientId && t.status !== 'সম্পন্ন')
      : tasks.filter((t) => t.status !== 'সম্পন্ন');

  const categories: Array<{ id: TimeSessionCategory; name: string }> = [
    { id: 'deep_focus', name: 'ডিপ ফোকাস (Deep Focus)' },
    { id: 'client_work', name: 'ক্লায়েন্ট কাজ (Client Work)' },
    { id: 'client_hunting', name: 'ক্লায়েন্ট হান্টিং (Client Hunting)' },
    { id: 'english_practice', name: 'ইংরেজি চর্চা (English Practice)' },
    { id: 'learning_class', name: 'লার্নিং ও ক্লাস (Learning / Class)' },
    { id: 'admin_planning', name: 'প্ল্যানিং ও অ্যাডমিন (Admin / Planning)' },
    { id: 'other', name: 'অন্যান্য (Other)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let focusM = 25;
    let breakM = 5;
    if (pomodoroPreset === '50-10') {
      focusM = 50;
      breakM = 10;
    } else if (pomodoroPreset === '90-15') {
      focusM = 90;
      breakM = 15;
    } else if (pomodoroPreset === 'custom') {
      focusM = Number(customFocusMins) || 25;
      breakM = Number(customBreakMins) || 5;
    }

    await onStartSession({
      category,
      clientId: clientId || null,
      taskId: taskId || null,
      title: title.trim(),
      note: note.trim(),
      isPomodoro,
      pomodoroFocusMinutes: isPomodoro ? focusM : undefined,
      pomodoroBreakMinutes: isPomodoro ? breakM : undefined,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="নতুন লাইভ সেশন শুরু করুন" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            কাজের ক্যাটাগরি *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TimeSessionCategory)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Linked Client (optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              সংশ্লিষ্ট ক্লায়েন্ট (ঐচ্ছিক)
            </label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setTaskId('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
            >
              <option value="">কোনো ক্লায়েন্ট যুক্ত নেই</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Linked Task (optional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              সংশ্লিষ্ট টাস্ক (ঐচ্ছিক)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
            >
              <option value="">কোনো টাস্ক লিঙ্ক নেই</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title & Short note */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            সেশনের শিরোনাম বা বিশেষ লক্ষ্য
          </label>
          <input
            type="text"
            placeholder="যেমন: এপিআই এন্ডপয়েন্ট তৈরি ও টেস্ট"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            নোট (ঐচ্ছিক)
          </label>
          <input
            type="text"
            placeholder="কাজের বিশেষ নির্দেশনা বা চেকলিস্ট..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
          />
        </div>

        {/* Pomodoro Mode Option (Optional, Not forced) */}
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                পোমোডোরো (Pomodoro) মোড সক্রিয় করুন
              </span>
            </div>
            <input
              type="checkbox"
              checked={isPomodoro}
              onChange={(e) => setIsPomodoro(e.target.checked)}
              className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          {isPomodoro && (
            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 space-y-2 text-xs">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '25-5', label: '২৫ / ৫ মি.' },
                  { id: '50-10', label: '৫০ / ১০ মি.' },
                  { id: '90-15', label: '৯০ / ১৫ মি.' },
                  { id: 'custom', label: 'কাস্টম' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPomodoroPreset(preset.id as any)}
                    className={`py-1.5 rounded-lg border font-semibold transition-all ${pomodoroPreset === preset.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 border-stone-200'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {pomodoroPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">ফোকাস (মি.)</label>
                    <input
                      type="number"
                      min="5"
                      value={customFocusMins}
                      onChange={(e) => setCustomFocusMins(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-stone-200 bg-white dark:bg-stone-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">বিরতি (মি.)</label>
                    <input
                      type="number"
                      min="1"
                      value={customBreakMins}
                      onChange={(e) => setCustomBreakMins(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-stone-200 bg-white dark:bg-stone-800 text-xs font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            <Play className="w-4 h-4 fill-white mr-1" />
            <span>{isSubmitting ? 'শুরু হচ্ছে...' : 'Start now'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

