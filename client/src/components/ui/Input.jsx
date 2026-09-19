import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
  prefixIcon: PrefixIcon,
  suffixIcon: SuffixIcon,
  suffixAction,
  showPasswordToggle = true,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasSuffix = SuffixIcon || (isPassword && showPasswordToggle) || suffixAction;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {PrefixIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <PrefixIcon className="h-4 w-4" />
          </div>
        )}
        <input
          id={id}
          type={effectiveType}
          className={`block w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            PrefixIcon ? 'pl-9' : ''
          } ${hasSuffix ? 'pr-10' : ''} ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500'
              : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          {...props}
        />
        {isPassword && showPasswordToggle ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : suffixAction ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {suffixAction}
          </div>
        ) : SuffixIcon ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <SuffixIcon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
