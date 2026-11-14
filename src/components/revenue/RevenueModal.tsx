'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Client, PaymentType, RevenueEntry } from '@/lib/types/database';
import { getTodayDateString } from '@/lib/utils/bangla';

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onAddRevenue: (entry: Omit<RevenueEntry, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
}

export const RevenueModal: React.FC<RevenueModalProps> = ({
  isOpen,
  onClose,
  clients,
  onAddRevenue,
}) => {
  const todayStr = getTodayDateString();
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState(15000);
  const [paymentType, setPaymentType] = useState<PaymentType>('মাইলস্টোন');
  const [receivedDate, setReceivedDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setIsSubmitting(true);
    const selectedClient = clients.find((c) => c.id === clientId);

    await onAddRevenue({
      client_id: clientId || null,
      client_name: selectedClient ? selectedClient.name : 'অন্যান্য / সাধারণ',
      amount: Number(amount) || 0,
      currency: '৳',
      received_date: receivedDate || todayStr,
      payment_type: paymentType,
      notes: notes.trim(),
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="নতুন আয়ের এন্ট্রি যোগ করুন">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            ক্লায়েন্ট নির্বাচন করুন
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
          >
            <option value="">ক্লায়েন্ট ছাড়া (সরাসরি আয় / বোনাস)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.project_name})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              পরিমাণ (BDT ৳) *
            </label>
            <input
              type="number"
              required
              min="100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              পেমেন্টের ধরন
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
            >
              <option value="অগ্রিম">অগ্রিম (Advance)</option>
              <option value="মাইলস্টোন">মাইলস্টোন (Milestone)</option>
              <option value="চূড়ান্ত">চূড়ান্ত (Final)</option>
              <option value="অন্যান্য">অন্যান্য (Other)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            টাকা প্রাপ্তির তারিখ
          </label>
          <input
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            পেমেন্ট নোট / রেফারেন্স
          </label>
          <input
            type="text"
            placeholder="যেমন: ব্যাংক ট্রান্সফার / বিকাশ / ইনভয়েস #০৩"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'আয় সংরক্ষণ করুন'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
