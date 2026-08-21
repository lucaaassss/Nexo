'use client';

import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#7C3AED', // Violeta principal
  '#4F46E5', // Índigo
  '#2563EB', // Azul
  '#059669', // Esmeralda
  '#D97706', // Ámbar
  '#E11D48', // Rosa
  '#9333EA', // Púrpura
];

/**
 * Componente ProjectModal
 * Modal interactivo para crear un nuevo proyecto asignando nombre, clave única, color y descripción.
 */
export function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const { createProject } = useNexorSpace();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#7C3AED');

  if (!isOpen) return null;

  /** Maneja el autocompletado de la clave al escribir el nombre */
  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length <= 4) {
      const generated = val
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase();
      setKey(generated);
    }
  };

  /** Envía el formulario para crear el proyecto */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    createProject({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim(),
      color: selectedColor,
    });

    setName('');
    setKey('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Crear Nuevo Proyecto</h2>
              <p className="text-xs text-zinc-400">Organiza las tareas y equipo en un solo lugar</p>
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
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Rediseño de Plataforma Web"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Clave del Proyecto (Prefijo de tareas) *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Ej. NEX"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-violet-400 font-bold placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Descripción Corta
            </label>
            <textarea
              rows={3}
              placeholder="Detalla los objetivos del proyecto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Selección de Color */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Color del Tema</label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-110 opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Botones de Acción */}
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
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
