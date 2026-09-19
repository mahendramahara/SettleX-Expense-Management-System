import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DEMO from '../../demo/data.json';

// Modular settings components
import PlatformGovernanceCard from '../../components/admin/settings/PlatformGovernanceCard';
import SecurityGovernanceCard from '../../components/admin/settings/SecurityGovernanceCard';
import AnomalyGovernanceCard from '../../components/admin/settings/AnomalyGovernanceCard';
import SystemMaintenanceCard from '../../components/admin/settings/SystemMaintenanceCard';
import AdminProfileSecurityCard from '../../components/admin/settings/AdminProfileSecurityCard';

export function AdminSettingsPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);

  const canEdit = currentAdmin?.role === 'superadmin' || currentAdmin?.role === 'admin';

  // Load platform settings from backend
  const fetchSettings = useCallback(async () => {
    if (isGuest) {
      setSettings(DEMO.admin.settings);
      setOriginalSettings(JSON.parse(JSON.stringify(DEMO.admin.settings)));
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await settingsService.getSettings();
      if (res && res.data) {
        setSettings(res.data);
        setOriginalSettings(JSON.parse(JSON.stringify(res.data)));
      } else {
        setSettings(DEMO.admin.settings);
        setOriginalSettings(JSON.parse(JSON.stringify(DEMO.admin.settings)));
      }
    } catch (err) {
      console.warn('Failed to fetch settings from API, using demo settings', err);
      setSettings(DEMO.admin.settings);
      setOriginalSettings(JSON.parse(JSON.stringify(DEMO.admin.settings)));
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Patch top-level settings object
  const handleSettingsChange = (patch) => {
    setSettings((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  // Determine if there are unsaved edits
  const isDirty = useMemo(() => {
    if (!settings || !originalSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  // Save changes to backend
  const handleSave = async () => {
    if (!isDirty || isSaving || !canEdit) return;
    if (isGuest) {
      toast.warning('Platform governance updates are disabled in guest preview mode.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await settingsService.updateSettings(settings);
      if (res && res.success) {
        setSettings(res.data);
        setOriginalSettings(JSON.parse(JSON.stringify(res.data)));
        toast.success(res.message || 'Platform governance settings updated successfully.');
      } else {
        throw new Error(res?.message || 'Failed to update settings');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating platform settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleReset = () => {
    if (!originalSettings) return;
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    toast.info('Settings reverted to saved state.');
  };

  // Handle password modification
  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    if (isGuest) {
      toast.warning('Administrator password modification is disabled in guest preview mode.');
      return false;
    }

    try {
      setIsChangingPassword(true);
      const res = await settingsService.changePassword({ currentPassword, newPassword });
      if (res && res.success) {
        toast.success(res.message || 'Administrator password updated successfully.');
        return true;
      } else {
        throw new Error(res?.message || 'Failed to change password');
      }
    } catch (err) {
      toast.error(err.message || 'Password update failed.');
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Subcomponent notifications (e.g., password change, maintenance action)
  const handleSubcomponentNotify = ({ type, message }) => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Loading governance parameters...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header bar matching admin design standard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                System Governance & Settings
              </h1>
              {isDirty && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 animate-pulse">
                  Unsaved Edits
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control financial settlement engines, security guardrails, risk rule parameters, and
              operational modes
            </p>
          </div>
        </div>

        {/* Global Save / Reset Action Controls */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving || !canEdit}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer ${
              isDirty && canEdit
                ? 'bg-primary hover:bg-primary/90 text-white hover:shadow-md active:scale-95'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Platform Governance, Anomaly Detection & System Maintenance */}
        <div className="lg:col-span-7 space-y-5">
          <PlatformGovernanceCard
            settings={settings}
            onChange={handleSettingsChange}
            canEdit={canEdit}
          />

          <AnomalyGovernanceCard
            settings={settings}
            onChange={handleSettingsChange}
            canEdit={canEdit}
          />

          <SystemMaintenanceCard
            settings={settings}
            onChange={handleSettingsChange}
            canEdit={canEdit}
            onNotify={handleSubcomponentNotify}
          />
        </div>

        {/* Right Column: Admin Profile Credentials & Security Guardrails */}
        <div className="lg:col-span-5 space-y-5">
          <AdminProfileSecurityCard
            currentAdmin={currentAdmin}
            onChangePassword={handleChangePassword}
            isChangingPassword={isChangingPassword}
          />

          <SecurityGovernanceCard
            settings={settings}
            onChange={handleSettingsChange}
            canEdit={canEdit}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
