import React, { useState } from 'react';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Cpu,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function AdminSecurityCredentialsCard({
  onChangePassword,
  isChangingPassword = false,
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPassword || !newPassword) {
      setStatusMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    const success = await onChangePassword({ currentPassword, newPassword });
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage({
        type: 'success',
        text: 'Administrative credentials updated successfully.',
      });
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <KeyRound className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Security & Authentication Credentials
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            Rotate master administrator key and audit active security telemetry
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2.5 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Password Change Form */}
      <form onSubmit={handleSubmitPassword} className="space-y-3.5 text-xs">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Current Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPasswords((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium cursor-pointer"
          >
            {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPasswords ? 'Hide password' : 'Show password'}</span>
          </button>

          <button
            type="submit"
            disabled={isChangingPassword || !currentPassword || !newPassword}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isChangingPassword ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Updating Key...</span>
              </>
            ) : (
              <span>Update Credentials</span>
            )}
          </button>
        </div>
      </form>

      {/* Telemetry / Session Security Overview */}
      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
        <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Active Administrative Session
        </span>
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold text-xs">Security Platform</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">Windows x64 / Chromium</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-semibold text-xs">Session Protocol</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active (Bearer JWT)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
