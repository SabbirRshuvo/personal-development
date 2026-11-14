'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Briefcase,
  AlertCircle,
  Calendar,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Client, Task } from '@/lib/types/database';
import { ClientStatusBadge } from '@/components/ui/Badge';
import { ClientModal } from '@/components/clients/ClientModal';
import { ClientDetailModal } from '@/components/clients/ClientDetailModal';
import { QuickAddTaskModal } from '@/components/dashboard/QuickActionModals';
import {
  formatBDT,
  toBanglaNumber,
  getRelativeBanglaDate,
  getTodayDateString,
} from '@/lib/utils/bangla';

export default function ClientsPage() {
  const {
    clients,
    tasks,
    addClient,
    updateClient,
    deleteClient,
    addTask,
    toggleTaskComplete,
  } = useData();

  const [todayStr, setTodayStr] = useState('2026-11-14');

  React.useEffect(() => {
    setTodayStr(getTodayDateString());
  }, []);

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [detailClient, setDetailClient] = useState<Client | null>(null);

  // Quick add task for a specific client
  const [addTaskClientId, setAddTaskClientId] = useState<string | null>(null);

  // Summary calculations across all clients
  const totalAgreed = clients.reduce((sum, c) => sum + c.agreed_amount, 0);
  const totalPaid = clients.reduce((sum, c) => sum + c.paid_amount, 0);
  const totalPendingPayment = totalAgreed - totalPaid;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>ক্লায়েন্ট ও প্রজেক্ট</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            ক্লায়েন্টের কাজ, জরুরি ডেলিভারি, আয় ও ফলো-আপের হিসাব
          </p>
        </div>

        <button
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>নতুন ক্লায়েন্ট যোগ করুন</span>
        </button>
      </div>

      {/* Top Client Metrics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-stone-500 block">মোট ক্লায়েন্ট চুক্তি</span>
            <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {formatBDT(totalAgreed)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">
              মোট প্রাপ্ত রেভিনিউ
            </span>
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatBDT(totalPaid)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-amber-600 dark:text-amber-400 block font-medium">
              বাকি পাওনা (Pending)
            </span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-300">
              {formatBDT(totalPendingPayment)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1a1917] rounded-3xl border border-dashed border-stone-200 dark:border-stone-800">
            <p className="text-stone-500 text-sm mb-3">এখনো কোনো ক্লায়েন্ট যোগ করা হয়নি</p>
            <button
              onClick={() => setIsAddClientOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
            >
              + ক্লায়েন্ট যোগ করুন
            </button>
          </div>
        ) : (
          clients.map((client) => {
            const clientTasks = tasks.filter((t) => t.client_id === client.id);
            const pendingTasks = clientTasks.filter((t) => t.status !== 'সম্পন্ন');
            const urgentTasks = pendingTasks.filter((t) => t.priority === 'জরুরি');
            const dueTodayTasks = pendingTasks.filter((t) => t.due_date === todayStr);

            return (
              <div
                key={client.id}
                className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
                onClick={() => setDetailClient(client)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Client title and project */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        {client.name}
                      </h2>
                      <ClientStatusBadge status={client.status} />

                      {urgentTasks.length > 0 && (
                        <span className="text-[11px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          {toBanglaNumber(urgentTasks.length)}টি জরুরি কাজ
                        </span>
                      )}

                      {dueTodayTasks.length > 0 && (
                        <span className="text-[11px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full font-semibold">
                          আজ শেষ করতে হবে: {toBanglaNumber(dueTodayTasks.length)}টি
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                      প্রজেক্ট: <span className="text-stone-900 dark:text-stone-100">{client.project_name}</span>
                    </p>

                    {client.contact_info && (
                      <p className="text-xs text-stone-400 truncate max-w-md">
                        {client.contact_info}
                      </p>
                    )}
                  </div>

                  {/* Financial & Work Status Box */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                    <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-right min-w-[120px]">
                      <span className="text-[10px] text-stone-400 block">কাজের অগ্রগতি</span>
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {toBanglaNumber(clientTasks.length - pendingTasks.length)}/
                        {toBanglaNumber(clientTasks.length)} সম্পন্ন
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-right min-w-[130px]">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                        প্রাপ্ত / মোট চুক্তি
                      </span>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {formatBDT(client.paid_amount, client.currency)} /{' '}
                        {formatBDT(client.agreed_amount, client.currency)}
                      </span>
                    </div>

                    {client.next_followup_date && (
                      <div className="p-2.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-right min-w-[110px]">
                        <span className="text-[10px] text-purple-700 dark:text-purple-400 block">
                          ফলো-আপ
                        </span>
                        <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                          {getRelativeBanglaDate(client.next_followup_date)}
                        </span>
                      </div>
                    )}

                    <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-emerald-600 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Client Modals */}
      <ClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        client={null}
        onAddClient={addClient}
        onUpdateClient={updateClient}
        onDeleteClient={deleteClient}
      />

      <ClientModal
        isOpen={Boolean(editingClient)}
        onClose={() => setEditingClient(null)}
        client={editingClient}
        onAddClient={addClient}
        onUpdateClient={updateClient}
        onDeleteClient={deleteClient}
      />

      <ClientDetailModal
        isOpen={Boolean(detailClient)}
        onClose={() => setDetailClient(null)}
        client={detailClient}
        tasks={tasks}
        onOpenEditClient={(c) => setEditingClient(c)}
        onToggleTaskComplete={toggleTaskComplete}
        onOpenAddTaskForClient={(clientId) => setAddTaskClientId(clientId)}
      />

      {/* Quick Add Task with Client preselected */}
      <QuickAddTaskModal
        isOpen={Boolean(addTaskClientId)}
        onClose={() => setAddTaskClientId(null)}
        clients={clients}
        onAddTask={addTask}
      />
    </div>
  );
}
