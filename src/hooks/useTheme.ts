'use client';
import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme(): { theme: Theme; toggleTheme: () => void; mounted: boolean } {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('sedchar-theme') as Theme | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');
      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
    } catch (_) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem('sedchar-theme', next);
      } catch (_) {}
      return next;
    });
  }, []);

  return { theme, toggleTheme, mounted };
}
