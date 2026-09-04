'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { AbstractIllustration } from '@/components/AbstractIllustration';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Sparkles, MessageSquare, BarChart3, ShieldCheck, Zap } from 'lucide-react';

/**
 * Página de Login/Registro de Nexor-Space
 * Redirige automáticamente al dashboard si ya hay sesión activa.
 */
export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Sin Supabase real configurado, limpiar cualquier sesión en caché
      // y asegurarse de quedarse en login para que el usuario se autentique
      return;
    }

    // Si ya hay sesión activa, ir al dashboard directamente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
      }
    });

    // Escuchar cambios de auth (login exitoso)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col relative selection:bg-violet-500 selection:text-white overflow-hidden transition-colors">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Global Top Navbar */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/70 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between z-30 relative shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/30 ring-1 ring-white/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
              NEXOR<span className="text-violet-600 dark:text-violet-400 font-light">-SPACE</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-mono text-violet-600 dark:text-violet-300 font-semibold">
              v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistemas operativos</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container: Split screen on Desktop */}
      <main className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-y-auto">
        
        {/* Panel Izquierdo: Branding & Interactive Showcase */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-zinc-100/90 via-violet-50/40 to-indigo-50/50 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-violet-950/30 border-r border-zinc-200 dark:border-zinc-800/80 relative overflow-hidden flex-col items-center justify-center p-8 xl:p-12">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-15 pointer-events-none" />

          <div className="relative z-10 text-center max-w-lg w-full space-y-6">
            {/* Interactive Showcase Window */}
            <AbstractIllustration />

            {/* Typography & Messaging */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Gestión Inteligente de Proyectos
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                Organizá equipos, coordiná tareas en tiempo real y acelerá tus entregas académicas y profesionales con asistencia de inteligencia artificial.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium backdrop-blur-sm shadow-xs">
                <Zap className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                Kanban Reactivo
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium backdrop-blur-sm shadow-xs">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Chat en Tiempo Real
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium backdrop-blur-sm shadow-xs">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Métricas Predictivas
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium backdrop-blur-sm shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Nexor AI Copilot
              </span>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Autenticación */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative bg-zinc-50/50 dark:bg-transparent">
          <div className="w-full max-w-md relative z-10 py-6">
            {view === 'login' ? (
              <LoginForm onSwitchToRegister={() => setView('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setView('login')} />
            )}
          </div>
        </div>
      </main>

      {/* Global subtle footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/80 px-6 py-3 text-center text-xs text-zinc-500 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Nexor-Space Inc. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
            <span className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer transition-colors">Privacidad</span>
            <span>&bull;</span>
            <span className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer transition-colors">Términos</span>
            <span>&bull;</span>
            <span className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer transition-colors">Soporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
