'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Search,
  MessageSquare,
  Reply,
  X,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { formatDateTime, getInitials } from '@/lib/utils';
import { ChatMessage } from '@/types';

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '🚀', '🎉', '👀'];

/**
 * Componente ProjectChat
 * Chat integrado en tiempo real para el proyecto con hilos de respuesta, reacciones emoji,
 * menciones, adjuntos, presencia de usuarios e indicador de escritura.
 * Totalmente optimizado con soporte para Modo Claro y Modo Oscuro.
 */
export function ProjectChat() {
  const {
    projectMessages,
    sendChatMessage,
    toggleMessageReaction,
    currentProject,
    currentUser,
    uploadFile,
  } = useNexorSpace();

  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final al recibir o enviar un nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectMessages]);

  /** Envía un mensaje en el chat */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendChatMessage(messageInput.trim(), replyingTo?.id);
    setMessageInput('');
    setReplyingTo(null);
    setIsTyping(false);
  };

  /** Simula el indicador de escritura */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  /** Procesa la subida de un archivo en el chat */
  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fakeUrl = URL.createObjectURL(file);
      uploadFile(file.name, fakeUrl, file.size, file.type);
      sendChatMessage(`📎 Archivo adjunto: ${file.name}`);
    }
  };

  // Filtrar mensajes por búsqueda
  const filteredMessages = projectMessages.filter((m) =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-10rem)] max-w-6xl mx-auto">
      {/* Área Principal del Chat */}
      <div className="flex-1 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl flex flex-col justify-between overflow-hidden shadow-sm">
        {/* Header del Chat */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center text-violet-700 dark:text-violet-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Canal Principal - {currentProject?.name}
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Toda la comunicación centralizada</p>
            </div>
          </div>

          {/* Buscador de Mensajes */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar en el chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 shadow-xs"
            />
          </div>
        </div>

        {/* Historial de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/40">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs py-12">
              <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-violet-600 dark:text-violet-400" />
              <p className="font-medium text-zinc-600 dark:text-zinc-400">El canal está listo. Sé el primero en enviar un mensaje.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMine = msg.senderId === currentUser.id;
              const parentMsg = projectMessages.find((p) => p.id === msg.parentId);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-600/30 text-violet-700 dark:text-violet-300 font-bold text-[10px] flex items-center justify-center border border-violet-200 dark:border-violet-500/30 shrink-0">
                    {getInitials(msg.sender?.name || 'User')}
                  </div>

                  <div className={`max-w-md space-y-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 px-1">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {msg.sender?.name || 'Usuario'}
                      </span>
                      <span>{formatDateTime(msg.createdAt)}</span>
                    </div>

                    {/* Hilo de respuesta previo */}
                    {parentMsg && (
                      <div className="text-[10px] p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 italic mb-1">
                        Respondiendo a: {parentMsg.content.substring(0, 40)}...
                      </div>
                    )}

                    {/* Burbuja del Mensaje */}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed inline-block shadow-sm ${
                        isMine
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Reacciones Emoji */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {msg.reactions.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => toggleMessageReaction(msg.id, r.emoji)}
                            className="px-1.5 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] flex items-center gap-1 hover:border-violet-500/40 text-zinc-700 dark:text-zinc-300"
                          >
                            <span>{r.emoji}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Acciones de Mensaje (Hacer hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] pt-0.5">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => toggleMessageReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="text-zinc-400 hover:text-violet-600 dark:text-zinc-500 dark:hover:text-violet-400 ml-2 cursor-pointer"
                        title="Responder"
                      >
                        <Reply className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Indicador de Escritura */}
        {isTyping && (
          <div className="px-4 py-1 text-[10px] text-violet-600 dark:text-violet-400 italic animate-pulse bg-zinc-50 dark:bg-zinc-950">
            Alguien está escribiendo un mensaje...
          </div>
        )}

        {/* Barra de Respuesta Activa */}
        {replyingTo && (
          <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-400">
            <span>Respondiendo a: {replyingTo.content.substring(0, 50)}...</span>
            <button onClick={() => setReplyingTo(null)} className="hover:text-zinc-900 dark:hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Entrada de Mensaje */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 flex items-center gap-2">
          <label className="p-2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
            <Paperclip className="w-4 h-4" />
            <input type="file" onChange={handleChatFileUpload} className="hidden" />
          </label>

          <input
            type="text"
            placeholder="Escribe un mensaje o usa @para mencionar..."
            value={messageInput}
            onChange={handleInputChange}
            className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />

          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sidebar Derecha: Miembros Conectados */}
      <div className="w-full lg:w-64 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-4 space-y-4 shadow-sm">
        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          Equipo en Línea ({currentProject?.members?.length || 1})
        </h4>

        <div className="space-y-2">
          {(currentProject?.members || [
            { id: '1', user: currentUser, role: 'ADMIN' },
          ]).map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-600/30 text-violet-700 dark:text-violet-300 font-bold text-[9px] flex items-center justify-center border border-violet-200 dark:border-violet-500/30">
                    {getInitials(m.user?.name || 'User')}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-zinc-950" />
                </div>
                <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[100px]">
                  {m.user?.name}
                </span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 font-semibold">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
