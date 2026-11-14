'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#1a1917] rounded-2xl border border-stone-200/80 dark:border-stone-800/80 p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      {children}
    </div>
  );
};
