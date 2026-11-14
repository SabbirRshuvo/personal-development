'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Priority, TaskStatus, Client, Task } from '@/lib/types/database';
import { Trash2, RotateCcw, Calendar, CheckSquare, Clock } from 'lucide-react';
import { formatBanglaDate, toBanglaNumber, getTodayDateString } from '@/lib/utils/bangla';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  clients: Client[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onRescheduleForToday: (id: string) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  clients,
  onUpdateTask,
  onDeleteTask,
  onRescheduleForToday,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('সাধারণ');
  const [status, setStatus] = useState<TaskStatus>('বাকি');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [dueDate, setDueDate] = useState('');
  const [blockerNotes, setBlockerNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setClientId(task.client_id || '');
      setPriority(task.priority);
      setStatus(task.status);
      setEstimatedMinutes(task.estimated_minutes || 30);
      setDueDate(task.due_date);
      setBlockerNotes(task.blocker_notes || '');
      setTagsInput((task.tags || []).join(', '));
    }
  }, [task]);

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const selectedClient = clients.find((c) => c.id === clientId);

    await onUpdateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      client_id: clientId || null,
      client_name: selectedClient ? selectedClient.name : undefined,
      priority,
      status,
      estimated_minutes: Number(estimatedMinutes) || 30,
      due_date: dueDate,
      blocker_notes: blockerNotes.trim(),
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('আপনি কি নিশ্চিত যে এই কাজটি মুছে ফেলতে চান?')) {
      await onDeleteTask(task.id);
      onClose();
    }
  };

  const handleReschedule = async () => {
    await onRescheduleForToday(task.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="কাজের বিবরণ ও সম্পাদনা" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Carry-forward info notice */}
        {task.is_carried_forward && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <span>
              এই কাজটি পূর্ববর্তী দিন থেকে স্বয়ংক্রিয়ভাবে আজ যুক্ত হয়েছে (
              {toBanglaNumber(task.carried_forward_count)} বার রিসিডিউল করা হয়েছে)।
            </span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            কাজের শিরোনাম *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              স্ট্যাটাস
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="বাকি">বাকি</option>
              <option value="চলছে">চলছে</option>
              <option value="সম্পন্ন">সম্পন্ন</option>
              <option value="আ আটকে আছে">আটকে আছে</option>
            </select>
          </div>

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
              সময় (মিনিট)
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              নির্ধারিত তারিখ (Due Date)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              ক্লায়েন্ট / প্রজেক্ট
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">ব্যক্তিগত কাজ</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.project_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            কাজের বিবরণ
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Blockers Note */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            আটকে থাকার কারণ বা বাধা (Blocker notes)
          </label>
          <input
            type="text"
            placeholder="যেমন: ক্লায়েন্টের ফিডব্যাকের অপেক্ষায় আছি..."
            value={blockerNotes}
            onChange={(e) => setBlockerNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReschedule}
              className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>আজকের জন্য পুনরায় নির্ধারণ</span>
            </button>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              বাতিল
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'সংরক্ষণ...' : 'পরিবর্তন সংরক্ষণ'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
