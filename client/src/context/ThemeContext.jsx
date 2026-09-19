import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const FONTS = [
  { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", className: 'font-outfit' },
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", className: 'font-inter' },
  {
    id: 'jakarta',
    name: 'Plus Jakarta',
    family: "'Plus Jakarta Sans', sans-serif",
    className: 'font-jakarta',
  },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", className: 'font-roboto' },
];

const ACCENTS = [
  {
    id: 'emerald',
    name: 'Emerald',
    color: '#059669',
    hoverColor: '#047857',
    lightColor: '#d1fae5',
    ringColor: 'rgba(5, 150, 105, 0.35)',
    bgClass: 'bg-emerald-600',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    color: '#4f46e5',
    hoverColor: '#4338ca',
    lightColor: '#e0e7ff',
    ringColor: 'rgba(79, 70, 229, 0.35)',
    bgClass: 'bg-indigo-600',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    color: '#2563eb',
    hoverColor: '#1d4ed8',
    lightColor: '#dbeafe',
    ringColor: 'rgba(37, 99, 235, 0.35)',
    bgClass: 'bg-blue-600',
  },
  {
    id: 'amber',
    name: 'Amber Gold',
    color: '#d97706',
    hoverColor: '#b45309',
    lightColor: '#fef3c7',
    ringColor: 'rgba(217, 119, 6, 0.35)',
    bgClass: 'bg-amber-600',
  },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('settlex_theme') || 'dark';
  });

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('settlex_accent') || 'emerald';
  });

  const [activeFont, setActiveFont] = useState(() => {
    return localStorage.getItem('settlex_font') || 'outfit';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', theme);
    localStorage.setItem('settlex_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    if (document.body) {
      document.body.setAttribute('data-accent', accent);
    }
    const found = ACCENTS.find((a) => a.id === accent) || ACCENTS[0];
    root.style.setProperty('--primary-color', found.color);
    root.style.setProperty('--primary-hover', found.hoverColor);
    root.style.setProperty('--primary-light', found.lightColor);
    root.style.setProperty('--primary-ring', found.ringColor);
    localStorage.setItem('settlex_accent', accent);
  }, [accent]);

  useEffect(() => {
    const found = FONTS.find((f) => f.id === activeFont) || FONTS[0];
    const root = document.documentElement;

    root.style.setProperty('--font-current', found.family);
    root.style.fontFamily = found.family;
    if (document.body) {
      document.body.style.fontFamily = found.family;
      FONTS.forEach((f) => {
        document.body.classList.remove(f.className);
        root.classList.remove(f.className);
      });
      document.body.classList.add(found.className);
      root.classList.add(found.className);
    }
    root.setAttribute('data-font', activeFont);
    if (document.body) {
      document.body.setAttribute('data-font', activeFont);
    }
    localStorage.setItem('settlex_font', activeFont);
  }, [activeFont]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        accent,
        setAccent,
        accents: ACCENTS,
        activeFont,
        setActiveFont,
        fonts: FONTS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
