import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[min(92vh,750px)] flex flex-col rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900 z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden`}
      >
        <div className="flex items-start justify-between pb-3 shrink-0 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer shrink-0 ml-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 overflow-y-auto pr-1 flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
