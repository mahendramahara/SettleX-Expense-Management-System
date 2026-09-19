import React, { useState, useRef, useEffect } from 'react';
import { Type, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function FontSwitcher({ className = '' }) {
  const { activeFont, setActiveFont, fonts } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentFont = fonts.find((f) => f.id === activeFont) || fonts[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Change application typography"
      >
        <Type className="w-3.5 h-3.5 text-slate-400" />
        <span>{currentFont.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Font
          </div>
          {fonts.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => {
                setActiveFont(font.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                font.className
              } ${
                activeFont === font.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-primary font-semibold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{font.name}</span>
              {activeFont === font.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
