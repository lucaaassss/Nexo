'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Componente ThemeToggle
 * Permite cambiar instantáneamente entre Modo Oscuro y Modo Claro con persistencia en localStorage.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Detectar tema actual
    const storedTheme = localStorage.getItem('nexo_theme');
    if (storedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, []);

  /** Alterna el tema de la aplicación */
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('nexo_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('nexo_theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 dark:hover:bg-zinc-800/80 transition-all duration-200 border border-transparent hover:border-violet-500/20"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-5 h-5 text-violet-400 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
