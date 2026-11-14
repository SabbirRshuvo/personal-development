'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  PhoneOff,
  EyeOff,
  Droplets,
  Activity,
  CheckSquare,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { toBanglaNumber, getTodayDateString } from '@/lib/utils/bangla';
import confetti from 'canvas-confetti';

export default function UrgeHelpPage() {
  const { addUrgeLog } = useData();

  // 10-minute countdown: 600 seconds
  const INITIAL_SECONDS = 600;
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isSafeConfirmed, setIsSafeConfirmed] = useState(false);

  // Breathing guidance: 4s inhale, 4s hold, 6s exhale (14s total cycle)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(4);

  // Post 10-min intensity rating
  const [postIntensity, setPostIntensity] = useState<number | null>(null);

  // Checklist items
  const [checklist, setChecklist] = useState({
    phone: false,
    browsing: false,
    wudu: false,
    exercise: false,
    smallTask: false,
    messagePerson: false,
  });

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setHasCompleted(true);
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#3b82f6', '#10b981'],
        });
      } catch {}
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  // Breathing animation cycle
  useEffect(() => {
    if (!isActive) return;

    let timer: any;
    let currentPhase: 'inhale' | 'hold' | 'exhale' = 'inhale';
    let phaseSeconds = 4;

    const runBreath = () => {
      setBreathCount(phaseSeconds);

      timer = setInterval(() => {
        setBreathCount((c) => {
          if (c > 1) {
            return c - 1;
          }

          // Switch phase
          if (currentPhase === 'inhale') {
            currentPhase = 'hold';
            setBreathPhase('hold');
            phaseSeconds = 4;
            return 4;
          } else if (currentPhase === 'hold') {
            currentPhase = 'exhale';
            setBreathPhase('exhale');
            phaseSeconds = 6;
            return 6;
          } else {
            currentPhase = 'inhale';
            setBreathPhase('inhale');
            phaseSeconds = 4;
            return 4;
          }
        });
      }, 1000);
    };

    runBreath();
    return () => clearInterval(timer);
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(INITIAL_SECONDS);
    setHasCompleted(false);
    setPostIntensity(null);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSecs = secondsLeft % 60;
  const formattedMinutes = toBanglaNumber(minutes);
  const formattedSecs = remainingSecs < 10 ? `০${toBanglaNumber(remainingSecs)}` : toBanglaNumber(remainingSecs);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmSafe = async () => {
    setIsSafeConfirmed(true);
    await addUrgeLog({
      date: getTodayDateString(),
      occurred: true,
      intensity: 3,
      time_of_day: 'জরুরি মোড ১০ মিনিট সফল',
      trigger: 'stress',
      recovery_action: '১০ মিনিটের কাউন্টডাউন ও শ্বাস-প্রশ্বাসের মাধ্যমে urge অতিক্রম করেছে।',
      private_note: 'নিরাপদে সফলভাবে ১০ মিনিট পার করেছে।',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* 1. Calm Header Banner */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 dark:from-stone-900 dark:to-emerald-950 p-6 sm:p-8 rounded-3xl text-white text-center shadow-lg relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
            <ShieldAlert className="w-4 h-4 text-rose-300" />
            <span>শান্ত ও মনোযোগী জরুরি মোড</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
            এই urge স্থায়ী নয়—পরের ১০ মিনিট পার করো।
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed pt-1">
            তাড়না একটি তরঙ্গের মতো। এটি শিখরে ওঠে এবং কয়েক মিনিটের মধ্যে মিলিয়ে যায়। তুমি একাকী নও,
            এখন শুধু শান্ত হয়ে পরের কয়েক মিনিট পার করো।
          </p>
        </div>
      </div>

      {/* 2. Interactive 10-Minute Countdown & Breathing Guidance */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 text-center space-y-6 shadow-xs">
        {/* Breathing Guidance Circle */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
              isActive
                ? breathPhase === 'inhale'
                  ? 'bg-blue-500/10 border-4 border-blue-500 scale-105'
                  : breathPhase === 'hold'
                  ? 'bg-amber-500/10 border-4 border-amber-500 scale-105'
                  : 'bg-emerald-500/10 border-4 border-emerald-500 scale-95'
                : 'bg-stone-50 dark:bg-stone-800/80 border-4 border-emerald-500/30'
            }`}
          >
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-stone-900 dark:text-stone-100">
              {formattedMinutes}:{formattedSecs}
            </span>

            {isActive ? (
              <div className="mt-2 text-center animate-in fade-in">
                <span className="text-xs font-bold uppercase tracking-wider block text-emerald-700 dark:text-emerald-400">
                  {breathPhase === 'inhale' && 'শ্বাস নাও (Inhale)'}
                  {breathPhase === 'hold' && 'ধরে রাখো (Hold)'}
                  {breathPhase === 'exhale' && 'ধীরে ছাড়ো (Exhale)'}
                </span>
                <span className="text-lg font-black text-stone-600 dark:text-stone-300">
                  {toBanglaNumber(breathCount)}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mt-2">
                ১০ মিনিটের টাইমার
              </span>
            )}
          </div>

          {/* Breathing Text Guide */}
          <div className="mt-4 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 max-w-md">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">শ্বাস-প্রশ্বাস: </span>
            ৪ সেকেন্ড শ্বাস নাও, ৪ সেকেন্ড ধরে রাখো, ৬ সেকেন্ডে ছাড়ো
          </div>

          {hasCompleted && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-sm font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>অসাধারণ! তুমি সফলভাবে পুরো ১০ মিনিট পার করেছো। তাড়না এখন অনেকটাই স্তিমিত।</span>
            </div>
          )}
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          {!isActive && secondsLeft === INITIAL_SECONDS ? (
            <button
              onClick={toggleTimer}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>১০ মিনিট শুরু করি</span>
            </button>
          ) : (
            <>
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-sm active:scale-95 transition-all"
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isActive ? 'পজ করুন' : 'চালিয়ে যান'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-3 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
                title="রিসেট"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Confirmation button */}
          <button
            onClick={handleConfirmSafe}
            disabled={isSafeConfirmed}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
              isSafeConfirmed
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isSafeConfirmed ? 'লগ নিশ্চিত হয়েছে ✓' : 'আমি safe আছি, ১০ মিনিট পার করছি'}</span>
          </button>
        </div>
      </div>

      {/* 3. Quick Actions Checklist */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <span>তাৎক্ষণিক অ্যাকশন চেকলিস্ট</span>
          <span className="text-xs font-normal text-stone-500">(ক্লিক করে টিক দিন)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: 'phone',
              label: '১. ফোনটি অন্য ঘরে বা ড্রয়ারে রাখো',
              icon: PhoneOff,
              checked: checklist.phone,
            },
            {
              id: 'browsing',
              label: '২. Private / Incognito browsing বন্ধ করো',
              icon: EyeOff,
              checked: checklist.browsing,
            },
            {
              id: 'wudu',
              label: '৩. ওযু করো বা ঠান্ডা পানি দিয়ে মুখ ধুয়ে নাও',
              icon: Droplets,
              checked: checklist.wudu,
            },
            {
              id: 'exercise',
              label: '৪. ১০ মিনিট হাঁটো বা ২০টি push-up দাও',
              icon: Activity,
              checked: checklist.exercise,
            },
            {
              id: 'smallTask',
              label: '৫. আজকের সবচেয়ে ছোট pending task খুলে ১০ মিনিট কাজ করো',
              icon: CheckSquare,
              checked: checklist.smallTask,
            },
            {
              id: 'messagePerson',
              label: '৬. একজন trusted person বা বন্ধুকে মেসেজ দাও',
              icon: MessageSquare,
              checked: checklist.messagePerson,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id as keyof typeof checklist)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  item.checked
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 hover:border-emerald-200 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    item.checked
                      ? 'bg-emerald-600 text-white'
                      : 'border border-stone-300 dark:border-stone-600 text-stone-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-semibold ${item.checked ? 'line-through text-emerald-700 dark:text-emerald-400' : ''}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Reminder of Long-Term Goals ("আজকের লক্ষ্য মনে করো") */}
      <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-white dark:from-blue-950/30 dark:via-purple-950/20 dark:to-stone-900 p-5 sm:p-6 rounded-3xl border border-blue-200/60 dark:border-blue-900/40 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>আজকের মূল লক্ষ্য মনে করো</span>
        </div>
        <p className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-relaxed">
          &ldquo;তুমি স্বাধীনভাবে কাজ করা, skill বাড়ানো, client পাওয়া এবং নিজের জীবন গুছানোর জন্য কাজ করছো। একটি ক্ষণস্থায়ী প্রলোভন তোমার এই মহান স্বপ্নকে ধ্বংস করতে পারবে না।&rdquo;
        </p>
      </div>

      {/* 5. Post 10-Minute Reflection & Safety Evaluation */}
      <div className="bg-white dark:bg-[#1a1917] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
          ১০ মিনিট পর চেক-ইন: urge এখন কতটা অনুভূত হচ্ছে? (১ থেকে ৫)
        </h3>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              onClick={() => setPostIntensity(val)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm border transition-all ${
                postIntensity === val
                  ? val <= 2
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              {toBanglaNumber(val)}
            </button>
          ))}
        </div>

        {postIntensity !== null && (
          <div className="p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed transition-all">
            {postIntensity <= 2 ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span>
                  আলহামদুলিল্লাহ! তীব্রতা অনেক কমে এসেছে। এখন সোজা নিজের টেবিলে গিয়ে একটি কাজ শুরু করো।
                </span>
                <Link
                  href="/"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shrink-0 ml-2"
                >
                  কাজে ফিরুন →
                </Link>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-3.5 rounded-xl border border-amber-200 space-y-2">
                <p className="font-bold">
                  তীব্রতা এখনো বেশি অনুভূত হচ্ছে। ঘরের দরজা খুলে ফেলো অথবা পরিবারের কাছে বা কোনো পাবলিক জায়গায় চলে যাও।
                </p>
                <p className="text-xs">
                  একা ঘরে থাকা ঝুঁকিপূর্ণ। ফোন বা ল্যাপটপ বন্ধ করে বাইরে ৫-১০ মিনিট হেঁটে আসো এবং কোনো বিশ্বস্ত বন্ধুকে ফোন করো।
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
