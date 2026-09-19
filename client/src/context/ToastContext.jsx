import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success:
    'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white',
  error:
    'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-slate-900 dark:text-white',
  warning:
    'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-slate-900 dark:text-white',
  info: 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white',
};

const ICON_STYLES = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;

  return (
    <div
      className={`flex items-start gap-3 min-w-72 max-w-sm w-full px-4 py-3.5 rounded-2xl border shadow-xl shadow-slate-900/10 dark:shadow-slate-950/40 transition-all duration-300 animate-in slide-in-from-right-4 fade-in ${STYLES[toast.type]}`}
      role="alert"
    >
      <Icon className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${ICON_STYLES[toast.type]}`} />
      <div className="flex-1 min-w-0">
        {toast.title && <div className="text-xs font-bold leading-snug">{toast.title}</div>}
        {toast.message && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
            {toast.message}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer mt-0.5"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerRefs = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timerRefs.current[id]);
    delete timerRefs.current[id];
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);

      if (duration > 0) {
        timerRefs.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const helpers = {
    success: (title, message, opts) => toast({ type: 'success', title, message, ...opts }),
    error: (title, message, opts) => toast({ type: 'error', title, message, ...opts }),
    warning: (title, message, opts) => toast({ type: 'warning', title, message, ...opts }),
    info: (title, message, opts) => toast({ type: 'info', title, message, ...opts }),
  };

  return (
    <ToastContext.Provider value={helpers}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
