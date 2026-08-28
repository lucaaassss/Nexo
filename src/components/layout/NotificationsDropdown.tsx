'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, Inbox, UserPlus, ClipboardList, MessageSquare, AtSign, Info } from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { formatDateTime } from '@/lib/utils';
import { NotificationItem } from '@/types';

/**
 * Configuración visual por tipo de notificación
 */
const NOTIF_CONFIG: Record<
  NotificationItem['type'],
  { icon: React.ReactNode; dot: string; bg: string; label: string }
> = {
  INVITE: {
    icon: <UserPlus className="w-4 h-4" />,
    dot: 'bg-violet-500',
    bg: 'bg-violet-500/10 text-violet-400',
    label: 'Invitación',
  },
  TASK_ASSIGNED: {
    icon: <ClipboardList className="w-4 h-4" />,
    dot: 'bg-sky-500',
    bg: 'bg-sky-500/10 text-sky-400',
    label: 'Tarea asignada',
  },
  COMMENT: {
    icon: <MessageSquare className="w-4 h-4" />,
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-500/10 text-emerald-400',
    label: 'Comentario',
  },
  MENTION: {
    icon: <AtSign className="w-4 h-4" />,
    dot: 'bg-amber-500',
    bg: 'bg-amber-500/10 text-amber-400',
    label: 'Mención',
  },
  SYSTEM: {
    icon: <Info className="w-4 h-4" />,
    dot: 'bg-zinc-400',
    bg: 'bg-zinc-700/40 text-zinc-400',
    label: 'Sistema',
  },
};

/**
 * Componente NotificationsDropdown
 * Menú desplegable para visualizar notificaciones en tiempo real con indicador de no leídos.
 * Diferencia visualmente cada tipo: invitaciones, tareas, comentarios, menciones y sistema.
 */
export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationsAsRead } = useNexorSpace();

  const unreadCount = notifications.filter((n) => !n.read).length;

  /** Maneja la apertura y marca como leídas las notificaciones */
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        title="Notificaciones"
        className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all border border-transparent hover:border-violet-500/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-violet-500 rounded-full ring-4 ring-zinc-900 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay transparente para cerrar al hacer clic afuera */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menú de Notificaciones */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-violet-400" />
                <h3 className="font-semibold text-sm text-zinc-100">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-[10px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markNotificationsAsRead}
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar leídas
                </button>
              )}
            </div>

            {/* Lista de Notificaciones */}
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800/40">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50 text-violet-400" />
                  <p className="text-xs">No tienes notificaciones pendientes</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const config = NOTIF_CONFIG[notif.type] ?? NOTIF_CONFIG.SYSTEM;
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 transition-colors hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40 ${
                        !notif.read ? 'bg-violet-50/70 dark:bg-violet-950/15' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono del tipo */}
                        <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${config.bg}`}>
                          {config.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 leading-tight">{notif.title}</h4>
                              {!notif.read && (
                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 flex-shrink-0 mt-0.5">
                              {formatDateTime(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{notif.message}</p>

                          {notif.linkUrl && (
                            <div className="mt-2">
                              <a
                                href={notif.linkUrl}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition-colors"
                              >
                                <span>Ver invitación</span>
                                <span aria-hidden="true">&rarr;</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pie del dropdown */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-zinc-800/60 bg-zinc-950/40 text-center">
                <p className="text-[10px] text-zinc-600">
                  {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''} en total
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
