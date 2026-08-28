'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Componente ThemeToggle
 * Alterna entre Modo Oscuro y Modo Claro.
 * Persiste la preferencia en localStorage y la aplica al arrancar.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Leer preferencia guardada (o preferencia del sistema como fallback)
    const stored = localStorage.getItem('nexorspace_theme');
    const prefersDark =
      stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);

    applyTheme(prefersDark);
    setIsDark(prefersDark);
  }, []);

  function applyTheme(dark: boolean) {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
  }

  const toggleTheme = () => {
    const next = !isDark;
    applyTheme(next);
    localStorage.setItem('nexorspace_theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all duration-200 border border-transparent hover:border-violet-500/20"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-90" />
      ) : (
        <Moon className="w-5 h-5 text-violet-500 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
