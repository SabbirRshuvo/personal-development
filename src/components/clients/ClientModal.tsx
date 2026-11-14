'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Client, ClientStatus } from '@/lib/types/database';
import { Trash2 } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onAddClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'remaining_amount'>) => Promise<any>;
  onUpdateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [name, setName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [status, setStatus] = useState<ClientStatus>('চলমান');
  const [agreedAmount, setAgreedAmount] = useState(50000);
  const [paidAmount, setPaidAmount] = useState(0);
  const [currency, setCurrency] = useState('৳');
  const [notes, setNotes] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setProjectName(client.project_name);
      setContactInfo(client.contact_info || '');
      setStatus(client.status);
      setAgreedAmount(client.agreed_amount);
      setPaidAmount(client.paid_amount);
      setCurrency(client.currency || '৳');
      setNotes(client.notes || '');
      setNextFollowupDate(client.next_followup_date || '');
    } else {
      setName('');
      setProjectName('');
      setContactInfo('');
      setStatus('চলমান');
      setAgreedAmount(50000);
      setPaidAmount(0);
      setCurrency('৳');
      setNotes('');
      setNextFollowupDate('');
    }
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectName.trim()) return;

    setIsSubmitting(true);
    if (client) {
      await onUpdateClient(client.id, {
        name: name.trim(),
        project_name: projectName.trim(),
        contact_info: contactInfo.trim(),
        status,
        agreed_amount: Number(agreedAmount) || 0,
        paid_amount: Number(paidAmount) || 0,
        currency,
        notes: notes.trim(),
        next_followup_date: nextFollowupDate || null,
      });
    } else {
      await onAddClient({
        name: name.trim(),
        project_name: projectName.trim(),
        contact_info: contactInfo.trim(),
        status,
        agreed_amount: Number(agreedAmount) || 0,
        paid_amount: Number(paidAmount) || 0,
        currency,
        notes: notes.trim(),
        next_followup_date: nextFollowupDate || null,
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!client) return;
    if (confirm(`আপনি কি "${client.name}" ক্লায়েন্ট মুছে ফেলতে চান?`)) {
      await onDeleteClient(client.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'ক্লায়েন্টের তথ্য সম্পাদনা' : 'নতুন ক্লায়েন্ট যোগ করুন'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              ক্লায়েন্টের নাম *
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: টেকসলভ বিডি"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              প্রজেক্টের নাম *
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: ই-কমার্স রিডিজাইন"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              যোগাযোগের মাধ্যম / লিংক
            </label>
            <input
              type="text"
              placeholder="হোয়াটসঅ্যাপ / ইমেইল / টেলিগ্রাম..."
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              প্রজেক্ট স্ট্যাটাস
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="চলমান">চলমান</option>
              <option value="অপেক্ষায়">অপেক্ষায়</option>
              <option value="সম্পন্ন">সম্পন্ন</option>
              <option value="সম্ভাব্য">সম্ভাব্য</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              চুক্তির পরিমাণ (Agreed)
            </label>
            <input
              type="number"
              min="0"
              value={agreedAmount}
              onChange={(e) => setAgreedAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              প্রাপ্ত অর্থ (Paid)
            </label>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              পরবর্তী ফলো-আপ তারিখ
            </label>
            <input
              type="date"
              value={nextFollowupDate}
              onChange={(e) => setNextFollowupDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            গুরুত্বপূর্ণ নোট
          </label>
          <textarea
            rows={2}
            placeholder="প্রজেক্ট ডেলিভারি রিকোয়ারমেন্ট, বিশেষ কোনো শর্ত ইত্যাদি..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
          {client ? (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              বাতিল
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : client ? 'আপডেট করুন' : 'ক্লায়েন্ট সংরক্ষণ'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
