import React, { useState, useEffect, useCallback } from 'react';
import { User, Shield, KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { settingsService } from '../../services/settings.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Modular profile components
import AdminProfileHeaderCard from '../../components/admin/profile/AdminProfileHeaderCard';
import AdminProfileEditCard from '../../components/admin/profile/AdminProfileEditCard';
import AdminSecurityCredentialsCard from '../../components/admin/profile/AdminSecurityCredentialsCard';
import AdminPrivilegesCard from '../../components/admin/profile/AdminPrivilegesCard';
import DEMO from '../../demo/data.json';

export function AdminProfilePage() {
  const { user: authUser, isGuest, updateUser } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profile, setProfile] = useState(null);

  // Load profile from backend or fallback to demo
  const fetchProfile = useCallback(async () => {
    if (isGuest) {
      setProfile(DEMO.admin?.profile || authUser);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await adminService.getProfile();
      if (res && res.data && res.data.admin) {
        setProfile(res.data.admin);
      } else if (authUser) {
        setProfile(authUser);
      }
    } catch (err) {
      console.warn('Failed to load profile via API, using authenticated session user', err);
      if (authUser) {
        setProfile(authUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, [authUser, isGuest]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle profile updates (name, email, phone, designation, bio, etc.)
  const handleSaveProfile = async (formData) => {
    if (isGuest) {
      toast.warning('Profile modifications are disabled in guest preview mode.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await adminService.updateProfile(formData);
      if (res && res.success && res.data && res.data.admin) {
        const updated = res.data.admin;
        setProfile(updated);
        // Synchronize with AuthContext so the header and navigation immediately update
        if (updateUser) {
          updateUser(updated);
        }
        toast.success(res.message || 'Administrator profile updated successfully.');
      } else {
        throw new Error(res?.message || 'Failed to update administrator profile.');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password changes
  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    if (isGuest) {
      toast.warning('Password updates are disabled in guest preview mode.');
      return false;
    }

    try {
      setIsChangingPassword(true);
      const res = await settingsService.changePassword({ currentPassword, newPassword });
      if (res && res.success) {
        toast.success(res.message || 'Password changed successfully.');
        return true;
      } else {
        throw new Error(res?.message || 'Failed to change password.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
      return false;
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Loading administrative profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Administrator Profile & Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage personal credentials, institutional coordinates, RBAC permissions, and session
              credentials
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchProfile}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Profile</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <AdminProfileHeaderCard profile={profile} />

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Editable Form Details */}
        <div className="lg:col-span-7 space-y-5">
          <AdminProfileEditCard profile={profile} onSave={handleSaveProfile} isSaving={isSaving} />
        </div>

        {/* Right Column: Security Credentials & Privileges Scope */}
        <div className="lg:col-span-5 space-y-5">
          <AdminSecurityCredentialsCard
            onChangePassword={handleChangePassword}
            isChangingPassword={isChangingPassword}
          />

          <AdminPrivilegesCard profile={profile} />
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage;
