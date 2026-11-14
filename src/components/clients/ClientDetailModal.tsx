'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Client, Task } from '@/lib/types/database';
import { ClientStatusBadge, PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import {
  formatBDT,
  toBanglaNumber,
  getRelativeBanglaDate,
} from '@/lib/utils/bangla';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  Edit3,
} from 'lucide-react';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  tasks: Task[];
  onOpenEditClient: (client: Client) => void;
  onToggleTaskComplete: (id: string) => void;
  onOpenAddTaskForClient: (clientId: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  tasks,
  onOpenEditClient,
  onToggleTaskComplete,
  onOpenAddTaskForClient,
}) => {
  if (!client) return null;

  const clientTasks = tasks.filter((t) => t.client_id === client.id);
  const openTasks = clientTasks.filter((t) => t.status !== 'সম্পন্ন');
  const completedTasks = clientTasks.filter((t) => t.status === 'সম্পন্ন');
  const urgentTasks = openTasks.filter((t) => t.priority === 'জরুরি');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${client.name} — প্রজেক্ট ওভারভিউ`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Top Summary Card */}
        <div className="bg-gradient-to-br from-stone-50 to-blue-50/40 dark:from-stone-900 dark:to-blue-950/20 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-stone-900 dark:text-stone-100">
                  {client.project_name}
                </span>
                <ClientStatusBadge status={client.status} />
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                যোগাযোগ: {client.contact_info || 'কোনো কন্টাক্ট লিঙ্ক দেওয়া হয়নি'}
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenEditClient(client);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 text-stone-700 dark:text-stone-300 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>তথ্য সম্পাদনা</span>
            </button>
          </div>

          {/* Financials & Followup */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-stone-200/60 dark:border-stone-800">
            <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60">
              <span className="text-[11px] text-stone-500 block">মোট চুক্তি</span>
              <span className="text-sm font-bold text-stone-800 dark:text-stone-100">
                {formatBDT(client.agreed_amount, client.currency)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">
                প্রাপ্ত অর্থ
              </span>
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {formatBDT(client.paid_amount, client.currency)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
              <span className="text-[11px] text-amber-700 dark:text-amber-400 block">বাকি পাওনা</span>
              <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {formatBDT(client.agreed_amount - client.paid_amount, client.currency)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
              <span className="text-[11px] text-purple-700 dark:text-purple-400 block">ফলো-আপ</span>
              <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                {client.next_followup_date
                  ? getRelativeBanglaDate(client.next_followup_date)
                  : 'নির্ধারিত নেই'}
              </span>
            </div>
          </div>

          {client.notes && (
            <div className="pt-2 text-xs text-stone-600 dark:text-stone-300 bg-white/60 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-200/50 dark:border-stone-800">
              <span className="font-semibold text-stone-700 dark:text-stone-200">নোট: </span>
              {client.notes}
            </div>
          )}
        </div>

        {/* Task Management for this Client */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>প্রজেক্টের কাজের তালিকা</span>
                <span className="text-xs font-normal text-stone-500">
                  (বাকি: {toBanglaNumber(openTasks.length)}, সম্পন্ন:{' '}
                  {toBanglaNumber(completedTasks.length)})
                </span>
              </h4>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAddTaskForClient(client.id);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন কাজ</span>
            </button>
          </div>

          {/* Urgent tasks alert if any */}
          {urgentTasks.length > 0 && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                এই ক্লায়েন্টের {toBanglaNumber(urgentTasks.length)}টি জরুরি কাজ এখনো বাকি আছে!
              </span>
            </div>
          )}

          {/* Tasks List */}
          {clientTasks.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
              <p className="text-xs text-stone-500">এই ক্লায়েন্টের জন্য কোনো কাজ যুক্ত নেই</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {clientTasks.map((task) => {
                const isDone = task.status === 'সম্পন্ন';

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs ${
                      isDone
                        ? 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-70'
                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleTaskComplete(task.id)}
                        className="text-stone-400 hover:text-emerald-600 shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <PriorityBadge priority={task.priority} />
                          <StatusBadge status={task.status} />
                        </div>
                        <span
                          className={`font-semibold block truncate ${
                            isDone ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-stone-400">
                      <span>{toBanglaNumber(task.estimated_minutes)} মি.</span>
                      <span>•</span>
                      <span>{getRelativeBanglaDate(task.due_date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
