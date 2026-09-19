import React from 'react';
import { Navbar } from '../components/layout/Navbar';

export function AuthLayout({ children, onNavigateHome }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#eaedf2] dark:bg-[#080e1a] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar onNavigateHome={onNavigateHome} />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
        {children}
      </main>
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>SettleX BCA 8th Semester Final Project — Tribhuvan University System</div>
          <div>Strict OOP Backend • Zero Floating Precision Loss</div>
        </div>
      </footer>
    </div>
  );
}
