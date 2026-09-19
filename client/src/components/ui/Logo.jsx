import React from 'react';
import logoImg from '../../assets/icons/logo.png';

export function Logo({
  size = 'md',
  className = '',
  onClick,
  showText = true,
  subtitle = null,
  badgeClassName = '',
  textColor = '',
}) {
  const sizeClasses = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const iconSizes = {
    xs: 'w-6 h-6 rounded-lg p-0.5',
    sm: 'w-7 h-7 rounded-lg p-1',
    md: 'w-9 h-9 rounded-xl p-1',
    lg: 'w-11 h-11 rounded-2xl p-1.5',
    xl: 'w-16 h-16 rounded-2xl p-2',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${
        onClick ? 'cursor-pointer group transition-transform active:scale-98' : ''
      } ${className}`}
    >
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#0a152e] to-slate-950 border border-slate-700/60 dark:border-blue-500/30 shadow-md shadow-blue-950/25 shrink-0 transition-transform group-hover:scale-105 ${
          iconSizes[size] || iconSizes.md
        } ${badgeClassName}`}
      >
        <img
          src={logoImg}
          alt="SettleX Logo"
          className="w-full h-full object-contain filter drop-shadow-sm select-none"
        />
      </div>

      <div
        className={`flex flex-col text-left leading-none whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
          showText
            ? 'max-w-44 opacity-100 translate-x-0'
            : 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
        }`}
      >
        <div className={`flex items-baseline ${sizeClasses[size] || sizeClasses.md}`}>
          <span
            className={`font-black tracking-tight ${textColor || 'text-slate-900 dark:text-white'}`}
          >
            Settle
          </span>
          <span className="font-black text-accent-main">X</span>
        </div>
        {subtitle && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-accent-main mt-1 block truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default Logo;
