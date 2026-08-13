'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Plus } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { getPriorityDetails, getStatusDetails, formatDate, getInitials } from '@/lib/utils';

interface ListViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
}

const STATUS_GROUPS: { id: TaskStatus; title: string }[] = [
  { id: 'PENDIENTE', title: 'Pendiente' },
  { id: 'EN_PROGRESO', title: 'En Progreso' },
  { id: 'EN_REVISION', title: 'En Revisión' },
  { id: 'FINALIZADA', title: 'Finalizada' },
  { id: 'CANCELADA', title: 'Cancelada' },
];

/**
 * Componente ListView
 * Vista de lista jerárquica con grupos desplegables por estado y edición rápida.
 */
export function ListView({ tasks, onSelectTask, onOpenNewTask }: ListViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  /** Alterna la expansión/colapso de un grupo de tareas */
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10">
      {STATUS_GROUPS.map((group) => {
        const groupTasks = tasks.filter((t) => t.status === group.id);
        const isCollapsed = collapsedGroups[group.id];
        const statusInfo = getStatusDetails(group.id);

        return (
          <div
            key={group.id}
            className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl overflow-hidden"
          >
            {/* Header del Grupo */}
            <div
              onClick={() => toggleGroup(group.id)}
              className="p-3.5 flex items-center justify-between bg-zinc-950/80 cursor-pointer hover:bg-zinc-900/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
                <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dot}`} />
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  {group.title}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {groupTasks.length}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNewTask();
                }}
                className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Tareas del Grupo */}
            {!isCollapsed && (
              <div className="divide-y divide-zinc-800/40">
                {groupTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500 italic">
                    Sin tareas en este estado
                  </div>
                ) : (
                  groupTasks.map((task) => {
                    const priority = getPriorityDetails(task.priority);
                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="p-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xs font-mono font-semibold text-zinc-500 group-hover:text-violet-400 w-16 shrink-0">
                            {task.key}
                          </span>
                          <p className="text-xs font-medium text-zinc-200 truncate flex-1">
                            {task.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${priority.bg}`}>
                            {priority.label}
                          </span>

                          {task.dueDate && (
                            <span className="text-[11px] text-zinc-500 flex items-center gap-1 hidden sm:flex">
                              <Clock className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}

                          <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 font-bold text-[9px] flex items-center justify-center border border-violet-500/30">
                            {getInitials(task.assignee?.name || 'NX')}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
