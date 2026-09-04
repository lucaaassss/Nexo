'use client';

import React from 'react';
import {
  CheckSquare,
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
import { useNexorSpace } from '@/hooks/useNexorSpace';

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
  const { currentProject, canCreateTask, canManageMembers, userRole } = useNexorSpace();

  const navigationItems = [
    { id: 'tasks', label: 'Tablero de Tareas', icon: CheckSquare },
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
    <aside className="w-64 bg-white dark:bg-zinc-950/60 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Botón Acción Rápida: Nueva Tarea (Restringido por Rol) */}
        {canCreateTask ? (
          <button
            onClick={onOpenNewTask}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white">Crear Nueva Tarea</span>
          </button>
        ) : (
          <div
            title="Solo los Administradores pueden crear nuevas tareas"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-medium cursor-not-allowed select-none opacity-80"
          >
            <Plus className="w-4 h-4 text-zinc-400" />
            <span>Crear Tarea (Solo Admin)</span>
          </div>
        )}

        {/* Sección de Vistas de Tareas */}
        {activeTab === 'tasks' && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500 uppercase px-3 mb-2 tracking-wider">
              Modo de Visualización
            </div>
            {taskViews.map((v) => {
              const Icon = v.icon;
              const isSelected = taskViewMode === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setTaskViewMode(v.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-violet-100 dark:bg-violet-600/15 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-500/30'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-700 dark:text-violet-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Navegación Principal del Proyecto */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500 uppercase px-3 mb-2 tracking-wider">
            Módulos del Proyecto
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-violet-100 dark:bg-violet-600/20 text-violet-800 dark:text-violet-200 border border-violet-300 dark:border-violet-500/30 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-violet-700 dark:text-violet-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sección Inferior: Invitar Integrantes */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
        {canManageMembers ? (
          <button
            onClick={onOpenInviteModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Invitar al Equipo</span>
          </button>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/40 text-[11px] text-zinc-500 dark:text-zinc-500 text-center font-medium">
            Rol: <span className="text-violet-600 dark:text-violet-400 font-bold uppercase">{userRole}</span> (Miembro)
          </div>
        )}

        {currentProject && (
          <div className="px-3 py-2 bg-zinc-100/70 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800/40 text-[11px] text-zinc-600 dark:text-zinc-500 flex items-center justify-between">
            <span>Clave del Proyecto</span>
            <span className="font-mono text-violet-700 dark:text-violet-400 font-bold">{currentProject.key}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
