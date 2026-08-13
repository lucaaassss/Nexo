'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { AbstractIllustration } from '@/components/AbstractIllustration';
import { supabase } from '@/lib/supabase';

/**
 * Página de Login/Registro de Nexo
 * Redirige automáticamente al dashboard si ya hay sesión activa.
 */
export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'register'>('login');

  useEffect(() => {
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Panel Izquierdo: Ilustración / Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Glow effects */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tight">NEXO</span>
          </div>

          <AbstractIllustration />

          <h2 className="text-2xl font-bold text-white mt-8 mb-3">
            Gestión colaborativa de proyectos
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Organizá tareas, coordiná tu equipo y alcanzá tus objetivos con una plataforma diseñada para la excelencia.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['Kanban', 'Chat en vivo', 'Analíticas', 'Nexo AI'].map((f) => (
              <span
                key={f}
                className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Derecho: Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">NEXO</span>
          </div>

          {view === 'login' ? (
            <LoginForm onSwitchToRegister={() => setView('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
