import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function ThemeConsumer() {
  const { theme, toggleTheme, accent, setAccent, activeFont, setActiveFont } = useTheme();
  return (
    <div>
      <div data-testid="theme-val">{theme}</div>
      <div data-testid="accent-val">{accent}</div>
      <div data-testid="font-val">{activeFont}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setAccent('indigo')}>Set Indigo</button>
      <button onClick={() => setActiveFont('jakarta')}>Set Jakarta</button>
    </div>
  );
}

describe('Theme and Typography Context', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should toggle theme between dark and light', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByText('Toggle Theme');
    const themeVal = screen.getByTestId('theme-val');

    expect(themeVal.textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(toggleBtn);
    expect(themeVal.textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should switch accent and typography font', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const accentBtn = screen.getByText('Set Indigo');
    fireEvent.click(accentBtn);
    expect(screen.getByTestId('accent-val').textContent).toBe('indigo');
    expect(document.documentElement.getAttribute('data-accent')).toBe('indigo');

    const fontBtn = screen.getByText('Set Jakarta');
    fireEvent.click(fontBtn);
    expect(screen.getByTestId('font-val').textContent).toBe('jakarta');
  });
});
