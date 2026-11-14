'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { HuntingLog, OutreachPlatform } from '@/lib/types/database';
import { getTodayDateString } from '@/lib/utils/bangla';

interface HuntingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHuntingLog: (log: Omit<HuntingLog, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
}

export const HuntingModal: React.FC<HuntingModalProps> = ({
  isOpen,
  onClose,
  onAddHuntingLog,
}) => {
  const todayStr = getTodayDateString();
  const [platform, setPlatform] = useState<OutreachPlatform>('LinkedIn');
  const [messagesSent, setMessagesSent] = useState(5);
  const [responsesCount, setResponsesCount] = useState(1);
  const [callsCount, setCallsCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(1);
  const [clientsClosed, setClientsClosed] = useState(0);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(todayStr);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await onAddHuntingLog({
      date,
      platform,
      messages_sent: Number(messagesSent) || 0,
      responses_count: Number(responsesCount) || 0,
      calls_count: Number(callsCount) || 0,
      leads_count: Number(leadsCount) || 0,
      clients_closed: Number(clientsClosed) || 0,
      notes: notes.trim(),
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ক্লায়েন্ট হান্টিং ও আউটরিচ লগ" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              প্ল্যাটফর্ম
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as OutreachPlatform)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="Upwork">Upwork</option>
              <option value="Facebook">Facebook গ্রুপ / পেজ</option>
              <option value="রেফারেল">রেফারেল (Referral)</option>
              <option value="অন্যান্য">অন্যান্য মাধ্যম</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              তারিখ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              প্রপোজাল / মেসেজ পাঠানো
            </label>
            <input
              type="number"
              min="0"
              value={messagesSent}
              onChange={(e) => setMessagesSent(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              রেসপন্স পেয়েছি
            </label>
            <input
              type="number"
              min="0"
              value={responsesCount}
              onChange={(e) => setResponsesCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold text-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              কল বা মিটিং শিডিউল
            </label>
            <input
              type="number"
              min="0"
              value={callsCount}
              onChange={(e) => setCallsCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold text-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              আগ্রহী লিড (Leads)
            </label>
            <input
              type="number"
              min="0"
              value={leadsCount}
              onChange={(e) => setLeadsCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold text-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              ক্লায়েন্ট কনভার্ট (Closed)
            </label>
            <input
              type="number"
              min="0"
              value={clientsClosed}
              onChange={(e) => setClientsClosed(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold text-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            আউটরিচ অভিজ্ঞতা বা নোট
          </label>
          <input
            type="text"
            placeholder="কেমন রেসপন্স এলো, কোন অ্যাপ্রোচ কাজে লাগলো..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'সংরক্ষণ...' : 'হান্টিং লগ সংরক্ষণ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
