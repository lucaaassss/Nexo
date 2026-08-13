'use client';

import React from 'react';
import { Task } from '@/types';
import { getStatusDetails, getPriorityDetails, formatDate, getInitials } from '@/lib/utils';

interface TableViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

/**
 * Componente TableView
 * Vista de tabla matricial con columnas detalladas de clave, título, estado, prioridad, fecha límite y responsable.
 */
export function TableView({ tasks, onSelectTask }: TableViewProps) {
  return (
    <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden max-w-5xl mx-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-zinc-950/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="py-3 px-4">Clave</th>
              <th className="py-3 px-4">Título</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Prioridad</th>
              <th className="py-3 px-4">Fecha Límite</th>
              <th className="py-3 px-4">Asignado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-zinc-500 italic">
                  No hay tareas registradas
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const status = getStatusDetails(task.status);
                const priority = getPriorityDetails(task.priority);
                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-zinc-900/60 transition-colors cursor-pointer text-xs"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-violet-400">
                      {task.key}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-200">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${status.bg}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${priority.bg}`}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-bold text-[8px] flex items-center justify-center border border-violet-500/30">
                          {getInitials(task.assignee?.name || 'NX')}
                        </div>
                        <span className="text-zinc-300 text-xs">
                          {task.assignee?.name || 'Sin asignar'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
