'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  Plus,
  ChevronDown,
  Layers,
  LogOut,
  Home,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { ThemeToggle } from './ThemeToggle';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { getInitials } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface NavbarProps {
  onOpenNewProject: () => void;
  onOpenAiModal: () => void;
}

/**
 * Componente Navbar Principal de Nexor-Space
 * Barra superior con selector de proyecto, buscador rápido, activador de IA y perfil.
 */
export function Navbar({ onOpenNewProject, onOpenAiModal }: NavbarProps) {
  const router = useRouter();
  const { currentProject, projects, setCurrentProject, currentUser } = useNexorSpace();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Sección Izquierda: Logo + Volver + Selector de Proyecto */}
      <div className="flex items-center gap-3">
        {/* Botón Volver a Home */}
        <button
          onClick={() => router.push('/')}
          title="Volver a mis proyectos"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50 text-xs font-medium transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Proyectos</span>
        </button>

        <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

        {/* Marca Nexor-Space */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20 ring-1 ring-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
            NEXOR-SPACE
          </span>
        </div>

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Dropdown de Proyectos */}
        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/90 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800/80 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-all shadow-sm"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentProject?.color || '#7C3AED' }}
            />
            <span className="max-w-[140px] truncate">
              {currentProject ? currentProject.name : 'Seleccionar Proyecto'}
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          </button>

          {isProjectDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProjectDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-1.5">
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase px-3 py-1.5">
                  Tus Proyectos
                </div>
                {projects.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-zinc-500">
                    No tienes proyectos creados
                  </div>
                ) : (
                  projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setCurrentProject(p.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                        currentProject?.id === p.id
                          ? 'bg-violet-50 dark:bg-violet-600/20 text-violet-800 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-500/30'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{p.key}</span>
                    </button>
                  ))
                )}

                <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      onOpenNewProject();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Proyecto
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sección Central: Buscador Rápido */}
      <div className="hidden md:flex items-center flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 text-zinc-400 dark:text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar tareas, mensajes o archivos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all shadow-sm"
        />
      </div>

      {/* Sección Derecha: Asistente IA, Notificaciones, Tema y Perfil */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón Asistente IA */}
        <button
          onClick={onOpenAiModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
          <span className="hidden sm:inline">Nexor-Space AI</span>
        </button>

        <NotificationsDropdown />
        <ThemeToggle />

        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Perfil de Usuario + Cerrar Sesión */}
        <div className="flex items-center gap-2 pl-1">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="Ver y editar mi perfil"
            className="flex items-center gap-2 p-1 -m-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-violet-500/30 shadow-md shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
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
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors ml-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal de Perfil de Usuario */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
}
