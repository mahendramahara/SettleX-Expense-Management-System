import React from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle2,
  Building,
  Key,
} from 'lucide-react';

export default function AdminProfileHeaderCard({ profile = {}, onEditClick }) {
  const isSuperAdmin = profile?.role === 'superadmin';
  const name = profile?.name || 'Administrator';
  const email = profile?.email || 'admin@settlex.com';
  const phone = profile?.phone || '+977 9801234567';
  const designation =
    profile?.designation ||
    (isSuperAdmin ? 'Root SuperAdmin & Lead Architect' : 'System Administrator');
  const location = profile?.location || 'Kathmandu, Nepal';
  const initial = name.charAt(0).toUpperCase();

  const joinedFormatted = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Sep 2024';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Top Banner Gradient Background */}
      <div className="h-28 sm:h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="absolute top-3.5 right-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Active & Verified</span>
          </span>
        </div>
      </div>

      {/* Profile Details Container */}
      <div className="px-5 sm:px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
          {/* Avatar and Primary Identity */}
          <div className="flex items-end gap-4">
            <div className="relative shrink-0">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-[#0e172a] shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-blue-600 to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center ring-4 ring-white dark:ring-[#0e172a] shadow-lg shadow-blue-500/20">
                  {initial}
                </div>
              )}
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#0e172a]"
                title="Account Active"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isSuperAdmin
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                  }`}
                >
                  {isSuperAdmin ? 'Root SuperAdmin' : 'Administrator'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 leading-tight">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{designation}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>Edit Profile Details</span>
            </button>
          )}
        </div>

        {/* Bio paragraph if exists */}
        {profile?.bio && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 max-w-3xl leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Contact & Location Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Official Email
              </span>
              <span className="font-semibold text-slate-900 dark:text-white truncate block text-xs">
                {email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Direct Line
              </span>
              <span className="font-semibold text-slate-900 dark:text-white truncate block font-mono text-xs">
                {phone}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Regional Hub
              </span>
              <span className="font-semibold text-slate-900 dark:text-white truncate block text-xs">
                {location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Induction Date
              </span>
              <span className="font-semibold text-slate-900 dark:text-white truncate block text-xs">
                {joinedFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
