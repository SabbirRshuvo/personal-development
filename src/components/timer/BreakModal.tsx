'use client';

import React, { useState } from 'react';
import { Coffee, Utensils, Moon, Heart, Smartphone, Footprints, Sparkles, X } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { BreakType } from '@/lib/types/database';

interface BreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BREAK_OPTIONS: { type: BreakType; labelBn: string; labelEn: string; icon: React.ReactNode; color: string }[] = [
  { type: 'নামাজ', labelBn: 'নামাজ', labelEn: 'Prayer', icon: <Moon className="w-5 h-5 text-emerald-600" />, color: 'hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30' },
  { type: 'খাবার', labelBn: 'খাবার', labelEn: 'Meal / Snack', icon: <Utensils className="w-5 h-5 text-amber-600" />, color: 'hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30' },
  { type: 'বিশ্রাম', labelBn: 'বিশ্রাম', labelEn: 'Rest / Nap', icon: <Coffee className="w-5 h-5 text-indigo-600" />, color: 'hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30' },
  { type: 'হাঁটা/ব্যায়াম', labelBn: 'হাঁটা / ব্যায়াম', labelEn: 'Walk / Workout', icon: <Footprints className="w-5 h-5 text-blue-600" />, color: 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30' },
  { type: 'পরিবার', labelBn: 'পরিবার', labelEn: 'Family Time', icon: <Heart className="w-5 h-5 text-rose-600" />, color: 'hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30' },
  { type: 'Social media', labelBn: 'সোশ্যাল মিডিয়া', labelEn: 'Social Media', icon: <Smartphone className="w-5 h-5 text-purple-600" />, color: 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30' },
  { type: 'Other', labelBn: 'অন্যান্য', labelEn: 'Other', icon: <Sparkles className="w-5 h-5 text-slate-600" />, color: 'hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800' },
];

export const BreakModal: React.FC<BreakModalProps> = ({ isOpen, onClose }) => {
  const { startBreak, language } = useData();
  const [selectedType, setSelectedType] = useState<BreakType>('বিশ্রাম');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startBreak(selectedType, note.trim() || undefined);
    onClose();
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {language === 'bn' ? 'বিরতি শুরু করুন' : 'Start a Break'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'একটু জিরিয়ে নাও, ফোকাস বজায় রাখতে বিরতি দরকার' : 'Rest a bit to recharge your focus'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {language === 'bn' ? 'বিরতির ধরন বেছে নিন' : 'Select Break Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BREAK_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelectedType(opt.type)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold shadow-sm ring-1 ring-amber-400/50'
                        : `border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 ${opt.color}`
                    }`}
                  >
                    {opt.icon}
                    <span className="text-sm">
                      {language === 'bn' ? opt.labelBn : opt.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'bn' ? 'সংক্ষিপ্ত নোট (ঐচ্ছিক)' : 'Short Note (Optional)'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: আসরের নামাজ ও চা' : 'e.g. Asr prayer & tea'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              <span>{language === 'bn' ? 'বিরতি শুরু' : 'Start Break'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
