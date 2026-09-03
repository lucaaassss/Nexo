'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import {
  UserPlus,
  ArrowRight,
  FolderKanban,
  Check,
  Sparkles,
  AlertCircle,
  Clock,
  Shield,
  Loader2,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const tokenOrId = (params?.id as string) || '';
  const { currentProject, setCurrentProject, currentUser, addMemberToProject } = useNexorSpace();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [hasActiveSession, setHasActiveSession] = useState<boolean>(false);

  // 1. Verificar estado de autenticación
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasActiveSession(!!session || !!currentUser?.email);
    });
  }, [currentUser]);

  // 2. Cargar y Validar Invitación
  useEffect(() => {
    if (!tokenOrId) return;

    setIsLoading(true);
    setErrorMessage(null);

    fetch(`/api/invite/${tokenOrId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.valid) {
          throw new Error(data.error || 'La invitación no es válida o ha expirado.');
        }
        setInvitationData(data.invitation);
      })
      .catch(async (err) => {
        // Fallback: Si el token es un ID de proyecto directo
        try {
          const resProjects = await fetch('/api/projects');
          const projects = resProjects.ok ? await resProjects.json() : [];
          const matched = Array.isArray(projects) ? projects.find((p: any) => p.id === tokenOrId) : null;
          if (matched) {
            setInvitationData({
              token: tokenOrId,
              email: currentUser?.email || '',
              role: 'MEMBER',
              roleLabel: 'Miembro',
              inviterName: 'Equipo de Nexor-Space',
              project: matched,
            });
            return;
          }
        } catch (_) {}

        setErrorMessage(err.message || 'No pudimos verificar la invitación.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tokenOrId, currentUser]);

  // 3. Aceptar Invitación
  const handleAccept = async () => {
    if (!tokenOrId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/invite/${tokenOrId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          email: currentUser?.email || invitationData?.email,
          userName: currentUser?.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al aceptar la invitación.');
      }

      // Sincronizar en store local del cliente
      const assignedRole = data.role || invitationData?.role || 'MEMBER';
      const projectId = data.projectId || invitationData?.project?.id;

      if (projectId) {
        addMemberToProject(projectId, currentUser?.email || invitationData?.email || 'colaborador@nexo.app', assignedRole);
        setCurrentProject(projectId);
      }

      // Limpiar token guardado si existía
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pending_invite_token');
      }

      setIsAccepted(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado.');
      setIsSubmitting(false);
    }
  };

  // Guardar token temporal para redirección a login/registro
  const handleRedirectToAuth = (mode: 'login' | 'register') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pending_invite_token', tokenOrId);
    }
    if (mode === 'register') {
      router.push(`/login?mode=register&inviteToken=${encodeURIComponent(tokenOrId)}`);
    } else {
      router.push(`/login?inviteToken=${encodeURIComponent(tokenOrId)}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Ícono Superior */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-lg shadow-violet-500/10">
          <UserPlus className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Invitación de Nexor-Space</span>
        </div>

        {/* Estado: Cargando */}
        {isLoading && (
          <div className="py-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
            <p className="text-xs text-zinc-400">Verificando enlace de invitación...</p>
          </div>
        )}

        {/* Estado: Error / Expirado */}
        {!isLoading && errorMessage && !invitationData && (
          <div className="space-y-4 my-2">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-left space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Enlace No Disponible</span>
              </div>
              <p className="text-xs text-rose-300/90 leading-relaxed">{errorMessage}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all text-center"
              >
                Ir a Iniciar Sesión
              </Link>
              <Link
                href="/"
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all text-center"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        )}

        {/* Estado: Invitación Válida */}
        {!isLoading && invitationData && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                ¡Te han invitado a colaborar!
              </h1>
              <p className="text-zinc-400 text-xs leading-relaxed">
                <strong className="text-zinc-200">{invitationData.inviterName}</strong> te ha invitado a unirte a su equipo de trabajo.
              </p>
            </div>

            {/* Tarjeta de Proyecto y Rol */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-md text-xs"
                  style={{ backgroundColor: invitationData.project?.color || '#7c3aed' }}
                >
                  {invitationData.project?.key || 'PRJ'}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-zinc-100 truncate">
                    {invitationData.project?.name || 'Proyecto de Nexor-Space'}
                  </h2>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                    {invitationData.project?.description || 'Espacio de trabajo compartido en Nexor-Space.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-violet-400" />
                  Rol asignado:
                </span>
                <span className="font-semibold text-violet-300 font-mono bg-violet-950/60 px-2.5 py-0.5 rounded-lg border border-violet-500/30">
                  {invitationData.roleLabel || invitationData.role}
                </span>
              </div>
            </div>

            {/* Error durante la aceptación */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Acciones según estado de sesión */}
            {hasActiveSession ? (
              <button
                onClick={handleAccept}
                disabled={isSubmitting || isAccepted}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Uniendo al proyecto...</span>
                  </>
                ) : isAccepted ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Invitación Aceptada! Redirigiendo...</span>
                  </>
                ) : (
                  <>
                    <span>Aceptar y Unirme al Proyecto</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-zinc-400 mb-2">
                  Iniciá sesión o registrate para vincularte automáticamente a este proyecto:
                </p>
                <button
                  onClick={() => handleRedirectToAuth('login')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión para Aceptar</span>
                </button>
                <button
                  onClick={() => handleRedirectToAuth('register')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Cuenta Nueva</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
          <span>Nexor-Space &copy; {new Date().getFullYear()}</span>
          <Link href="/dashboard" className="text-violet-400 hover:text-violet-300 font-medium">
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

