import React from 'react';
import { Palette, Sun, Moon, Type, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

export function AppearanceSettingsCard() {
  const { theme, setTheme, accent, setAccent, activeFont, setActiveFont, fonts, accents } =
    useTheme();
  const toast = useToast();

  const handleThemeChange = (mode) => {
    setTheme(mode);
    toast.info(`Theme changed to ${mode} mode`);
  };

  const handleAccentChange = (accId, accName) => {
    setAccent(accId);
    toast.info(`Color accent set to ${accName}`);
  };

  const handleFontChange = (fontId, fontName) => {
    setActiveFont(fontId);
    toast.info(`Typography switched to ${fontName}`);
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Appearance & Interface
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Visual Design</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Theme Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Accent Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {accents.map((acc) => {
              const isSelected = accent === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleAccentChange(acc.id, acc.name)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 dark:border-white shadow-xs bg-slate-50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div
                    style={{ backgroundColor: acc.color }}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="truncate">{acc.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Typography Family
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {fonts.map((f) => {
              const isSelected = activeFont === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFontChange(f.id, f.name)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate" style={{ fontFamily: f.family }}>
                    {f.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
