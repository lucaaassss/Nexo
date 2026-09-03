'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { KanbanView } from '@/components/tasks/KanbanView';
import { ListView } from '@/components/tasks/ListView';
import { CalendarView } from '@/components/tasks/CalendarView';
import { TimelineView } from '@/components/tasks/TimelineView';
import { TableView } from '@/components/tasks/TableView';
import { TaskDrawer } from '@/components/tasks/TaskDrawer';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { TaskModal } from '@/components/tasks/TaskModal';
import { InviteMemberModal } from '@/components/projects/InviteMemberModal';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { FileManager } from '@/components/files/FileManager';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { NexorSpaceAiModal } from '@/components/ai/NexorSpaceAiModal';
import { Task, TaskStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  UserPlus,
  Sparkles,
  Shield,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Dashboard Principal de Nexor-Space
 * Muestra las vistas de tareas, archivos, analíticas e historial del proyecto activo.
 */
export default function DashboardPage() {
  const router = useRouter();
  const {
    currentProject,
    projects,
    projectTasks,
    currentUser,
    createProject,
    updateProject,
    deleteProject,
  } = useNexorSpace();

  const [activeTab, setActiveTab] = useState<string>('tasks');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list' | 'calendar' | 'timeline' | 'table'>('kanban');

  // Estados de los Modales
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskInitialDate, setNewTaskInitialDate] = useState<string>('');
  const [newTaskInitialStatus, setNewTaskInitialStatus] = useState<TaskStatus>('PENDIENTE');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenNewTask = (dateStr?: string, status?: TaskStatus) => {
    setNewTaskInitialDate(dateStr || '');
    setNewTaskInitialStatus(status || 'PENDIENTE');
    setIsNewTaskModalOpen(true);
  };

  // Verificar sesión activa al montar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      }
    });
  }, [router]);

  /** Dispara animación de confetti */
  const triggerCelebration = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" suppressHydrationWarning>
      <Navbar
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          taskViewMode={taskViewMode}
          setTaskViewMode={setTaskViewMode}
          onOpenNewTask={() => handleOpenNewTask()}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* Header del Proyecto Actual */}
          {currentProject ? (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ring-1 ring-black/5 dark:ring-white/20 shrink-0 font-bold"
                  style={{ backgroundColor: currentProject.color }}
                >
                  {currentProject.key}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    {currentProject.name}
                    <button
                      onClick={triggerCelebration}
                      title="Celebrar Avance"
                      className="text-xs text-amber-500 dark:text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      ✨
                    </button>
                  </h1>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl truncate font-normal">
                    {currentProject.description || 'Sin descripción asignada'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Invitar</span>
                </button>
                <button
                  onClick={() => handleOpenNewTask()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span className="text-white">Nueva Tarea</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 my-6 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 max-w-lg mx-auto">
              <h2 className="text-base font-bold text-zinc-200">No hay proyecto seleccionado</h2>
              <p className="text-xs text-zinc-400">Seleccioná un proyecto desde el menú superior o creá uno nuevo.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                >
                  Ver Mis Proyectos
                </button>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Crear Proyecto
                </button>
              </div>
            </div>
          )}

          {/* Mobile Navigation Tabs & Views (md:hidden) */}
          {currentProject && (
            <div className="md:hidden space-y-2 mb-4 pb-2 border-b border-zinc-800/80">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'tasks', label: 'Tareas' },
                  { id: 'files', label: 'Archivos' },
                  { id: 'analytics', label: 'Estadísticas' },
                  { id: 'activity', label: 'Historial' },
                  { id: 'settings', label: 'Equipo' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {activeTab === 'tasks' && (
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'kanban', label: 'Kanban' },
                    { id: 'list', label: 'Lista' },
                    { id: 'calendar', label: 'Calendario' },
                    { id: 'timeline', label: 'Timeline' },
                    { id: 'table', label: 'Tabla' },
                  ].map((vm) => (
                    <button
                      key={vm.id}
                      onClick={() => setTaskViewMode(vm.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all cursor-pointer ${
                        taskViewMode === vm.id
                          ? 'bg-violet-950/60 border border-violet-500/50 text-violet-300 font-semibold'
                          : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {vm.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VISTAS DE CONTENIDO */}
          {activeTab === 'tasks' && (
            <div>
              {taskViewMode === 'kanban' && (
                <KanbanView tasks={projectTasks} onSelectTask={(task) => setSelectedTask(task)} onOpenNewTask={() => handleOpenNewTask()} />
              )}
              {taskViewMode === 'list' && (
                <ListView tasks={projectTasks} onSelectTask={(task) => setSelectedTask(task)} onOpenNewTask={() => handleOpenNewTask()} />
              )}
              {taskViewMode === 'calendar' && (
                <CalendarView
                  tasks={projectTasks}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onOpenNewTask={(dateStr) => handleOpenNewTask(dateStr)}
                />
              )}
              {taskViewMode === 'timeline' && (
                <TimelineView
                  tasks={projectTasks}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onOpenNewTask={() => handleOpenNewTask()}
                />
              )}
              {taskViewMode === 'table' && (
                <TableView
                  tasks={projectTasks}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onOpenNewTask={() => handleOpenNewTask()}
                />
              )}
            </div>
          )}

          {activeTab === 'files' && <FileManager />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'activity' && <ActivityTimeline />}

          {/* Configuración del Proyecto */}
          {activeTab === 'settings' && currentProject && (
            <div className="space-y-6 max-w-4xl mx-auto pb-12">
              <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  Configuración del Proyecto
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Nombre</label>
                    <input
                      type="text"
                      value={currentProject.name}
                      onChange={(e) => updateProject(currentProject.id, { name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={currentProject.description || ''}
                      onChange={(e) => updateProject(currentProject.id, { description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-violet-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Roles del Equipo */}
              <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
                <h3 className="text-sm font-bold text-zinc-100">Roles y Permisos</h3>
                <div className="space-y-2">
                  {(currentProject.members || [{ id: '1', user: currentUser, role: 'ADMIN' }]).map((mem) => (
                    <div key={mem.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">{mem.user?.name}</p>
                        <p className="text-[10px] text-zinc-500">{mem.user?.email}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-violet-400 bg-violet-950/40 border border-violet-500/30 px-2.5 py-1 rounded-lg">
                        {mem.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zona Peligrosa */}
              <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                <h3 className="text-xs font-bold text-rose-400">Zona Peligrosa</h3>
                <p className="text-xs text-zinc-400">
                  La eliminación de este proyecto eliminará permanentemente todas sus tareas, mensajes y archivos.
                </p>
                <button
                  onClick={() => {
                    if (confirm(`¿Estás seguro de eliminar el proyecto ${currentProject.name}?`)) {
                      deleteProject(currentProject.id);
                      setActiveTab('tasks');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Proyecto Permanentemente
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALES */}
      <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      <ProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} />
      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        initialDueDate={newTaskInitialDate}
        initialStatus={newTaskInitialStatus}
      />
      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
      <NexorSpaceAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        activePage="dashboard"
        activeTab={activeTab}
        taskViewMode={taskViewMode}
      />
      <ChatBubble />
    </div>
  );
}
