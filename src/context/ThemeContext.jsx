import { useLayoutEffect, useMemo, useState } from 'react';
import ThemeContext from './themeState';
const THEME_KEY = 'portfolio-theme';
const ACCENT_KEY = 'portfolio-accent';
const accentValues = ['green', 'orange', 'purple'];

const getInitialTheme = () => {
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialAccent = () => {
  const savedAccent = window.localStorage.getItem(ACCENT_KEY);
  return accentValues.includes(savedAccent) ? savedAccent : 'green';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [accent, setAccent] = useState(getInitialAccent);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.accent = accent;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
    window.localStorage.setItem(ACCENT_KEY, accent);
  }, [theme, accent]);

  const value = useMemo(() => ({
    theme,
    accent,
    setAccent,
    toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark')
  }), [theme, accent]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
