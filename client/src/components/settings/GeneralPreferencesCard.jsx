import React, { useState } from 'react';
import { Sliders, DollarSign, Layers, CheckCircle2 } from 'lucide-react';
import { userService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function GeneralPreferencesCard() {
  const { user, isGuest, updateUser } = useAuth();
  const toast = useToast();

  const [currency, setCurrency] = useState(user?.currencyPreference || 'NPR');
  const [defaultSplit, setDefaultSplit] = useState('EQUAL');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isGuest) {
      toast.warning('Please log in to save preferences.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await userService.updatePreferences({
        currencyPreference: currency,
      });

      if (res?.success) {
        updateUser?.({ currencyPreference: currency });
        toast.success('App preferences updated successfully');
      } else {
        toast.error(res?.message || 'Failed to update preferences');
      }
    } catch (err) {
      toast.error(err?.message || 'Error updating preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">General Preferences</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Localization & Splits</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            System Accounting Currency
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="NPR">NPR - Nepalese Rupee (Rs.) [Paisa Precision]</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Standard currency for integer paisa balance calculation and settlement reports.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Default Expense Split Mode
          </label>
          <div className="relative">
            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={defaultSplit}
              onChange={(e) => setDefaultSplit(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="EQUAL">Equal Split (Evenly distributed among participants)</option>
              <option value="EXACT">Exact Amount Split (Manual per-person entries)</option>
              <option value="PERCENTAGE">Percentage Share Split (Summing to 100%)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
