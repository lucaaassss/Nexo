'use client';

import React from 'react';
import {
  CheckSquare,
  MessageSquare,
  Folder,
  BarChart3,
  History,
  Settings,
  UserPlus,
  Plus,
  Kanban,
  ListFilter,
  Calendar,
  Clock,
  Table,
} from 'lucide-react';
import { useNexo } from '@/hooks/useNexo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  taskViewMode: 'kanban' | 'list' | 'calendar' | 'timeline' | 'table';
  setTaskViewMode: (view: 'kanban' | 'list' | 'calendar' | 'timeline' | 'table') => void;
  onOpenNewTask: () => void;
  onOpenInviteModal: () => void;
}

/**
 * Componente Sidebar Principal
 * Navegación lateral entre vistas de tareas, chat, archivos, analíticas y configuración.
 */
export function Sidebar({
  activeTab,
  setActiveTab,
  taskViewMode,
  setTaskViewMode,
  onOpenNewTask,
  onOpenInviteModal,
}: SidebarProps) {
  const { currentProject } = useNexo();

  const navigationItems = [
    { id: 'tasks', label: 'Tablero de Tareas', icon: CheckSquare },
    { id: 'chat', label: 'Chat Integrado', icon: MessageSquare },
    { id: 'files', label: 'Bóveda de Archivos', icon: Folder },
    { id: 'analytics', label: 'Estadísticas', icon: BarChart3 },
    { id: 'activity', label: 'Historial & Auditoría', icon: History },
    { id: 'settings', label: 'Equipo y Permisos', icon: Settings },
  ];

  const taskViews = [
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'list', label: 'Lista', icon: ListFilter },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'table', label: 'Tabla', icon: Table },
  ];

  return (
    <aside className="w-64 bg-zinc-950/60 border-r border-zinc-800/80 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Botón Acción Rápida: Nueva Tarea */}
        <button
          onClick={onOpenNewTask}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nueva Tarea</span>
        </button>

        {/* Sección de Vistas de Tareas */}
        {activeTab === 'tasks' && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase px-3 mb-2">
              Modo de Visualización
            </div>
            {taskViews.map((v) => {
              const Icon = v.icon;
              const isSelected = taskViewMode === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setTaskViewMode(v.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-zinc-500'}`} />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Navegación Principal del Proyecto */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase px-3 mb-2">
            Módulos del Proyecto
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/10 text-white font-semibold border border-violet-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-violet-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sección Inferior: Invitar Integrantes */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-2">
        <button
          onClick={onOpenInviteModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4 text-violet-400" />
          <span>Invitar al Equipo</span>
        </button>

        {currentProject && (
          <div className="px-3 py-2 bg-zinc-900/40 rounded-xl border border-zinc-800/40 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Clave del Proyecto</span>
            <span className="font-mono text-violet-400 font-semibold">{currentProject.key}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
