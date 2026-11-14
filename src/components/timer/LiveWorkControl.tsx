'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Coffee,
  Sparkles,
  Briefcase,
  BookOpen,
  UserSearch,
  GraduationCap,
  Timer as TimerIcon,
  RotateCcw,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { TimeSessionCategory } from '@/lib/types/database';
import { toBanglaNumber } from '@/lib/utils/bangla';
import confetti from 'canvas-confetti';
import { StartSessionModal } from './StartSessionModal';
import { BreakModal } from './BreakModal';

interface LiveWorkControlProps {
  onOpenStartModal?: (preselectedCategory?: TimeSessionCategory) => void;
  onOpenBreakModal?: () => void;
}

export const LiveWorkControl: React.FC<LiveWorkControlProps> = ({
  onOpenStartModal,
  onOpenBreakModal,
}) => {
  const {
    activeSession,
    pauseSession,
    resumeSession,
    stopSession,
    resumeFocusFromBreak,
    todayTrackedStats,
    clients,
    tasks,
    startSession,
  } = useData();

  // Local modals state if parent doesn't provide handlers
  const [localStartModalOpen, setLocalStartModalOpen] = useState(false);
  const [localStartCategory, setLocalStartCategory] = useState<TimeSessionCategory | undefined>(undefined);
  const [localBreakModalOpen, setLocalBreakModalOpen] = useState(false);

  const handleOpenStart = (category?: TimeSessionCategory) => {
    if (onOpenStartModal) {
      onOpenStartModal(category);
    } else {
      setLocalStartCategory(category);
      setLocalStartModalOpen(true);
    }
  };

  const handleOpenBreak = () => {
    if (onOpenBreakModal) {
      onOpenBreakModal();
    } else {
      setLocalBreakModalOpen(true);
    }
  };

  // Elapsed seconds state for smooth live counter
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showOvertimeWarning, setShowOvertimeWarning] = useState(false);
  const [pomodoroDoneNotified, setPomodoroDoneNotified] = useState(false);

  // Live timer interval: calculates from real database/server `started_at`
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      setShowOvertimeWarning(false);
      setPomodoroDoneNotified(false);
      return;
    }

    const calculateElapsed = () => {
      const startMs = new Date(activeSession.started_at).getTime();
      const nowMs = Date.now();
      const secs = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(secs);

      // Overtime reminder if session runs > 4 hours (14400s)
      if (secs > 14400) {
        setShowOvertimeWarning(true);
      } else {
        setShowOvertimeWarning(false);
      }

      // Pomodoro completion check
      if (
        activeSession.is_pomodoro &&
        activeSession.pomodoro_focus_minutes &&
        !pomodoroDoneNotified
      ) {
        const targetSecs = activeSession.pomodoro_focus_minutes * 60;
        if (secs >= targetSecs && activeSession.status === 'active') {
          setPomodoroDoneNotified(true);
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#059669', '#3b82f6', '#8b5cf6'],
            });
          } catch { }
        }
      }
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeSession, pomodoroDoneNotified]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n: number) => (n < 10 ? `০${toBanglaNumber(n)}` : toBanglaNumber(n));
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const isBreakActive = activeSession?.category === 'break' || activeSession?.category === 'prayer';

  const categoryLabels: Record<string, { label: string; color: string; bg: string }> = {
    client_work: { label: 'ক্লায়েন্ট প্রজেক্ট কাজ', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    deep_focus: { label: 'ডিপ ফোকাস ওয়ার্ক', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    client_hunting: { label: 'ক্লায়েন্ট হান্টিং ও আউটরিচ', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' },
    english_practice: { label: 'ইংরেজি কমিউনিকেশন চর্চা', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    learning_class: { label: 'লার্নিং ও ক্লাস', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
    admin_planning: { label: 'প্ল্যানিং ও পর্যালোচনা', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    break: { label: 'বিরতি (Break)', color: 'text-stone-600 dark:text-stone-300', bg: 'bg-stone-500/10 border-stone-500/30' },
    prayer: { label: 'নামাজ বিরতি', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    exercise: { label: 'হাঁটা ও শরীরচর্চা', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    wasted_time: { label: 'অনাকাঙ্ক্ষিত অপচয়', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    other: { label: 'অন্যান্য কাজ', color: 'text-stone-600 dark:text-stone-400', bg: 'bg-stone-500/10 border-stone-500/30' },
  };

  const handleStop = async () => {
    if (!activeSession) return;
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#10b981', '#3b82f6'],
      });
    } catch { }
    await stopSession(activeSession.id);
  };

  const formatHoursMinutes = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0 && m > 0) return `${toBanglaNumber(h)} ঘণ্টা ${toBanglaNumber(m)} মি.`;
    if (h > 0) return `${toBanglaNumber(h)} ঘণ্টা`;
    return `${toBanglaNumber(m)} মিনিট`;
  };

  return (
    <div id="focus-control" className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 sm:p-6 shadow-sm relative overflow-hidden transition-all">
      {/* 1. Header bar with Live Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TimerIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>লাইভ ফোকাস কন্ট্রোল</span>
              {activeSession && (
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  সেশন রানিং
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              শুধুমাত্র স্টার্ট ও স্টপ চাপুন — মোট সময় ডাটাবেসে স্বয়ংক্রিয়ভাবে হিসাব হবে
            </p>
          </div>
        </div>

        {/* Today's Automatic Summary Badges */}
        <div className="flex items-center gap-2 text-xs font-medium self-start sm:self-auto flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
            ফোকাস কাজ: <strong>{formatHoursMinutes(todayTrackedStats.focusedWorkSeconds)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            বিরতি: <strong>{formatHoursMinutes(todayTrackedStats.breakSeconds)}</strong>
          </span>
        </div>
      </div>

      {/* 2. OVERTIME REMINDER WARNING (>4 hours) */}
      {showOvertimeWarning && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>তোমার timer ৪ ঘণ্টার বেশি চলছে। কাজ শেষ হয়ে গেলে stop করে দাও।</span>
          </div>
          <button
            onClick={handleStop}
            className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700 shrink-0"
          >
            এখনই Stop করুন
          </button>
        </div>
      )}

      {/* 3. POMODORO COMPLETION NOTIFICATION */}
      {pomodoroDoneNotified && activeSession?.is_pomodoro && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
            <span>একটু বিরতি নাও, তারপর আবার শুরু করো। চমৎকার ফোকাস সেশন সম্পন্ন হয়েছে!</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenBreak}
              className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700"
            >
              বিরতি শুরু
            </button>
            <button
              onClick={() => setPomodoroDoneNotified(false)}
              className="px-2.5 py-1 text-stone-500 hover:text-stone-800 text-xs font-semibold"
            >
              চালিয়ে যাবো
            </button>
          </div>
        </div>
      )}

      {/* 4. ACTIVE SESSION VIEW */}
      {activeSession ? (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-2xl border ${categoryLabels[activeSession.category]?.bg || 'bg-stone-50 border-stone-200'
              } flex flex-col md:flex-row md:items-center justify-between gap-4`}
          >
            {/* Left: Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${categoryLabels[activeSession.category]?.color
                    } bg-white dark:bg-stone-900 border border-current/20`}
                >
                  {categoryLabels[activeSession.category]?.label}
                </span>

                {activeSession.client_name && (
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-stone-900/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {activeSession.client_name}
                  </span>
                )}

                {activeSession.is_pomodoro && (
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                    পোমোডোরো ({toBanglaNumber(activeSession.pomodoro_focus_minutes || 25)} মি.)
                  </span>
                )}
              </div>

              <h4 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 truncate">
                {activeSession.title || 'চলমান সেশন'}
              </h4>

              {activeSession.note && (
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                  নোট: {activeSession.note}
                </p>
              )}
            </div>

            {/* Middle: Live Elapsed Counter */}
            <div className="text-left md:text-right shrink-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-900 dark:text-stone-100 font-mono">
                {formatTime(elapsedSeconds)}
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                শুরু: {new Date(activeSession.started_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>
          </div>

          {/* Action Buttons for Active Session */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Pause / Resume */}
            {activeSession.status === 'active' ? (
              <button
                onClick={() => pauseSession(activeSession.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>পজ করুন</span>
              </button>
            ) : (
              <button
                onClick={() => resumeSession(activeSession.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>চালিয়ে যান</span>
              </button>
            )}

            {/* Break / Return to Focus */}
            {!isBreakActive ? (
              <button
                onClick={handleOpenBreak}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                <Coffee className="w-4 h-4" />
                <span>Break শুরু</span>
              </button>
            ) : (
              <button
                onClick={() => resumeFocusFromBreak()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Focus-এ ফিরি</span>
              </button>
            )}

            {/* Stop and Save Button */}
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-rose-600/20 transition-all active:scale-95 ml-auto"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop & Save</span>
            </button>
          </div>
        </div>
      ) : (
        /* 5. INACTIVE STATE: LARGE QUICK-START BUTTONS */
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Focus শুরু */}
            <button
              onClick={() => handleOpenStart('deep_focus')}
              className="group p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/20 hover:to-teal-500/15 border border-emerald-500/25 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100 block">
                  Focus শুরু
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  ডিপ ওয়ার্ক সেশন
                </span>
              </div>
            </button>

            {/* Client hunting শুরু */}
            <button
              onClick={() => handleOpenStart('client_hunting')}
              className="group p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-500/5 hover:from-teal-500/20 hover:to-blue-500/15 border border-teal-500/25 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
                <UserSearch className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100 block">
                  Client hunting শুরু
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  আউটরিচ ও প্রপোজাল
                </span>
              </div>
            </button>

            {/* English শুরু */}
            <button
              onClick={() => handleOpenStart('english_practice')}
              className="group p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 hover:from-purple-500/20 hover:to-indigo-500/15 border border-purple-500/25 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100 block">
                  English শুরু
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  স্পিকিং ও লিসেনিং
                </span>
              </div>
            </button>

            {/* Class শুরু */}
            <button
              onClick={() => handleOpenStart('learning_class')}
              className="group p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-sky-500/5 hover:from-indigo-500/20 hover:to-sky-500/15 border border-indigo-500/25 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100 block">
                  Class / Learning
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  স্কিল ডেভেলপমেন্ট
                </span>
              </div>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              &ldquo;ছোট একটা focus block দিয়েই শুরু করো—গতি আপনাআপনি আসবে।&rdquo;
            </span>

            <button
              onClick={() => handleOpenStart()}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              + কাস্টম সেশন শুরু
            </button>
          </div>
        </div>
      )}

      {/* Internal Modals when parent doesn't provide handlers */}
      {!onOpenStartModal && (
        <StartSessionModal
          isOpen={localStartModalOpen}
          onClose={() => setLocalStartModalOpen(false)}
          clients={clients}
          tasks={tasks}
          initialCategory={localStartCategory}
          onStartSession={startSession}
        />
      )}
      {!onOpenBreakModal && (
        <BreakModal
          isOpen={localBreakModalOpen}
          onClose={() => setLocalBreakModalOpen(false)}
        />
      )}
    </div>
  );
};

