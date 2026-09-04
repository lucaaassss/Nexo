'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, CheckSquare, MessageSquare, Paperclip, AlertCircle, Plus } from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { Task, TaskStatus } from '@/types';
import { getPriorityDetails, getStatusDetails, getInitials } from '@/lib/utils';

interface KanbanViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
}

const KANBAN_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'PENDIENTE', title: 'Pendiente' },
  { id: 'EN_PROGRESO', title: 'En Progreso' },
  { id: 'EN_REVISION', title: 'En Revisión' },
  { id: 'FINALIZADA', title: 'Finalizada' },
  { id: 'CANCELADA', title: 'Cancelada' },
];

/**
 * Componente KanbanView
 * Tablero estilo Linear con columnas de estado y arrastrar y soltar (Drag & Drop) reactivo.
 */
export function KanbanView({ tasks, onSelectTask, onOpenNewTask }: KanbanViewProps) {
  const { moveTaskStatus, canCreateTask } = useNexorSpace();

  /** Maneja la finalización de un arrastre de tarjeta */
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    moveTaskStatus(draggableId, destination.droppableId as TaskStatus, destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start min-h-[calc(100vh-12rem)]">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => a.position - b.position);
          const colStatus = getStatusDetails(col.id);

          return (
            <div
              key={col.id}
              className="w-72 sm:w-80 shrink-0 bg-zinc-100/90 dark:bg-zinc-950/40 border border-zinc-300/80 dark:border-zinc-800/80 rounded-2xl flex flex-col max-h-[calc(100vh-14rem)] shadow-sm"
            >
              {/* Encabezado de la Columna */}
              <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-200/70 dark:bg-zinc-950/60 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colStatus.dot}`} />
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    {col.title}
                  </h3>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-300/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                    {colTasks.length}
                  </span>
                </div>
                {canCreateTask && (
                  <button
                    onClick={onOpenNewTask}
                    title="Crear nueva tarea en este proyecto"
                    className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-300/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Zona de Droppable para Tarjetas */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors min-h-[150px] ${
                      snapshot.isDraggingOver ? 'bg-violet-100/50 dark:bg-violet-950/20' : ''
                    }`}
                  >
                    {colTasks.map((task, index) => {
                      const priority = getPriorityDetails(task.priority);
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onSelectTask(task)}
                              className={`p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/50 dark:hover:border-violet-500/40 transition-all cursor-pointer shadow-sm hover:shadow-md group ${
                                snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-violet-500 z-50' : ''
                              }`}
                            >
                              {/* Clave y Prioridad */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                  {task.key}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${priority.bg}`}>
                                  {priority.label}
                                </span>
                              </div>

                              {/* Título de Tarea */}
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-3">
                                {task.title}
                              </h4>

                              {/* Tags */}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {task.tags.map((tg, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-transparent"
                                    >
                                      #{tg}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Footer de Tarjeta */}
                              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-500">
                                <div className="flex items-center gap-3">
                                  {(task.subtasks || []).length > 0 && (
                                    <span className="flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-400">
                                      <CheckSquare className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                                      {(task.subtasks || []).filter((s) => s.completed).length}/
                                      {(task.subtasks || []).length}
                                    </span>
                                  )}
                                  {(task.comments || []).length > 0 && (
                                    <span className="flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-400">
                                      <MessageSquare className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                                      {(task.comments || []).length}
                                    </span>
                                  )}
                                </div>

                                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-600/30 text-violet-700 dark:text-violet-300 font-bold text-[9px] flex items-center justify-center border border-violet-300 dark:border-violet-500/30">
                                  {getInitials(task.assignee?.name || 'Nexor-Space')}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
