'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Link as LinkIcon,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  RotateCcw,
  Trash2,
  Send,
  Info,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { MemberRole } from '@/types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PendingInvitation {
  id: string;
  token: string;
  email: string;
  role: MemberRole;
  roleLabel: string;
  inviterName?: string;
  isAccepted: boolean;
  isExpired: boolean;
  expiresAt: string;
  createdAt: string;
  inviteLink: string;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { currentProject, currentUser } = useNexorSpace();
  const [activeTab, setActiveTab] = useState<'create' | 'pending'>('create');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('MEMBER');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string>('');

  // Lista de invitaciones pendientes
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPendingInvitations = async () => {
    if (!currentProject?.id) return;
    setIsLoadingPending(true);
    try {
      const res = await fetch(`/api/invite?projectId=${encodeURIComponent(currentProject.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPendingInvitations(data.filter((inv) => !inv.isAccepted));
        }
      }
    } catch (e) {
      console.warn('Error al cargar invitaciones pendientes:', e);
    } finally {
      setIsLoadingPending(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentProject?.id) {
      fetchPendingInvitations();
    }
  }, [isOpen, currentProject?.id]);

  if (!isOpen || !currentProject) return null;

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
    setWarningMsg('');
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
          inviterName: currentUser.name || currentUser.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la invitación');
      }

      if (data.inviteLink) {
        setGeneratedInviteLink(data.inviteLink);
      }

      if (data.emailSent) {
        setSuccessMsg(`¡Invitación enviada por email a ${cleanEmail} exitosamente!`);
      } else {
        setWarningMsg(
          data.emailWarning ||
            'La invitación fue registrada en la base de datos. Podés copiar el enlace directo abajo para enviárselo al colaborador.'
        );
      }

      setEmail('');
      // Actualizar lista de pendientes
      fetchPendingInvitations();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado al generar invitación');
    } finally {
      setIsLoading(false);
    }
  };

  /** Copia un enlace al portapapeles */
  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  /** Cancelar invitación pendiente */
  const handleCancelInvite = async (invitationId: string) => {
    if (!confirm('¿Estás seguro de que querés cancelar esta invitación pendiente?')) return;
    setActionLoadingId(invitationId);
    try {
      const res = await fetch(`/api/invite?id=${encodeURIComponent(invitationId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPendingInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      } else {
        const d = await res.json();
        alert(d.error || 'No se pudo cancelar la invitación');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  /** Reenviar invitación pendiente */
  const handleResendInvite = async (invitationId: string) => {
    setActionLoadingId(invitationId);
    try {
      const res = await fetch('/api/invite/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invitationId }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchPendingInvitations();
        if (data.inviteLink) {
          handleCopy(data.inviteLink);
        }
        alert(data.message || 'Invitación renovada con éxito.');
      } else {
        alert(data.error || 'Error al reenviar');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Invitar al Equipo</h2>
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

        {/* Pestañas de Navegación del Modal */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 px-6 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nueva Invitación</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Invitaciones Pendientes ({pendingInvitations.length})</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: CREAR INVITACIÓN */}
          {activeTab === 'create' && (
            <div className="space-y-5">
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Correo Electrónico del Invitado
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
                </div>

                {/* Selección de Rol */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Rol asignado en el proyecto
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'ADMIN', label: 'Administrador', desc: 'Acceso total y configuración' },
                      { id: 'LEADER', label: 'Líder', desc: 'Gestión de tareas y equipo' },
                      { id: 'MEMBER', label: 'Miembro', desc: 'Editar tareas asignadas' },
                      { id: 'GUEST', label: 'Invitado', desc: 'Solo lectura y chat' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as MemberRole)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          role === r.id
                            ? 'bg-violet-50 dark:bg-violet-600/15 border-violet-400 dark:border-violet-500/60 text-violet-800 dark:text-violet-300 ring-1 ring-violet-500/20'
                            : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <p className="text-xs font-semibold">{r.label}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mensaje de Error */}
                {errorMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Mensaje de Envío Exitoso */}
                {successMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Advertencia Transparente sobre el Mail / Fallback */}
                {warningMsg && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1 text-left">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Aviso sobre el envío por email:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-95">{warningMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando invitación...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Generar Invitación y Enviar Correo</span>
                    </>
                  )}
                </button>
              </form>

              {/* Enlace Directo Generado (Fallback 100% Funcional) */}
              {generatedInviteLink && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-left animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-violet-400" />
                      <span>Enlace Directo de Invitación (Token Único de 7 Días)</span>
                    </label>
                    <span className="text-[10px] font-mono text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/30 font-semibold">
                      Rol: {role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedInviteLink)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shrink-0 transition-all cursor-pointer shadow-sm"
                    >
                      {copiedLink === generatedInviteLink ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Copiá y compartí este enlace directamente con el invitado. Al abrirlo, se vinculará automáticamente al proyecto con su rol asignado.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVITACIONES PENDIENTES */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {isLoadingPending ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500 mx-auto" />
                  <p className="text-xs text-zinc-400">Cargando invitaciones pendientes...</p>
                </div>
              ) : pendingInvitations.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-zinc-950/40 border border-zinc-800/60 p-6 space-y-2">
                  <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-bold text-zinc-300">No hay invitaciones pendientes</p>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Las invitaciones enviadas que aún no han sido aceptadas aparecerán aquí para que puedas gestionarlas o cancelarlas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {pendingInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{inv.email}</p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-500/30 font-semibold">
                            {inv.roleLabel}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {inv.isExpired ? (
                            <span className="text-rose-400 font-semibold">Expirada</span>
                          ) : (
                            <span>Vence: {new Date(inv.expiresAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Copiar enlace */}
                        <button
                          onClick={() => handleCopy(inv.inviteLink)}
                          title="Copiar enlace directo"
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800 flex items-center gap-1"
                        >
                          {copiedLink === inv.inviteLink ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                          <span className="text-[11px]">{copiedLink === inv.inviteLink ? 'Copiado' : 'Link'}</span>
                        </button>

                        {/* Reenviar / Renovar */}
                        <button
                          onClick={() => handleResendInvite(inv.id)}
                          disabled={actionLoadingId === inv.id}
                          title="Reenviar y renovar invitación"
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800 flex items-center gap-1"
                        >
                          {actionLoadingId === inv.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                          )}
                          <span className="text-[11px]">Reenviar</span>
                        </button>

                        {/* Cancelar / Eliminar */}
                        <button
                          onClick={() => handleCancelInvite(inv.id)}
                          disabled={actionLoadingId === inv.id}
                          title="Cancelar invitación"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer border border-rose-500/20 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Cancelar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
