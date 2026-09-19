import React, { useState } from 'react';
import { GitFork, ShieldCheck, Zap, Scale, PlayCircle } from 'lucide-react';
import { LoginForm } from '../../components/auth/LoginForm';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function LandingPage({ onOpenOtp, onOpenForgotPassword }) {
  const { loginAsGuest } = useAuth();
  const toast = useToast();
  const [authView, setAuthView] = useState('login');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center py-2 lg:py-6">
      <div className="lg:col-span-7 space-y-6 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <GitFork className="w-3.5 h-3.5" />
          <span>BCA 8th Semester Final Year Project</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Intelligent Group Expenses &{' '}
          <span className="text-primary underline decoration-primary/30 decoration-wavy">
            Debt Settlement
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          SettleX transforms chaotic group expenses into mathematical clarity. Using Greedy Minimum
          Cash Flow and Graph-Based Cycle Cancellation, it eliminates circular debts and minimizes
          cross-member transactions without precision loss.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-1.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <Scale className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold">Paisa Precision</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Integer arithmetic, zero rounding errors.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-1.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <Zap className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-bold">Greedy Cash Flow</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Minimizes debt transfers automatically.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-1.5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold">TTL OTP Security</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              6-digit codes, single-use eviction.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-1.5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
            <GitFork className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs font-bold">Cycle Cancellation</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Graph-based circular debt elimination.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              loginAsGuest();
              toast.success(
                'Demo Mode Active',
                'Exploring SettleX with sample Nepali group data. Sign up to use the real app.'
              );
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            Try Live Demo
          </button>
          <span className="text-xs text-slate-400">No account required</span>
        </div>
      </div>

      <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
        {authView === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setAuthView('register')}
            onOpenForgotPassword={onOpenForgotPassword}
            onRequiresVerification={(email) => onOpenOtp?.(email)}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setAuthView('login')}
            onRegistered={(email) => onOpenOtp?.(email)}
          />
        )}
      </div>
    </div>
  );
}
