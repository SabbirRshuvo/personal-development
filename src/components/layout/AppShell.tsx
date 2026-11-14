'use client';

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#121110]">
      <Header />
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <Sidebar />
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 pb-24 md:pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
