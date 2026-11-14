import { Task, RevenueEntry } from '@/lib/types/database';

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTasksToCSV(tasks: Task[]) {
  const headers = ['শিরোনাম', 'ক্লায়েন্ট', 'অগ্রাধিকার', 'স্ট্যাটাস', 'সময় (মিনিট)', 'নির্ধারিত তারিখ', 'সম্পন্নের সময়'];
  const rows = tasks.map((t) => [
    `"${t.title.replace(/"/g, '""')}"`,
    `"${(t.client_name || '').replace(/"/g, '""')}"`,
    t.priority,
    t.status,
    t.estimated_minutes,
    t.due_date,
    t.completed_at || '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  downloadCSV(`tasks_amar_discipline_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

export function exportRevenueToCSV(revenues: RevenueEntry[]) {
  const headers = ['তারিখ', 'ক্লায়েন্ট', 'পরিমাণ', 'মুদ্রা', 'পেমেন্ট ধরন', 'নোট'];
  const rows = revenues.map((r) => [
    r.received_date,
    `"${(r.client_name || '').replace(/"/g, '""')}"`,
    r.amount,
    r.currency,
    r.payment_type,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  downloadCSV(`revenue_amar_discipline_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}
