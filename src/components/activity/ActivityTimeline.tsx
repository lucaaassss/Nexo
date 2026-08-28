'use client';

import React from 'react';
import { History } from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { formatDateTime, getInitials } from '@/lib/utils';

/**
 * Componente ActivityTimeline
 * Registro cronológico inmutable de todas las acciones del equipo (Audit Trail).
 */
export function ActivityTimeline() {
  const { projectActivities } = useNexorSpace();

  return (
    <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-800">
        <History className="w-5 h-5 text-violet-400" />
        <div>
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Historial Completo de Actividad
          </h2>
          <p className="text-xs text-zinc-400">Auditoría cronológica de modificaciones del proyecto</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
        {projectActivities.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 italic">
            Aún no hay actividades registradas en este proyecto
          </div>
        ) : (
          projectActivities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-4 group">
              {/* Punto indicador */}
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-violet-600 ring-4 ring-zinc-950 group-hover:scale-125 transition-transform" />

              <div className="flex-1 bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 space-y-1 hover:border-violet-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-bold text-[8px] flex items-center justify-center border border-violet-500/30">
                      {getInitials(act.user?.name || 'User')}
                    </div>
                    <span className="text-xs font-semibold text-zinc-200">
                      {act.user?.name || 'Usuario'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formatDateTime(act.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 pt-1 leading-relaxed">{act.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
