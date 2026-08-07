'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type ThemeMode = 'dark' | 'light';

/**
 * COMPONENTE: ThemeToggle
 * Propósito: Cambiar entre modo oscuro y claro en toda la aplicación
 * Funcionalidad:
 * - Detecta el tema guardado en localStorage
 * - Aplica clases CSS 'dark' al elemento html
 * - Persiste la preferencia del usuario
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  // Inicializar tema desde localStorage y configurar DOM
  useEffect(() => {
    setMounted(true);
    const savedTheme = window.localStorage.getItem('nexo-theme') as ThemeMode | null;
    const preferredTheme = savedTheme ?? 'dark';
    
    setTheme(preferredTheme);
    
    // Aplicar clase 'dark' al html para que Tailwind lo detecte
    const htmlElement = document.documentElement;
    if (preferredTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, []);

  // Cambiar tema y actualizar DOM + localStorage
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    
    const htmlElement = document.documentElement;
    if (nextTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    window.localStorage.setItem('nexo-theme', nextTheme);
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/20 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-700/50"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
    </button>
  );
}
