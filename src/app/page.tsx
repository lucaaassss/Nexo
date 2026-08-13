'use client';

import React, { useState, useEffect } from 'react';
import { useNexo } from '@/hooks/useNexo';
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
import { NexoAiModal } from '@/components/ai/NexoAiModal';
import { Task } from '@/types';
import {
  FolderKanban,
  Plus,
  UserPlus,
  Sparkles,
  Shield,
  Trash2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * Página Principal Nexo SaaS Application
 * Integra de forma reactiva todos los módulos de gestión, vistas sincronizadas, chat,
 * archivos, analíticas, historial, permisos e inteligencia artificial.
 */
export default function DashboardPage() {
  const {
    currentProject,
    projects,
    projectTasks,
    currentUser,
    createProject,
    updateProject,
    deleteProject,
  } = useNexo();

  const [activeTab, setActiveTab] = useState<string>('tasks');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list' | 'calendar' | 'timeline' | 'table'>('kanban');

  // Estados de los Modales
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);


  /** Dispara animación de confetti al celebrar logros o proyectos completados */
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" suppressHydrationWarning>
      {/* Top Navbar */}
      <Navbar
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          taskViewMode={taskViewMode}
          setTaskViewMode={setTaskViewMode}
          onOpenNewTask={() => setIsNewTaskModalOpen(true)}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />

        {/* ÁREA DE CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* Header del Proyecto Actual */}
          {currentProject && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ring-1 ring-white/20 shrink-0 font-bold"
                  style={{ backgroundColor: currentProject.color }}
                >
                  {currentProject.key}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                    {currentProject.name}
                    <button
                      onClick={triggerCelebration}
                      title="Celebrar Avance"
                      className="text-xs text-amber-400 hover:scale-110 transition-transform"
                    >
                      ✨
                    </button>
                  </h1>
                  <p className="text-xs text-zinc-400 max-w-xl truncate">
                    {currentProject.description || 'Sin descripción asignada'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-violet-400" />
                  <span>Invitar</span>
                </button>
                <button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Tarea</span>
                </button>
              </div>
            </div>
          )}

          {/* VISTAS DE CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
          {activeTab === 'tasks' && (
            <div>
              {taskViewMode === 'kanban' && (
                <KanbanView
                  tasks={projectTasks}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onOpenNewTask={() => setIsNewTaskModalOpen(true)}
                />
              )}
              {taskViewMode === 'list' && (
                <ListView
                  tasks={projectTasks}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onOpenNewTask={() => setIsNewTaskModalOpen(true)}
                />
              )}
              {taskViewMode === 'calendar' && (
                <CalendarView
                  tasks={projectTasks}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}
              {taskViewMode === 'timeline' && (
                <TimelineView
                  tasks={projectTasks}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}
              {taskViewMode === 'table' && (
                <TableView
                  tasks={projectTasks}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}
            </div>
          )}


          {activeTab === 'files' && <FileManager />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'activity' && <ActivityTimeline />}

          {/* Pestaña de Configuración del Proyecto y Permisos RBAC */}
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
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Descripción
                    </label>
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
                <h3 className="text-sm font-bold text-zinc-100">Roles y Permisos de la Organización</h3>
                <div className="space-y-2">
                  {(currentProject.members || [
                    { id: '1', user: currentUser, role: 'ADMIN' },
                  ]).map((mem) => (
                    <div
                      key={mem.id}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                    >
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

      {/* DRAWER & MODALES INTERACTIVOS */}
      <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      <ProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
      <TaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} />
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
      <NexoAiModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
      <ChatBubble />
    </div>
  );
}
