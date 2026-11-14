'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Briefcase, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { TimeSession, TimeSessionCategory, BreakType } from '@/lib/types/database';

interface AddPastSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSession?: TimeSession | null;
}

const CATEGORIES: { value: TimeSessionCategory; labelBn: string; labelEn: string; color: string }[] = [
  { value: 'Client Work', labelBn: 'ক্লায়েন্টের কাজ (Client Work)', labelEn: 'Client Work', color: 'text-blue-600' },
  { value: 'Deep Focus', labelBn: 'ডিপ ফোকাস (Deep Focus)', labelEn: 'Deep Focus', color: 'text-indigo-600' },
  { value: 'Client Hunting', labelBn: 'ক্লায়েন্ট হান্টিং (Client Hunting)', labelEn: 'Client Hunting', color: 'text-teal-600' },
  { value: 'English Practice', labelBn: 'ইংরেজি প্র্যাকটিস (English Practice)', labelEn: 'English Practice', color: 'text-purple-600' },
  { value: 'Learning/Class', labelBn: 'ক্লাস ও স্কিল শেখা (Learning/Class)', labelEn: 'Learning / Class', color: 'text-emerald-600' },
  { value: 'Admin/Planning', labelBn: 'পরিকল্পনা ও অ্যাডমিন (Admin/Planning)', labelEn: 'Admin / Planning', color: 'text-slate-600' },
  { value: 'Break', labelBn: 'বিরতি (Break)', labelEn: 'Break', color: 'text-amber-600' },
  { value: 'Wasted Time', labelBn: 'নষ্ট সময় (Wasted Time)', labelEn: 'Wasted Time', color: 'text-rose-600' },
  { value: 'Other', labelBn: 'অন্যান্য (Other)', labelEn: 'Other', color: 'text-gray-600' },
];

const BREAK_TYPES: BreakType[] = ['খাবার', 'নামাজ', 'হাঁটা/ব্যায়াম', 'বিশ্রাম', 'পরিবার', 'Social media', 'Other'];

export const AddPastSessionModal: React.FC<AddPastSessionModalProps> = ({
  isOpen,
  onClose,
  editingSession,
}) => {
  const { clients, tasks, addPastSession, updateSession, deleteSession, language, currentDate } = useData();

  const [date, setDate] = useState(currentDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [category, setCategory] = useState<TimeSessionCategory>('Client Work');
  const [clientId, setClientId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [breakType, setBreakType] = useState<BreakType>('বিশ্রাম');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSession) {
      const sDate = new Date(editingSession.started_at);
      const eDate = editingSession.ended_at ? new Date(editingSession.ended_at) : new Date();

      setDate(sDate.toISOString().split('T')[0]);
      setStartTime(sDate.toTimeString().slice(0, 5));
      setEndTime(eDate.toTimeString().slice(0, 5));
      setCategory(editingSession.category);
      setClientId(editingSession.linked_client_id || '');
      setTaskId(editingSession.linked_task_id || '');
      setBreakType(editingSession.break_type || 'বিশ্রাম');
      setNote(editingSession.note || '');
    } else {
      // Default reset
      setDate(currentDate || new Date().toISOString().split('T')[0]);
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      setStartTime(oneHourAgo.toTimeString().slice(0, 5));
      setEndTime(now.toTimeString().slice(0, 5));
      setCategory('Client Work');
      setClientId('');
      setTaskId('');
      setBreakType('বিশ্রাম');
      setNote('');
    }
    setError(null);
  }, [editingSession, isOpen, currentDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const startIso = `${date}T${startTime}:00`;
    const endIso = `${date}T${endTime}:00`;

    const startObj = new Date(startIso);
    const endObj = new Date(endIso);

    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      setError(language === 'bn' ? 'সঠিক সময় নির্বাচন করুন' : 'Please select valid start and end times');
      return;
    }

    if (endObj <= startObj) {
      setError(language === 'bn' ? 'শেষের সময় শুরুর সময়ের পরে হতে হবে' : 'End time must be after start time');
      return;
    }

    const durationSeconds = Math.round((endObj.getTime() - startObj.getTime()) / 1000);

    const clientObj = clients.find((c) => c.id === clientId);
    const taskObj = tasks.find((t) => t.id === taskId);

    if (editingSession) {
      updateSession(editingSession.id, {
        category,
        started_at: startObj.toISOString(),
        ended_at: endObj.toISOString(),
        duration_seconds: durationSeconds,
        client_id: clientId || null,
        client_name: clientObj ? `${clientObj.name} - ${clientObj.project_name}` : undefined,
        linked_client_id: clientId || null,
        linked_client_name: clientObj ? `${clientObj.name} - ${clientObj.project_name}` : undefined,
        task_id: taskId || null,
        task_title: taskObj ? taskObj.title : undefined,
        linked_task_id: taskId || null,
        linked_task_title: taskObj ? taskObj.title : undefined,
        break_type: (category === 'Break' || category === 'break') ? breakType : null,
        note: note.trim() || '',
      });
    } else {
      addPastSession({
        category,
        started_at: startObj.toISOString(),
        ended_at: endObj.toISOString(),
        duration_seconds: durationSeconds,
        client_id: clientId || null,
        client_name: clientObj ? `${clientObj.name} - ${clientObj.project_name}` : undefined,
        linked_client_id: clientId || null,
        linked_client_name: clientObj ? `${clientObj.name} - ${clientObj.project_name}` : undefined,
        task_id: taskId || null,
        task_title: taskObj ? taskObj.title : undefined,
        linked_task_id: taskId || null,
        linked_task_title: taskObj ? taskObj.title : undefined,
        break_type: (category === 'Break' || category === 'break') ? breakType : null,
        title: category,
        note: note.trim() || '',
        status: 'completed',
        is_pomodoro: false,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!editingSession) return;
    if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিত এই সেশনটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this session?')) {
      deleteSession(editingSession.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {editingSession
                ? language === 'bn' ? 'সেশন সংশোধন করুন' : 'Edit Time Session'
                : language === 'bn' ? 'ছুটে যাওয়া সেশন যোগ করুন' : 'Add Missed Time Session'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'অফলাইন কাজের সময় নির্ভুলভাবে হিসাবের মধ্যে রাখুন' : 'Log offline work accurately to your daily timeline'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? 'কাজের ধরণ / ক্যাটাগরি' : 'Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TimeSessionCategory)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {language === 'bn' ? cat.labelBn : cat.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* If break category, show break type */}
          {category === 'Break' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'বিরতির ধরণ' : 'Break Type'}
              </label>
              <select
                value={breakType}
                onChange={(e) => setBreakType(e.target.value as BreakType)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {BREAK_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date, Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'তারিখ' : 'Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'শুরুর সময়' : 'Start Time'}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {language === 'bn' ? 'শেষের সময়' : 'End Time'}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Linked Client */}
          {category !== 'Break' && category !== 'Wasted Time' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'bn' ? 'যুক্ত ক্লায়েন্ট (ঐচ্ছিক)' : 'Linked Client (Optional)'}</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{language === 'bn' ? '-- কোনো ক্লায়েন্ট নেই --' : '-- No Client --'}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.client_name} ({c.project_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Linked Task */}
          {category !== 'Break' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'bn' ? 'যুক্ত টাস্ক / কাজ (ঐচ্ছিক)' : 'Linked Task (Optional)'}</span>
              </label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{language === 'bn' ? '-- কোনো কাজ যুক্ত নেই --' : '-- No Task --'}</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} {t.status === 'সম্পন্ন' ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? 'নোট / বিবরণ (ঐচ্ছিক)' : 'Notes / Description (Optional)'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'bn' ? 'কী কাজ হয়েছে, কোনো অগ্রগতি বা পর্যবেক্ষণ...' : 'Notes, accomplishments, etc...'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            {editingSession ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                {editingSession ? (
                  <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{language === 'bn' ? 'যোগ করুন' : 'Add Session'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
