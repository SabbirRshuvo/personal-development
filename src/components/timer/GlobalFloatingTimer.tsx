'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, Pause, Square, Coffee, Maximize2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { toBengaliNumber } from '@/lib/utils/bangla';
import { BreakModal } from './BreakModal';

export const GlobalFloatingTimer: React.FC = () => {
  const pathname = usePathname();
  const { activeSession, pauseSession, resumeSession, stopSession, language } = useData();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const calculateElapsed = () => {
      const startMs = new Date(activeSession.started_at).getTime();
      const nowMs = Date.now();
      const totalSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      return totalSec;
    };

    setElapsedSeconds(calculateElapsed());

    if (activeSession.status === 'paused') {
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Don't show if no active session
  if (!activeSession) return null;

  // On the home page, the LiveWorkControl is already prominent at the very top.
  // We can show the floating pill only when user scrolls or on other pages,
  // or show a compact bar everywhere so it's always persistent. Let's make it compact and non-obtrusive!
  const isBreak = activeSession.category === 'Break';

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(hrs)}:${pad(mins)}:${pad(s)}`;
    return language === 'bn' ? toBengaliNumber(timeStr) : timeStr;
  };

  const getLabel = () => {
    if (isBreak) {
      return language === 'bn' ? `বিরতি: ${activeSession.break_type || 'চলছে'}` : `Break: ${activeSession.break_type || 'Rest'}`;
    }
    switch (activeSession.category) {
      case 'Client Work':
        return language === 'bn' ? 'ক্লায়েন্টের কাজ' : 'Client Work';
      case 'Deep Focus':
        return language === 'bn' ? 'ডিপ ফোকাস' : 'Deep Focus';
      case 'Client Hunting':
        return language === 'bn' ? 'ক্লায়েন্ট হান্টিং' : 'Client Hunting';
      case 'English Practice':
        return language === 'bn' ? 'ইংরেজি প্র্যাকটিস' : 'English Practice';
      case 'Learning/Class':
        return language === 'bn' ? 'লার্নিং / ক্লাস' : 'Learning / Class';
      default:
        return activeSession.category;
    }
  };

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl transition-all duration-300 animate-in slide-in-from-bottom-5">
        <div
          className={`px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border flex items-center justify-between gap-3 ${
            isBreak
              ? 'bg-amber-500/90 dark:bg-amber-950/90 text-white border-amber-400 dark:border-amber-700 shadow-amber-500/20'
              : 'bg-slate-900/90 dark:bg-slate-950/90 text-white border-slate-700 shadow-slate-950/30'
          }`}
        >
          {/* Left info */}
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                activeSession.status === 'paused'
                  ? 'bg-amber-400'
                  : isBreak
                  ? 'bg-white animate-pulse'
                  : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 dark:text-slate-400 truncate">
                  {getLabel()}
                </span>
                {activeSession.is_pomodoro && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded font-medium">
                    Pomodoro
                  </span>
                )}
              </div>
              <div className="text-lg font-mono font-bold tracking-tight">
                {formatElapsed(elapsedSeconds)}
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Pause / Resume */}
            {activeSession.status === 'paused' ? (
              <button
                onClick={() => resumeSession()}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                title={language === 'bn' ? 'চালিয়ে যান' : 'Resume'}
                aria-label="Resume"
              >
                <Play className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                onClick={() => pauseSession()}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
                title={language === 'bn' ? 'স্থগিত' : 'Pause'}
                aria-label="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            {/* Break / Return */}
            {!isBreak ? (
              <button
                onClick={() => setIsBreakModalOpen(true)}
                className="p-2 rounded-xl bg-amber-400/30 hover:bg-amber-400/40 text-amber-200 transition-all active:scale-95 hidden xs:flex items-center gap-1 text-xs font-semibold"
                title={language === 'bn' ? 'বিরতি নিন' : 'Take Break'}
              >
                <Coffee className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'bn' ? 'বিরতি' : 'Break'}</span>
              </button>
            ) : null}

            {/* Stop & Save */}
            <button
              onClick={() => stopSession()}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shadow-sm"
              title={language === 'bn' ? 'থামুন ও সেভ করুন' : 'Stop & Save'}
            >
              <Square className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">{language === 'bn' ? 'শেষ' : 'Stop'}</span>
            </button>

            {/* Go to full timer on Today page */}
            {pathname !== '/' && (
              <Link
                href="/"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                title={language === 'bn' ? 'আজকের পেজে যান' : 'Go to Today page'}
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <BreakModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
      />
    </>
  );
};
