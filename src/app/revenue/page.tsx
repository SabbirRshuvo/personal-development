'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  UserSearch,
  Plus,
  Send,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  BarChart2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { RevenueModal } from '@/components/revenue/RevenueModal';
import { HuntingModal } from '@/components/revenue/HuntingModal';
import { formatBDT, toBanglaNumber, formatBanglaDate, getTodayDateString } from '@/lib/utils/bangla';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function RevenueHuntingPage() {
  const {
    revenue,
    clients,
    huntingLogs,
    addRevenue,
    deleteRevenue,
    addHuntingLog,
    deleteHuntingLog,
  } = useData();

  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isHuntingModalOpen, setIsHuntingModalOpen] = useState(false);

  // Financial calculations
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);

  // Current month revenue
  const [currentMonthStr, setCurrentMonthStr] = useState('2026-11');

  React.useEffect(() => {
    setCurrentMonthStr(getTodayDateString().slice(0, 7));
  }, []);
  const monthlyRevenue = revenue
    .filter((r) => r.received_date.startsWith(currentMonthStr))
    .reduce((sum, r) => sum + r.amount, 0);

  // Total unpaid agreed amount from clients
  const totalAgreed = clients.reduce((sum, c) => sum + c.agreed_amount, 0);
  const totalClientPaid = clients.reduce((sum, c) => sum + c.paid_amount, 0);
  const unpaidAmount = Math.max(0, totalAgreed - totalClientPaid);

  // Hunting Conversion Funnel Calculations
  const totalSent = huntingLogs.reduce((sum, h) => sum + h.messages_sent, 0);
  const totalResponses = huntingLogs.reduce((sum, h) => sum + h.responses_count, 0);
  const totalCalls = huntingLogs.reduce((sum, h) => sum + h.calls_count, 0);
  const totalLeads = huntingLogs.reduce((sum, h) => sum + h.leads_count, 0);
  const totalClosed = huntingLogs.reduce((sum, h) => sum + h.clients_closed, 0);

  const responseRate = totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0;
  const callConversionRate = totalResponses > 0 ? Math.round((totalCalls / totalResponses) * 100) : 0;
  const clientCloseRate = totalCalls > 0 ? Math.round((totalClosed / totalCalls) * 100) : 0;

  // Chart Data: Revenue by Client
  const clientRevenueMap: Record<string, number> = {};
  revenue.forEach((r) => {
    const name = r.client_name || 'অন্যান্য';
    clientRevenueMap[name] = (clientRevenueMap[name] || 0) + r.amount;
  });

  const chartData = Object.keys(clientRevenueMap).map((name) => ({
    name,
    amount: clientRevenueMap[name],
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>আয় ও ক্লায়েন্ট হান্টিং</span>
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            আয়ের গতিবিধি, ক্লায়েন্ট আউটরিচ ফানেল ও কনভার্সন রেট ট্র্যাকার
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsHuntingModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
          >
            <UserSearch className="w-4 h-4" />
            <span>হান্টিং লগ</span>
          </button>

          <button
            onClick={() => setIsRevenueModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>নতুন আয় যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* 1. Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">এই মাসের আয়</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatBDT(monthlyRevenue)}
          </div>
          <span className="text-[11px] text-stone-400">চলতি মাসের সংগৃহীত পেমেন্ট</span>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">সর্বমোট আয়</span>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100">
            {formatBDT(totalRevenue)}
          </div>
          <span className="text-[11px] text-stone-400">অ্যাগ্রিড মাইলস্টোন ও সম্পন্ন প্রজেক্ট</span>
        </div>

        <div className="bg-white dark:bg-[#1a1917] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            বাকি অপরিশোধিত পাওনা
          </span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
            {formatBDT(unpaidAmount)}
          </div>
          <span className="text-[11px] text-stone-400">চলমান ক্লায়েন্ট চুক্তি থেকে বাকি</span>
        </div>
      </div>

      {/* 2. Client Hunting Funnel & Metrics */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <UserSearch className="w-5 h-5 text-blue-600" />
            <span>ক্লায়েন্ট হান্টিং ফানেল ও কনভার্সন মেট্রিক্স</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            আউটরিচ প্রপোজাল থেকে ক্লায়েন্ট ক্লোজিং পর্যন্ত ধারাবাহিক হিসাব
          </p>
        </div>

        {/* Funnel Visual */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-center">
            <Send className="w-4 h-4 mx-auto mb-1.5 text-stone-600 dark:text-stone-300" />
            <span className="text-xs text-stone-500 block">মেসেজ / প্রপোজাল</span>
            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {toBanglaNumber(totalSent)}টি
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center">
            <span className="text-xs text-blue-700 dark:text-blue-300 block font-medium">রেসপন্স</span>
            <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
              {toBanglaNumber(totalResponses)}টি
            </span>
            <span className="text-[10px] text-blue-600 block mt-0.5">
              রেট: %{toBanglaNumber(responseRate)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-center">
            <PhoneCall className="w-4 h-4 mx-auto mb-1 text-purple-600" />
            <span className="text-xs text-purple-700 dark:text-purple-300 block font-medium">কল / মিটিং</span>
            <span className="text-lg font-bold text-purple-800 dark:text-purple-200">
              {toBanglaNumber(totalCalls)}টি
            </span>
            <span className="text-[10px] text-purple-600 block mt-0.5">
              রেট: %{toBanglaNumber(callConversionRate)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center">
            <span className="text-xs text-amber-700 dark:text-amber-300 block font-medium">যোগ্য লিড</span>
            <span className="text-lg font-bold text-amber-800 dark:text-amber-200">
              {toBanglaNumber(totalLeads)}টি
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
            <UserCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 block font-medium">
              ক্লায়েন্ট ক্লোজড
            </span>
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              {toBanglaNumber(totalClosed)}জন
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">
              রেট: %{toBanglaNumber(clientCloseRate)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Charts & Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Client Chart */}
        <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs">
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span>ক্লায়েন্ট অনুযায়ী সংগৃহীত আয়</span>
          </h3>
          <p className="text-xs text-stone-500 mb-4">কোন ক্লায়েন্ট থেকে কত আয় হয়েছে</p>

          <div className="h-56 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                কোনো আয়ের এন্ট্রি নেই
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [formatBDT(Number(val)), 'আয়']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#059669" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Revenue Entries */}
        <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                সাম্প্রতিক আয়ের তালিকা
              </h3>
              <span className="text-xs text-stone-500">
                মোট: {toBanglaNumber(revenue.length)}টি লেনদেন
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-3">টাকা প্রাপ্তির রেকর্ড ও পেমেন্ট টাইপ</p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {revenue.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">এখনো কোনো আয় এন্ট্রি নেই</p>
              ) : (
                revenue.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/60 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {r.client_name || 'সাধারণ আয়'}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {formatBanglaDate(r.received_date, false)} •{' '}
                        <span className="font-semibold text-emerald-600">{r.payment_type}</span>
                        {r.notes && ` • ${r.notes}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                        {formatBDT(r.amount, r.currency)}
                      </span>
                      <button
                        onClick={() => deleteRevenue(r.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Hunting Logs */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              আউটরিচ ও হান্টিং হিস্ট্রি
            </h3>
            <p className="text-xs text-stone-500">বিভিন্ন প্ল্যাটফর্মের দৈনিক আবেদনের লগ</p>
          </div>
          <button
            onClick={() => setIsHuntingModalOpen(true)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            + লগ যুক্ত করুন
          </button>
        </div>

        <div className="space-y-2">
          {huntingLogs.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">এখনো কোনো হান্টিং লগ নেই</p>
          ) : (
            huntingLogs.map((h) => (
              <div
                key={h.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-stone-50/60 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-700/60 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {h.platform}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      • {formatBanglaDate(h.date, false)}
                    </span>
                  </div>
                  {h.notes && <p className="text-stone-500 mt-1">{h.notes}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-md font-semibold">
                      পাঠানো: {toBanglaNumber(h.messages_sent)}
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-md font-semibold">
                      রেসপন্স: {toBanglaNumber(h.responses_count)}
                    </span>
                    <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md font-semibold">
                      কল: {toBanglaNumber(h.calls_count)}
                    </span>
                    {h.clients_closed > 0 && (
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                        ক্লোজড: {toBanglaNumber(h.clients_closed)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => deleteHuntingLog(h.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <RevenueModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        clients={clients}
        onAddRevenue={addRevenue}
      />

      <HuntingModal
        isOpen={isHuntingModalOpen}
        onClose={() => setIsHuntingModalOpen(false)}
        onAddHuntingLog={addHuntingLog}
      />
    </div>
  );
}
