import React from 'react';
import { Settings } from 'lucide-react';
import { AppearanceSettingsCard } from '../../components/settings/AppearanceSettingsCard';
import { GeneralPreferencesCard } from '../../components/settings/GeneralPreferencesCard';
import { AlgorithmSettingsCard } from '../../components/settings/AlgorithmSettingsCard';
import { NotificationSettingsCard } from '../../components/settings/NotificationSettingsCard';
import { DataExportCard } from '../../components/settings/DataExportCard';
import { SecuritySessionsCard } from '../../components/settings/SecuritySessionsCard';
import { DangerZoneCard } from '../../components/settings/DangerZoneCard';

export function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Settings & Preferences
          </h1>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure accounting rules, visual themes, integer paisa precision, notifications, and
          export tools
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <AppearanceSettingsCard />
          <GeneralPreferencesCard />
          <AlgorithmSettingsCard />
          <DataExportCard />
          <DangerZoneCard />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <SecuritySessionsCard />
          <NotificationSettingsCard />
        </div>
      </div>
    </div>
  );
}
