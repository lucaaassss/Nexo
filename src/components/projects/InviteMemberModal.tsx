'use client';

import React, { useState } from 'react';
import { X, UserPlus, Mail, Link as LinkIcon, Check, Loader2, AlertCircle } from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { MemberRole } from '@/types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente InviteMemberModal
 * Permite invitar a nuevos integrantes al proyecto por correo electrónico o mediante enlace directo.
 * Con soporte para Modo Claro y Modo Oscuro.
 */
export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { currentProject, addMemberToProject, currentUser } = useNexorSpace();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('MEMBER');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastGeneratedLink, setLastGeneratedLink] = useState<string>('');

  if (!isOpen || !currentProject) return null;

  const currentBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexor-space.app';
  const defaultInviteLink = lastGeneratedLink || `${currentBaseUrl}/invite/${currentProject.id}`;

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  /** Procesa la invitación por correo electrónico */
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Por favor ingresá un correo electrónico.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Por favor ingresá un correo electrónico válido (ejemplo@empresa.com).');
      return;
    }

    if (currentUser?.email && currentUser.email.toLowerCase() === cleanEmail) {
      setErrorMsg('No podés invitar a tu propia cuenta.');
      return;
    }

    const isAlreadyMember = currentProject.members?.some(
      (m) => m.user?.email?.toLowerCase() === cleanEmail
    );

    if (isAlreadyMember) {
      setErrorMsg('Este colaborador ya es integrante del proyecto.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          projectId: currentProject.id,
          projectName: currentProject.name,
          role: role,
          inviterName: currentUser.name,
        }),
      });

      const data = await res.json();

      if (data.inviteLink) {
        setLastGeneratedLink(data.inviteLink);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar la invitación');
      }

      // Añadir miembro en el sistema local
      addMemberToProject(currentProject.id, cleanEmail, role);

      setSuccessMsg(`¡Invitación enviada a ${cleanEmail} con éxito!`);
      setEmail('');

      // Cerrar después de unos segundos
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado al enviar correo');
    } finally {
      setIsLoading(false);
    }
  };

  /** Copia el enlace de invitación al portapapeles */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(defaultInviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Invitar Integrantes</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Proyecto: {currentProject.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Opción 1: Invitar por Email */}
          <form onSubmit={handleInvite} className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Invitar por Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400 dark:text-zinc-500" />
              <input
                type="email"
                required
                placeholder="colaborador@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-violet-500 disabled:opacity-70 shadow-xs"
              />
            </div>

            {/* Selección de Rol */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'ADMIN', label: 'Administrador', desc: 'Acceso total' },
                { id: 'LEADER', label: 'Líder', desc: 'Gestión de tareas y equipo' },
                { id: 'MEMBER', label: 'Miembro', desc: 'Crear y editar tareas' },
                { id: 'GUEST', label: 'Invitado', desc: 'Solo lectura y chat' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as MemberRole)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${role === r.id
                      ? 'bg-violet-50 dark:bg-violet-600/15 border-violet-300 dark:border-violet-500/50 text-violet-800 dark:text-violet-300 ring-1 ring-violet-500/20'
                      : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                    }`}
                >
                  <p className="text-xs font-semibold">{r.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-medium mt-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium mt-2">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!successMsg}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Invitación'
              )}
            </button>
          </form>

          {/* Opción 3: Enlace de Invitación Copiable */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Enlace de Enlace Directo</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={defaultInviteLink}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shrink-0 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
