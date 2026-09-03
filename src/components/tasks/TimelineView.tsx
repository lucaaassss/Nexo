'use client';

import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { Task } from '@/types';
import { getStatusDetails } from '@/lib/utils';

interface TimelineViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask?: () => void;
}

/**
 * Componente TimelineView
 * Diagrama de Gantt / Timeline horizontal para visualizar la duración y estado de las tareas.
 */
export function TimelineView({ tasks, onSelectTask, onOpenNewTask }: TimelineViewProps) {
  return (
    <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4 max-w-5xl mx-auto overflow-x-auto">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-violet-400" />
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Timeline del Proyecto (Gantt)
          </h2>
        </div>
        {onOpenNewTask && (
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Tarea</span>
          </button>
        )}
      </div>

      <div className="min-w-[600px] space-y-3">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 italic space-y-3">
            <p>No hay tareas configuradas para la línea de tiempo</p>
            {onOpenNewTask && (
              <button
                onClick={onOpenNewTask}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer not-italic"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Primera Tarea</span>
              </button>
            )}
          </div>
        ) : (
          tasks.map((task, idx) => {
            const status = getStatusDetails(task.status);
            // Simulación de posición horizontal según el id u orden
            const widthPct = Math.min(80, Math.max(30, (task.estimatedHours || 4) * 8));
            const offsetPct = (idx * 12) % 40;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 hover:border-violet-500/40 flex items-center justify-between gap-4 cursor-pointer group transition-all"
              >
                {/* Columna Nombre */}
                <div className="w-48 shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-violet-400 block">
                    {task.key}
                  </span>
                  <p className="text-xs font-semibold text-zinc-200 truncate">{task.title}</p>
                </div>

                {/* Barra de Progreso Gantt */}
                <div className="flex-1 bg-zinc-950 rounded-lg p-1 relative h-7 flex items-center">
                  <div
                    className={`h-5 rounded-md border text-[10px] px-2.5 flex items-center justify-between font-semibold transition-all shadow-md ${status.bg}`}
                    style={{
                      width: `${widthPct}%`,
                      marginLeft: `${offsetPct}%`,
                    }}
                  >
                    <span className="truncate">{status.label}</span>
                    <span className="font-mono text-[9px]">{task.loggedHours || 0}h / {task.estimatedHours || 0}h</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
