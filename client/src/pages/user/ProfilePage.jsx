import React, { useState, useEffect, useCallback } from 'react';
import { User, RotateCw } from 'lucide-react';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileOverviewCard } from '../../components/profile/ProfileOverviewCard';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ChangePasswordCard } from '../../components/profile/ChangePasswordCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/index.js';

export function ProfilePage() {
  const { user, isGuest, updateUser } = useAuth();
  const toast = useToast();

  const [profileUser, setProfileUser] = useState(user);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (isGuest) {
      setProfileUser(user);
      return;
    }

    try {
      const res = await userService.getMe();
      const userData = res?.data?.user || res?.user || res?.data;
      if (userData) {
        setProfileUser(userData);
        updateUser?.(userData);
      }
    } catch {
      setProfileUser(user);
    } finally {
      setIsRefreshing(false);
    }
  }, [isGuest, user, updateUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfile();
    toast.info('Profile details refreshed');
  };

  const handleSaveProfile = async (updates) => {
    if (isGuest) {
      const updated = { ...profileUser, ...updates };
      setProfileUser(updated);
      updateUser?.(updated);
      setIsEditOpen(false);
      toast.success('Profile updated in demo session');
      return;
    }

    setIsSaving(true);
    try {
      const res = await userService.updateProfile(updates);
      const updated = res?.data?.user || res?.user || updates;
      setProfileUser((prev) => ({ ...prev, ...updated }));
      updateUser?.(updated);
      setIsEditOpen(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              User Profile
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your personal identity, contact details, currency choices, and credentials
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isGuest && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh Profile"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <ProfileHeader
        user={profileUser}
        onEditClick={() => {
          if (isGuest) {
            toast.warning('Please log in to edit your profile.');
            return;
          }
          setIsEditOpen(true);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ProfileOverviewCard user={profileUser} />
        </div>

        <div className="lg:col-span-5">
          <ChangePasswordCard isGuest={isGuest} />
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={profileUser}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </div>
  );
}
