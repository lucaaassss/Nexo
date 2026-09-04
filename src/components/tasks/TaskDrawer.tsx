'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Play,
  Pause,
  Plus,
  Send,
  Paperclip,
  CheckCircle2,
  Circle,
  Trash2,
  FileText,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { getPriorityDetails, getStatusDetails, formatDate, formatDateTime, formatFileSize, getTodayDateString } from '@/lib/utils';

interface TaskDrawerProps {
  task: Task | null;
  onClose: () => void;
}

/**
 * Componente TaskDrawer
 * Panel deslizable lateral para inspeccionar y modificar todos los aspectos de una tarea:
 * Subtareas, cronómetro de trabajo en vivo, comentarios, adjuntos y registros.
 * Con soporte completo y alto contraste para Modo Claro y Modo Oscuro.
 */
export function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  const {
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    logTimeWorked,
    addComment,
    uploadFile,
    currentUser,
    canDeleteTask,
    canEditTask,
  } = useNexorSpace();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [manualTimeInput, setManualTimeInput] = useState('');

  // Cronómetro de trabajo en vivo
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isTimerRunning && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!task) return null;

  const statusInfo = getStatusDetails(task.status);
  const priorityInfo = getPriorityDetails(task.priority);

  /** Detiene el cronómetro y guarda el tiempo acumulado */
  const handleStopTimer = () => {
    setIsTimerRunning(false);
    if (timerSeconds > 0) {
      const hoursWorked = parseFloat((timerSeconds / 3600).toFixed(2));
      if (hoursWorked > 0) {
        logTimeWorked(task.id, hoursWorked);
      }
      setTimerSeconds(0);
    }
  };

  /** Agrega tiempo manual trabajado */
  const handleAddManualTime = () => {
    const hours = parseFloat(manualTimeInput);
    if (!isNaN(hours) && hours > 0) {
      logTimeWorked(task.id, hours);
      setManualTimeInput('');
    }
  };

  /** Procesa la creación de una subtarea */
  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  /** Procesa la publicación de un comentario */
  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    addComment(task.id, commentContent.trim());
    setCommentContent('');
  };

  /** Procesa la carga de archivos adjuntos */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fakeUrl = URL.createObjectURL(file);
      uploadFile(file.name, fakeUrl, file.size, file.type, task.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between">
          {/* Header del Panel */}
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/30 px-2.5 py-1 rounded-lg">
                {task.key}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusInfo.bg}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {canDeleteTask && (
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    onClose();
                  }}
                  title="Eliminar tarea"
                  className="p-2 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cuerpo Principal del Inspector */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Título de la Tarea */}
            <div>
              <input
                type="text"
                value={task.title}
                readOnly={!canEditTask}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                className={`w-full text-xl font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent py-1 transition-colors ${
                  canEditTask ? 'hover:border-zinc-200 dark:hover:border-zinc-800 focus:border-violet-500 focus:outline-none' : 'cursor-default'
                }`}
              />
            </div>

            {/* Selectores de Estado y Prioridad */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">
                  Estado
                </span>
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROGRESO">En progreso</option>
                  <option value="EN_REVISION">En revisión</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">
                  Prioridad
                </span>
                <select
                  value={task.priority}
                  disabled={!canEditTask}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500 disabled:opacity-70"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">
                  Fecha Límite
                </span>
                <input
                  type="date"
                  min={getTodayDateString()}
                  value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const today = getTodayDateString();
                    if (!val || val >= today) {
                      updateTask(task.id, { dueDate: val });
                    }
                  }}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1">
                  Estimación (Horas)
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={task.estimatedHours || 0}
                  onChange={(e) => updateTask(task.id, { estimatedHours: parseFloat(e.target.value) })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Módulo de Registro de Tiempo y Cronómetro */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Seguimiento de Tiempo</span>
                </div>
                <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <span className="text-violet-700 dark:text-violet-400 font-bold">{task.loggedHours || 0}h</span> registrados de{' '}
                  {task.estimatedHours || 0}h estimadas
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Botón Play / Pause Cronómetro */}
                {!isTimerRunning ? (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-600/30 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Iniciar Cronómetro</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopTimer}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-600/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-600/30 transition-colors animate-pulse cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pausar ({Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s)</span>
                  </button>
                )}

                {/* Entrada Manual de Horas */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <input
                    type="number"
                    placeholder="+ Horas"
                    step="0.5"
                    value={manualTimeInput}
                    onChange={(e) => setManualTimeInput(e.target.value)}
                    className="w-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={handleAddManualTime}
                    className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Descripción</label>
              <textarea
                rows={4}
                value={task.description || ''}
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                placeholder="Añade una descripción detallada..."
                className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-violet-500 resize-none leading-relaxed shadow-xs"
              />
            </div>

            {/* Subtareas / Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Subtareas Checklist ({(task.subtasks || []).filter((s) => s.completed).length} /{' '}
                  {(task.subtasks || []).length})
                </h3>
              </div>

              <div className="space-y-2">
                {(task.subtasks || []).map((st) => (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-400 dark:text-zinc-600 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        st.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200 font-medium'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>
                ))}

                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Añadir una subtarea..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Añadir
                  </button>
                </form>
              </div>
            </div>

            {/* Archivos Adjuntos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Archivos Adjuntos ({(task.attachments || []).length})
                </h3>
                <label className="cursor-pointer text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Subir Archivo
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {(task.attachments || []).length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {task.attachments?.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/30 flex items-center gap-2 group transition-colors"
                    >
                      <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                      <div className="truncate text-left">
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-violet-600 dark:group-hover:text-violet-300">
                          {att.name}
                        </p>
                        <p className="text-[10px] text-zinc-500">{formatFileSize(att.size)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Comentarios de la Tarea */}
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Comentarios ({(task.comments || []).length})
              </h3>

              <div className="space-y-3">
                {(task.comments || []).map((cmt) => (
                  <div key={cmt.id} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                        {cmt.author?.name || 'Usuario'}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {formatDateTime(cmt.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed">{cmt.content}</p>
                  </div>
                ))}
              </div>

              {/* Publicar Comentario */}
              <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un comentario..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-violet-500 shadow-xs"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
