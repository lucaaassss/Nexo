'use client';

import React, { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { TaskPriority, TaskStatus } from '@/types';
import { getTodayDateString } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente TaskModal
 * Formulario para crear una nueva tarea con título, descripción, responsable, prioridad y estimación.
 */
export function TaskModal({ isOpen, onClose }: TaskModalProps) {
  const { createTask, currentProject } = useNexorSpace();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIA');
  const [status, setStatus] = useState<TaskStatus>('PENDIENTE');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('4');
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  /** Procesa la creación de la tarea */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || undefined,
      estimatedHours: parseFloat(estimatedHours) || 0,
      tags,
    });

    setTitle('');
    setDescription('');
    setTagInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Crear Tarea</h2>
              <p className="text-xs text-zinc-400">Proyecto: {currentProject?.name || 'Nexor-Space'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Título de la Tarea *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Diseñar prototipo de la pantalla principal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Descripción (Markdown admitido)
            </label>
            <textarea
              rows={3}
              placeholder="Añade detalles relevantes o especificaciones técnicas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prioridad */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>

            {/* Estado Inicial */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Estado Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROGRESO">En progreso</option>
                <option value="EN_REVISION">En revisión</option>
                <option value="FINALIZADA">Finalizada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha Límite */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Fecha Límite</label>
              <input
                type="date"
                min={getTodayDateString()}
                value={dueDate}
                onChange={(e) => {
                  const val = e.target.value;
                  const today = getTodayDateString();
                  if (!val || val >= today) {
                    setDueDate(val);
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Tiempo Estimado (Horas) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tiempo Estimado (Horas)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              placeholder="UI/UX, Frontend, API, Bug"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all"
            >
              Crear Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
