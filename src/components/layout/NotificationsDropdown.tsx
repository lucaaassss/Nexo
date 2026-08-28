'use client';

import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Inbox,
  UserPlus,
  ClipboardList,
  MessageSquare,
  AtSign,
  Info,
  Trash2,
  X,
} from 'lucide-react';
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
    icon: <UserPlus className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
    dot: 'bg-violet-500',
    bg: 'bg-violet-100 dark:bg-violet-600/20',
    label: 'Invitación',
  },
  TASK_ASSIGNED: {
    icon: <ClipboardList className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
    dot: 'bg-sky-500',
    bg: 'bg-sky-100 dark:bg-sky-500/20',
    label: 'Tarea asignada',
  },
  COMMENT: {
    icon: <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    label: 'Comentario',
  },
  MENTION: {
    icon: <AtSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    dot: 'bg-amber-500',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    label: 'Mención',
  },
  SYSTEM: {
    icon: <Info className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />,
    dot: 'bg-zinc-400',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    label: 'Sistema',
  },
};

/**
 * Componente NotificationsDropdown
 * Menú desplegable para visualizar notificaciones en tiempo real con botones visibles para eliminarlas.
 */
export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationsAsRead, deleteNotification, clearAllNotifications } = useNexorSpace();

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
        title="Bandeja de Notificaciones"
        aria-label="Abrir bandeja de notificaciones"
        className="relative p-2.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer shadow-xs flex items-center justify-center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-violet-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay transparente para cerrar al hacer clic afuera */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menú de Notificaciones */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-600 text-[10px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markNotificationsAsRead}
                    title="Marcar todas como leídas"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 font-semibold transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Leídas</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    title="Eliminar todas las notificaciones"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/50 font-semibold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Borrar todo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Notificaciones */}
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/40">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40 text-violet-500" />
                  <p className="text-xs font-medium">No tienes notificaciones</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const config = NOTIF_CONFIG[notif.type] ?? NOTIF_CONFIG.SYSTEM;
                  return (
                    <div
                      key={notif.id}
                      className={`group relative p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                        !notif.read ? 'bg-violet-50/60 dark:bg-violet-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono del tipo */}
                        <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${config.bg} shadow-xs`}>
                          {config.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                {notif.title}
                              </h4>
                              {!notif.read && (
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 flex-shrink-0 font-mono">
                              {formatDateTime(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Botones de acción en cada notificación */}
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                            {notif.linkUrl && (
                              <a
                                href={notif.linkUrl}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition-all cursor-pointer"
                              >
                                <span>Aceptar / Ver</span>
                                <span aria-hidden="true">&rarr;</span>
                              </a>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              title="Eliminar notificación"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/50 transition-all cursor-pointer ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pie del dropdown */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950/40 text-center">
                <p className="text-[10px] font-medium text-zinc-500">
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
