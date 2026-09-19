import React from 'react';
import logoImg from '../../assets/icons/logo.png';

export function AppLoadingScreen({ message = 'Authenticating session and preparing workspace...' }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#eaedf2] dark:bg-[#080e1a] text-slate-900 dark:text-slate-100 p-4 transition-colors">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Brand Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-3xl bg-blue-500/20 animate-ping opacity-50 pointer-events-none" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0a152e] to-slate-950 border border-slate-700/60 dark:border-blue-500/30 p-2.5 flex items-center justify-center shadow-xl shadow-blue-500/25">
            <img
              src={logoImg}
              alt="SettleX Logo"
              className="w-full h-full object-contain filter drop-shadow animate-pulse select-none"
            />
          </div>
        </div>

        {/* Brand Name & Skeleton Line */}
        <div className="space-y-1.5 w-full">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            SettleX
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {message}
          </p>
        </div>

        {/* Shimmer Progress Track */}
        <div className="w-48 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
          <div className="h-full bg-primary rounded-full animate-[shimmer_1.4s_infinite_linear] w-1/2" />
        </div>

        {/* Skeleton Card Preview */}
        <div className="w-full p-4 rounded-2xl bg-[#f7f9fb] dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            <div className="w-12 h-3 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
          <div className="w-3/4 h-2 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default AppLoadingScreen;
