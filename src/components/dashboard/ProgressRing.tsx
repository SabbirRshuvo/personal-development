'use client';

import React from 'react';
import { toBanglaNumber } from '@/lib/utils/bangla';

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  completed,
  total,
  size = 110,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-stone-100 dark:text-stone-800"
          fill="transparent"
        />
        {/* Progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-emerald-500 transition-all duration-700 ease-out"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">
          %{toBanglaNumber(percentage)}
        </span>
        <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
          {toBanglaNumber(completed)}/{toBanglaNumber(total)} সম্পন্ন
        </span>
      </div>
    </div>
  );
};
