'use client';

import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Users,
  Target,
} from 'lucide-react';
import { useNexo } from '@/hooks/useNexo';

/**
 * Componente AnalyticsDashboard
 * Dashboard analítico de rendimiento, tareas completadas, distribución por prioridad y horas trabajadas.
 */
export function AnalyticsDashboard() {
  const { projectTasks, currentProject } = useNexo();

  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'FINALIZADA').length;
  const pendingTasks = projectTasks.filter((t) => t.status === 'PENDIENTE').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'EN_PROGRESO').length;

  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalEstimated = projectTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
  const totalLogged = projectTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);

  const priorityCounts = {
    URGENTE: projectTasks.filter((t) => t.priority === 'URGENTE').length,
    ALTA: projectTasks.filter((t) => t.priority === 'ALTA').length,
    MEDIA: projectTasks.filter((t) => t.priority === 'MEDIA').length,
    BAJA: projectTasks.filter((t) => t.priority === 'BAJA').length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-zinc-100">Analíticas y Métricas de Rendimiento</h2>
          <p className="text-xs text-zinc-400">Monitoreo de productividad del proyecto {currentProject?.name}</p>
        </div>
      </div>

      {/* Fila de Tarjetas Principales (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Progreso General</span>
            <Target className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-100">{completionPct}%</p>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Tareas Completadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{completedTasks}</p>
          <p className="text-[11px] text-zinc-500">De {totalTasks} tareas totales</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Horas Registradas</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-violet-400">{totalLogged}h</p>
          <p className="text-[11px] text-zinc-500">Estimación total: {totalEstimated}h</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Tareas en Progreso</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400">{inProgressTasks}</p>
          <p className="text-[11px] text-zinc-500">{pendingTasks} pendientes</p>
        </div>
      </div>

      {/* Gráficos de Distribución por Prioridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Distribución por Prioridad
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Urgente', count: priorityCounts.URGENTE, color: 'bg-red-500' },
              { label: 'Alta', count: priorityCounts.ALTA, color: 'bg-orange-500' },
              { label: 'Media', count: priorityCounts.MEDIA, color: 'bg-indigo-500' },
              { label: 'Baja', count: priorityCounts.BAJA, color: 'bg-slate-500' },
            ].map((p) => {
              const pct = totalTasks > 0 ? Math.round((p.count / totalTasks) * 100) : 0;
              return (
                <div key={p.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-zinc-300">
                    <span>{p.label}</span>
                    <span>
                      {p.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div className={`${p.color} h-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen Eficiencia de Tiempo */}
        <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
              Eficiencia de Tiempo
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Comparación entre las horas estimadas al planificar las tareas y las horas reales de trabajo registradas por los integrantes.
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex items-center justify-around text-center">
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold">Estimado</p>
              <p className="text-xl font-bold text-zinc-200">{totalEstimated}h</p>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold">Invertido</p>
              <p className="text-xl font-bold text-violet-400">{totalLogged}h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
