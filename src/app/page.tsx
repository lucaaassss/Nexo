'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { supabase } from '@/lib/supabase';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NexorSpaceAiModal } from '@/components/ai/NexorSpaceAiModal';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { getInitials } from '@/lib/utils';
import {
  Plus,
  Sparkles,
  Layers,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  BarChart3,
  LogOut,
  ArrowRight,
  Clock,
  Users,
  Loader2,
} from 'lucide-react';

/**
 * Home principal de Nexor-Space
 * Muestra las tarjetas de proyectos del usuario con acceso directo a cada uno.
 * Redirige a /login si no hay sesión activa.
 */
export default function HomePage() {
  const router = useRouter();
  const { projects, setCurrentProject, createProject, currentUser } = useNexorSpace();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setIsCheckingAuth(false);
      }
    });
  }, [router]);

  const handleOpenProject = (projectId: string) => {
    setCurrentProject(projectId);
    router.push('/dashboard');
  };

  const handleSignOut = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col" suppressHydrationWarning>
      {/* Navbar Home */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20 ring-1 ring-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
            NEXOR-SPACE
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Nexor-Space AI</span>
          </button>

          <ThemeToggle />

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Avatar + logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title="Ver y editar mi perfil"
              className="flex items-center gap-2 p-1 -m-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-violet-500/30 overflow-hidden group-hover:scale-105 transition-transform shadow-sm">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(currentUser.name)
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-none group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">
                  {currentUser.usuario ? `@${currentUser.usuario}` : currentUser.email}
                </p>
              </div>
            </button>

            <button
              onClick={handleSignOut}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
        {/* Hero greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">
            Bienvenido, <span className="text-violet-600 dark:text-violet-400">{currentUser.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {projects.length === 0
              ? 'Todavía no tenés proyectos. ¡Creá el primero!'
              : `Tenés ${projects.length} proyecto${projects.length !== 1 ? 's' : ''} activo${projects.length !== 1 ? 's' : ''}.`}
          </p>
        </div>

        {/* Stats row */}
        {projects.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Proyectos', value: projects.length, icon: FolderKanban, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-zinc-800' },
              { label: 'Total Tareas', value: projects.reduce((acc, _) => acc, 0), icon: CheckSquare, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-zinc-800' },
              { label: 'Miembros', value: projects.reduce((acc, p) => acc + (p.members?.length || 0), 0), icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-zinc-800' },
              { label: 'Activos hoy', value: projects.length, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-zinc-800' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                    <p className="text-[11px] font-medium text-zinc-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Projects grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">Tus Proyectos</h2>
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white">Nuevo Proyecto</span>
          </button>
        </div>

        {projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-6">
              <FolderKanban className="w-10 h-10 text-violet-600 dark:text-violet-400 opacity-80" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 mb-2">No hay proyectos aún</h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-sm">
              Creá tu primer proyecto para empezar a gestionar tareas, colaborar con tu equipo y mucho más.
            </p>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white">Crear primer proyecto</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => {
              const memberCount = project.members?.length || 0;

              return (
                <button
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="group text-left bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-violet-500/50 dark:hover:border-violet-500/40 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 shadow-sm hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  {/* Header tarjeta */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md ring-1 ring-black/5 dark:ring-white/10"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.key}
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-white truncate mb-1">
                      {project.name}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {project.description || 'Sin descripción'}
                    </p>
                  </div>

                  {/* Footer tarjeta */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    {/* Miembros */}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                      <Users className="w-3 h-3 text-zinc-400" />
                      <span>{memberCount} miembro{memberCount !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Módulos quick-access */}
                    <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 group-hover:text-violet-500 dark:group-hover:text-zinc-400 transition-colors">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <BarChart3 className="w-3.5 h-3.5" />
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Tarjeta "Nuevo Proyecto" */}
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="group text-left bg-zinc-50/80 dark:bg-zinc-900/30 hover:bg-violet-50/50 dark:hover:bg-violet-600/5 border border-dashed border-zinc-300 dark:border-zinc-700/60 hover:border-violet-500/50 dark:hover:border-violet-500/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 min-h-[160px] cursor-pointer shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-600/10 group-hover:bg-violet-200 dark:group-hover:bg-violet-600/20 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                Nuevo Proyecto
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Modales */}
      <ProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} />
      <NexorSpaceAiModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} activePage="home" />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}
