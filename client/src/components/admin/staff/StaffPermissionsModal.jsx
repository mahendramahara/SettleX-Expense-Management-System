import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AVAILABLE_PERMISSIONS } from './staff.constants';

export function StaffPermissionsModal({ staff, onClose, onSave }) {
  const [permissions, setPermissions] = useState(staff?.permissions || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePermission = (permId) => {
    if (permId === '*') {
      setPermissions(permissions.includes('*') ? [] : ['*']);
      return;
    }
    setPermissions((prev) => {
      const withoutAll = prev.filter((p) => p !== '*');
      return withoutAll.includes(permId)
        ? withoutAll.filter((p) => p !== permId)
        : [...withoutAll, permId];
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave(permissions);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0e172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delegated Permissions
            </h3>
            <p className="text-xs text-slate-400">Target: {staff?.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const isSelected = permissions.includes(perm.id);
              return (
                <label
                  key={perm.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePermission(perm.id)}
                    className="mt-0.5 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block leading-tight">{perm.label}</span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                      {perm.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-xl shadow-xs transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
