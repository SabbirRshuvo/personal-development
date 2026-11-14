'use client';

import React from 'react';
import { Priority, TaskStatus, ClientStatus } from '@/lib/types/database';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'rose' | 'purple' | 'stone';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'stone', className = '' }) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    blue: 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    amber: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    rose: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    purple: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    stone: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  if (priority === 'জরুরি') {
    return <Badge variant="rose">জরুরি</Badge>;
  }
  if (priority === 'গুরুত্বপূর্ণ') {
    return <Badge variant="amber">গুরুত্বপূর্ণ</Badge>;
  }
  return <Badge variant="stone">সাধারণ</Badge>;
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  if (status === 'সম্পন্ন') {
    return <Badge variant="emerald">সম্পন্ন</Badge>;
  }
  if (status === 'চলছে') {
    return <Badge variant="blue">চলছে</Badge>;
  }
  if (status === 'আ আটকে আছে') {
    return <Badge variant="rose">আটকে আছে</Badge>;
  }
  return <Badge variant="amber">বাকি</Badge>;
};

export const ClientStatusBadge: React.FC<{ status: ClientStatus }> = ({ status }) => {
  if (status === 'চলমান') {
    return <Badge variant="emerald">চলমান</Badge>;
  }
  if (status === 'অপেক্ষায়') {
    return <Badge variant="amber">অপেক্ষায়</Badge>;
  }
  if (status === 'সম্পন্ন') {
    return <Badge variant="blue">সম্পন্ন</Badge>;
  }
  return <Badge variant="purple">সম্ভাব্য</Badge>;
};
