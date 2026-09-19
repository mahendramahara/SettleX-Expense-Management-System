import React from 'react';
import { Scale } from 'lucide-react';

export function AdminPromoCard({
  totalGroups = '12+',
  totalUsers = '248',
  totalExpenses = 'Rs. 582K',
  className = '',
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/90 shadow-md flex flex-col justify-between min-h-[260px] text-white h-full ${className}`}
    >
      <img
        src="/images/himalayan_mountain.jpg"
        alt="Himalayan Mountain Twilight"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-transform duration-700 hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/40 z-1" />

      <div className="relative z-10 p-5 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/30 backdrop-blur-xs text-white border border-primary/40 flex items-center justify-center shadow-md">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight block leading-none drop-shadow-md">
              SettleX
            </span>
            <span className="text-[10px] text-blue-200 font-semibold block mt-0.5 drop-shadow-sm">
              Smarter Splits. Fairer Settlements.
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-200 max-w-xs leading-relaxed pt-1 drop-shadow-sm">
          Manage group expenses, track balances and get optimized settlement suggestions - all in
          one place.
        </p>
      </div>

      <div className="relative z-10 p-4 border-t border-white/15 bg-slate-950/40 backdrop-blur-xs grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-base sm:text-lg font-black text-white drop-shadow-sm">
            {totalGroups}
          </div>
          <div className="text-[10px] text-slate-300 font-medium">Total Groups</div>
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-white drop-shadow-sm">
            {totalUsers}
          </div>
          <div className="text-[10px] text-slate-300 font-medium">Total Users</div>
        </div>
        <div>
          <div className="text-base sm:text-lg font-black text-white drop-shadow-sm">
            {totalExpenses}
          </div>
          <div className="text-[10px] text-slate-300 font-medium">Total Expenses</div>
        </div>
      </div>
    </div>
  );
}
