import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';

export function GroupSelector({ groups = [], selectedGroupId, onSelectGroup }) {
  if (!groups || groups.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {groups.map((grp) => {
        const grpId = grp.id || grp._id;
        const isSelected = String(grpId) === String(selectedGroupId);

        return (
          <button
            key={grpId}
            type="button"
            onClick={() => onSelectGroup(grpId)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              isSelected
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
            <span>{grp.name || grp.title}</span>
            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
