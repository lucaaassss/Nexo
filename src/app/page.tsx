'use client';

import React, { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { AbstractIllustration } from '@/components/AbstractIllustration';
import { Sparkles, Layers, ShieldCheck, Zap, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-violet-600/15 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/15 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* ------------------------------------------------------------------- */}
      {/* PANEL IZQUIERDO: Presentación de NEXO (Desktop)                      */}
      {/* ------------------------------------------------------------------- */}
      <section className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-zinc-200/80 dark:border-zinc-800/60 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white selection:bg-violet-500">
        {/* Subtle Ambient Mesh Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b0764_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Top Header Branding */}
        <div className="relative z-20 flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 shadow-lg shadow-violet-600/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-violet-400">
              NEXO
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              SaaS Platform
            </span>
          </div>
        </div>

        {/* Center Illustration & Tagline */}
        <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
          <AbstractIllustration />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug">
              "Conectando ideas, personas y proyectos."
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              La plataforma integral diseñada para potenciar la colaboración entre alumnos y profesores en entornos académicos y profesionales de alto impacto.
            </p>
          </motion.div>
        </div>

        {/* Footer Feature Badges */}
        <div className="relative z-20 grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/80 text-xs font-medium text-zinc-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
            <span>Seguridad Enterprise</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Tiempo Real</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>UX/UI Premium</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* PANEL DERECHO: Formulario de Autenticación (Mobile + Desktop)        */}
      {/* ------------------------------------------------------------------- */}
      <section className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 min-h-screen">
        {/* Top Navigation & Theme Toggle Bar */}
        <div className="w-full flex items-center justify-between mb-6 sm:mb-8">
          {/* Mobile Brand Header */}
          <div className="flex lg:hidden items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md shadow-violet-600/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-widest text-zinc-900 dark:text-white">
                NEXO
              </span>
            </div>
          </div>

          {/* Auth Tabs (Iniciar sesión / Crear cuenta) */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-900/80 border border-zinc-300/50 dark:border-zinc-800/80 shadow-inner">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                authMode === 'login'
                  ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar sesión</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                authMode === 'register'
                  ? 'bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear cuenta</span>
            </button>
          </div>

          {/* Selector de Modo Claro/Oscuro */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container with Animated Switch */}
        <div className="my-auto w-full flex justify-center">
          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="w-full"
              >
                <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="w-full"
              >
                <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
          <p>© {new Date().getFullYear()} Nexo Platform Inc. Todos los derechos reservados.</p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-400">
            Autenticación y Registro seguros con Supabase.
          </p>
        </div>
      </section>
    </main>
  );
}
