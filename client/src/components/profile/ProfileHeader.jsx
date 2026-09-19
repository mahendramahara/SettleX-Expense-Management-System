import React from 'react';
import { User, Mail, ShieldCheck, ShieldAlert, Sparkles, Edit3, Calendar } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function ProfileHeader({ user, onEditClick }) {
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Active Member';

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative">
          <Avatar
            name={user?.name || 'User'}
            size="xl"
            className="w-20 h-20 text-2xl font-black shadow-md shadow-primary/20"
          />
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-900 shadow-xs">
            {user?.isVerified ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {user?.name || 'User'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 capitalize">
              {user?.tier || 'Student'} Tier
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
              {user?.role || 'User'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user?.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Member since {memberSince}
            </span>
          </div>

          {user?.bio && (
            <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 max-w-xl">{user.bio}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onEditClick}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-98 transition-all shrink-0 cursor-pointer self-start md:self-auto"
      >
        <Edit3 className="w-4 h-4" />
        Edit Profile
      </button>
    </div>
  );
}
