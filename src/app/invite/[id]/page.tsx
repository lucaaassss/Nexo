'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { UserPlus, ArrowRight, FolderKanban, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { projects, currentProject, setCurrentProject, currentUser, addMemberToProject } = useNexorSpace();

  const [isAccepted, setIsAccepted] = useState(false);
  const [projectInfo, setProjectInfo] = useState<any>(null);

  useEffect(() => {
    if (!projectId) return;

    // Buscar en proyectos locales
    const found = projects.find((p) => p.id === projectId);
    if (found) {
      setProjectInfo(found);
    } else {
      // Consultar API de proyectos
      fetch(`/api/projects`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          const matched = Array.isArray(data) ? data.find((p: any) => p.id === projectId) : null;
          if (matched) {
            setProjectInfo(matched);
          } else {
            setProjectInfo({
              id: projectId,
              name: 'Proyecto de Nexor-Space',
              description: 'Espacio de trabajo compartido en equipo.',
            });
          }
        })
        .catch(() => {
          setProjectInfo({
            id: projectId,
            name: 'Proyecto de Nexor-Space',
            description: 'Espacio de trabajo compartido en equipo.',
          });
        });
    }
  }, [projectId, projects]);

  const handleAccept = () => {
    if (projectId && currentUser) {
      addMemberToProject(projectId, currentUser.email || 'colaborador@nexo.app', 'MEMBER');
      setCurrentProject(projectId);
    }
    setIsAccepted(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
          <UserPlus className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Invitación de Equipo</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">¡Te han invitado a colaborar!</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Has recibido una invitación para unirte al equipo y comenzar a trabajar en las tareas del proyecto.
        </p>

        {projectInfo && (
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 shrink-0 mt-0.5">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-zinc-100 truncate">{projectInfo.name}</h2>
              <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                {projectInfo.description || 'Espacio de trabajo para gestión y colaboración en tiempo real.'}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={isAccepted}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
        >
          {isAccepted ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>¡Invitación Aceptada! Redirigiendo...</span>
            </>
          ) : (
            <>
              <span>Unirse al Proyecto</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span>Nexo &copy; {new Date().getFullYear()}</span>
          <Link href="/dashboard" className="text-violet-400 hover:text-violet-300 font-medium">
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
