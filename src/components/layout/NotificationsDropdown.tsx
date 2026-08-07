'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useNexo } from '@/hooks/useNexo';
import { formatDateTime } from '@/lib/utils';

/**
 * Componente NotificationsDropdown
 * Menú desplegable para visualizar notificaciones en tiempo real con indicador de no leídos.
 */
export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationsAsRead } = useNexo();

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
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-violet-400" />
                <h3 className="font-semibold text-sm text-zinc-100">Notificaciones</h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markNotificationsAsRead}
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar leídas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/40">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50 text-violet-400" />
                  <p className="text-xs">No tienes notificaciones pendientes</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 transition-colors hover:bg-zinc-800/40 ${
                      !notif.read ? 'bg-violet-950/15' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-zinc-200">{notif.title}</h4>
                      <span className="text-[10px] text-zinc-500">
                        {formatDateTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
