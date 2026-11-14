'use client';

import React, { useState } from 'react';
import { Clock, Plus, Edit2, Briefcase, CheckSquare, Coffee, BookOpen, Target, Sparkles, Play, AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { TimeSession, TimeSessionCategory } from '@/lib/types/database';
import { toBengaliNumber } from '@/lib/utils/bangla';
import { AddPastSessionModal } from './AddPastSessionModal';

export const WorkTimeline: React.FC = () => {
  const { todaySessions, language } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TimeSession | null>(null);

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? (language === 'bn' ? 'PM' : 'PM') : (language === 'bn' ? 'AM' : 'AM');
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;
    return language === 'bn' ? toBengaliNumber(timeStr) : timeStr;
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return language === 'bn' ? 'চলমান' : 'running';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hrs > 0 && mins > 0) {
      return language === 'bn'
        ? `${toBengaliNumber(hrs)} ঘণ্টা ${toBengaliNumber(mins)} মিনিট`
        : `${hrs}h ${mins}m`;
    } else if (hrs > 0) {
      return language === 'bn'
        ? `${toBengaliNumber(hrs)} ঘণ্টা`
        : `${hrs}h`;
    } else {
      return language === 'bn'
        ? `${toBengaliNumber(Math.max(1, mins))} মিনিট`
        : `${Math.max(1, mins)}m`;
    }
  };

  const getCategoryConfig = (category: TimeSessionCategory, breakType?: string | null) => {
    if (category === 'Break' || category === 'break') {
      if (breakType === 'নামাজ') {
        return {
          icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
          badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dotClass: 'bg-emerald-500',
          label: language === 'bn' ? `নামাজ বিরতি` : `Prayer Break`,
        };
      }
      return {
        icon: <Coffee className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dotClass: 'bg-slate-400',
        label: language === 'bn' ? `বিরতি (${breakType || 'সাধারণ'})` : `Break (${breakType || 'General'})`,
      };
    }

    switch (category) {
      case 'Client Work':
      case 'client_work':
        return {
          icon: <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          dotClass: 'bg-blue-500',
          label: language === 'bn' ? 'ক্লায়েন্টের কাজ' : 'Client Work',
        };
      case 'Deep Focus':
      case 'deep_focus':
        return {
          icon: <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          dotClass: 'bg-indigo-500',
          label: language === 'bn' ? 'ডিপ ফোকাস' : 'Deep Focus',
        };
      case 'Client Hunting':
      case 'client_hunting':
        return {
          icon: <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
          badgeClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          dotClass: 'bg-teal-500',
          label: language === 'bn' ? 'ক্লায়েন্ট হান্টিং' : 'Client Hunting',
        };
      case 'English Practice':
      case 'english_practice':
        return {
          icon: <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          dotClass: 'bg-purple-500',
          label: language === 'bn' ? 'ইংরেজি প্র্যাকটিস' : 'English Practice',
        };
      case 'Learning/Class':
      case 'learning_class':
        return {
          icon: <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dotClass: 'bg-emerald-500',
          label: language === 'bn' ? 'ক্লাস / স্কিল লার্নিং' : 'Learning / Class',
        };
      case 'Wasted Time':
      case 'wasted_time':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dotClass: 'bg-rose-500',
          label: language === 'bn' ? 'নষ্ট সময়' : 'Wasted Time',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
          badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dotClass: 'bg-slate-400',
          label: category,
        };
    }
  };

  // Sort sessions chronologically (oldest first for timeline view)
  const sortedSessions = [...todaySessions].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span>{language === 'bn' ? 'আজকের সময়ের Timeline' : "Today's Work Timeline"}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'সারাদিনের কাজের সেশন ও বিরতির পর্যায়ক্রমিক বিবরণ'
              : 'Chronological timeline of focused work sessions and breaks'}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSession(null);
            setIsAddModalOpen(true);
          }}
          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{language === 'bn' ? 'অফলাইন সেশন যোগ' : 'Add Past Session'}</span>
        </button>
      </div>

      {sortedSessions.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {language === 'bn'
                ? 'আজকের কোনো tracked session নেই।'
                : 'No tracked sessions for today.'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              {language === 'bn'
                ? 'লাইভ ফোকাস টাইমার চালু করে দিন শুরু করুন অথবা পূর্বে শেষ হওয়া সেশন যোগ করুন।'
                : 'Start a live focus session or add a past offline session.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                const el = document.getElementById('focus-control');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'bn' ? 'Focus শুরু করুন' : 'Start Focus'}</span>
            </button>
            <button
              onClick={() => {
                setEditingSession(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অফলাইন সেশন যোগ' : 'Add Session'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {sortedSessions.map((session) => {
            const config = getCategoryConfig(session.category, session.break_type);
            const isLive = session.status === 'running' || session.status === 'paused';

            return (
              <div
                key={session.id}
                className="relative group transition-all"
              >
                {/* Timeline node */}
                <div
                  className={`absolute -left-[23px] sm:-left-[27px] top-3.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${config.dotClass} ${
                    isLive ? 'animate-ping' : ''
                  }`}
                />

                <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl p-3.5 sm:p-4 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass}`}>
                        {config.icon}
                        <span>{config.label}</span>
                      </span>

                      {/* Time window badge */}
                      <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {formatTime(session.started_at)} – {isLive ? (language === 'bn' ? 'চলমান' : 'Live') : formatTime(session.ended_at)}
                      </span>

                      {/* Duration */}
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                        {formatDuration(session.duration_seconds)}
                      </span>

                      {isLive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {session.status === 'paused' ? (language === 'bn' ? 'স্থগিত' : 'Paused') : (language === 'bn' ? 'লাইভ চলমান' : 'Running')}
                        </span>
                      )}
                    </div>

                    {/* Linked task or client or note */}
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {(session.linked_client_name || session.client_name) && (
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{session.linked_client_name || session.client_name}</span>
                        </div>
                      )}

                      {(session.linked_task_title || session.task_title) && (
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="line-clamp-1">{session.linked_task_title || session.task_title}</span>
                        </div>
                      )}

                      {session.note && (
                        <p className="text-slate-500 dark:text-slate-400 italic">
                          &ldquo;{session.note}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingSession(session);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                      title={language === 'bn' ? 'সংশোধন করুন' : 'Edit session'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit or Add Session Modal */}
      <AddPastSessionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSession(null);
        }}
        editingSession={editingSession}
      />
    </div>
  );
};
