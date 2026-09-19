import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeSwitcher({ showAccents = true, className = '' }) {
  const { theme, toggleTheme, accent, setAccent, accents } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAccents && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {accents.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAccent(item.id)}
              title={`Switch accent to ${item.name}`}
              className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                item.bgClass
              } ${
                accent === item.id
                  ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-110'
                  : 'opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
}
