'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Clock, Users, Zap, Shield, ArrowUpRight, Activity } from 'lucide-react';

export const AbstractIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* Ambient background glows */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-violet-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Showcase Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative rounded-3xl border border-white/15 bg-zinc-950/60 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl shadow-violet-950/50 overflow-hidden"
      >
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Window Topbar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[11px] text-white/40 tracking-wider">
              nexor-space / sprint-v2.4
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>En vivo</span>
          </div>
        </div>

        {/* Interactive Kanban Card Mockup */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 relative overflow-hidden backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-semibold tracking-wide">
              Sprint Activo
            </span>
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
              <Clock className="w-3 h-3" />
              Prioridad Alta
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight mb-1 text-left">
            Rediseño del Sistema de Diseño Nexor
          </h3>
          <p className="text-xs text-zinc-400 mb-3 text-left leading-relaxed">
            Coordinación de componentes, arquitectura UI y sincronización en tiempo real.
          </p>

          {/* Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Progreso del sprint</span>
              <span className="text-violet-300 font-bold">88%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-400 shadow-sm shadow-violet-400/50"
              />
            </div>
          </div>

          {/* Checklist preview */}
          <div className="space-y-1.5 text-left text-[11px] mb-3">
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Arquitectura de componentes y modo oscuro unificado</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Base de datos Supabase con RLS y Auth reactivo</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0 animate-pulse" />
              <span>Optimización de experiencia para alumnos y profesores</span>
            </div>
          </div>

          {/* Collaborator Avatars & Live Cursor */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center -space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white shadow">
                M
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white shadow">
                L
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-600 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white shadow">
                J
              </div>
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[9px] font-semibold text-zinc-300 shadow">
                +4
              </div>
            </div>

            {/* Collaborative live cursor indicator */}
            <motion.div
              animate={{ x: [0, 4, 0], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-600/30 border border-violet-500/40 text-[10px] text-violet-200 font-medium backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Milena editando...</span>
            </motion.div>
          </div>
        </motion.div>

        {/* AI Assistant Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-3.5 p-3 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-purple-950/40 flex items-start gap-2.5 text-left backdrop-blur-sm"
        >
          <div className="p-1 rounded-lg bg-violet-500/20 text-violet-300 shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-violet-200">Nexor AI Copilot:</span>{' '}
            <span className="text-zinc-300">
              Sprint optimizado para entrega puntual. 3 dependencias resueltas automáticamente.
            </span>
          </div>
        </motion.div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Eficiencia</p>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-center justify-center gap-0.5">
              +42% <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Colaboración</p>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-center justify-center gap-0.5">
              Tiempo real
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Seguridad</p>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 flex items-center justify-center gap-0.5">
              TLS 1.3
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
