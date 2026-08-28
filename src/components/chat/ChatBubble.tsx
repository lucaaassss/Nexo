'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Search,
  Reply,
  ChevronDown,
  Minus,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { formatDateTime, getInitials } from '@/lib/utils';
import { ChatMessage } from '@/types';

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '🚀', '🎉', '👀'];

/**
 * ChatBubble
 * Burbuja flotante que abre el chat del proyecto como popup en la esquina inferior derecha.
 * Adaptado con soporte perfecto y alto contraste para Modo Claro y Modo Oscuro.
 */
export function ChatBubble() {
  const {
    projectMessages,
    sendChatMessage,
    toggleMessageReaction,
    currentProject,
    currentUser,
    uploadFile,
  } = useNexorSpace();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(projectMessages.length);

  // Auto-scroll al final al recibir o enviar un nuevo mensaje
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [projectMessages, isOpen, isMinimized]);

  // Conteo de mensajes no leídos cuando el popup está cerrado
  useEffect(() => {
    if (!isOpen || isMinimized) {
      const newMsgs = projectMessages.length - prevMessageCount.current;
      if (newMsgs > 0) {
        setUnreadCount((c) => c + newMsgs);
      }
    } else {
      setUnreadCount(0);
    }
    prevMessageCount.current = projectMessages.length;
  }, [projectMessages, isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendChatMessage(messageInput.trim(), replyingTo?.id);
    setMessageInput('');
    setReplyingTo(null);
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

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

  const filteredMessages = projectMessages.filter((m) =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Burbuja flotante */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Abrir chat del proyecto"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-2xl shadow-violet-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ring-2 ring-white/20 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-zinc-950 animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Panel del Chat Popup */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[380px] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-2xl shadow-black/20 dark:shadow-black/60 overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[540px]'
          }`}
          style={{ maxHeight: 'calc(100vh - 5rem)' }}
        >
          {/* Header */}
          <div className="h-14 shrink-0 px-4 flex items-center justify-between bg-zinc-50/90 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center text-violet-700 dark:text-violet-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                  {currentProject?.name ?? 'Chat del Proyecto'}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-none">
                  {filteredMessages.length} mensajes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen((s) => !s)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Buscar mensajes"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized((m) => !m)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label={isMinimized ? 'Expandir chat' : 'Minimizar chat'}
              >
                {isMinimized ? (
                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Cerrar chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          {!isMinimized && isSearchOpen && (
            <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-950">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar en el chat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Mensajes */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-50/60 dark:bg-zinc-950/90">
                {filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-500 text-xs py-10">
                    <MessageSquare className="w-7 h-7 mb-2 opacity-40 text-violet-600 dark:text-violet-400" />
                    <p className="font-medium text-zinc-600 dark:text-zinc-400">El canal está listo. Sé el primero en escribir.</p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isMine = msg.senderId === currentUser.id;
                    const parentMsg = projectMessages.find((p) => p.id === msg.parentId);

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-600/30 text-violet-700 dark:text-violet-300 font-bold text-[9px] flex items-center justify-center border border-violet-200 dark:border-violet-500/30 shrink-0 mt-0.5 shadow-xs">
                          {getInitials(msg.sender?.name || 'U')}
                        </div>

                        <div className={`max-w-[260px] space-y-0.5 ${isMine ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 px-1">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{msg.sender?.name || 'Usuario'}</span>
                            <span>{formatDateTime(msg.createdAt)}</span>
                          </div>

                          {parentMsg && (
                            <div className="text-[9px] p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 italic mb-0.5">
                              ↩ {parentMsg.content.substring(0, 35)}...
                            </div>
                          )}

                          <div
                            className={`py-2 px-3 rounded-2xl text-xs leading-relaxed inline-block shadow-sm ${
                              isMine
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                          </div>

                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 pt-0.5">
                              {msg.reactions.map((r) => (
                                <button
                                  key={r.id}
                                  onClick={() => toggleMessageReaction(msg.id, r.emoji)}
                                  className="px-1.5 py-0.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] flex items-center gap-0.5 hover:border-violet-500/40 text-zinc-700 dark:text-zinc-300"
                                >
                                  <span>{r.emoji}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] pt-0.5">
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
                              className="text-zinc-400 hover:text-violet-600 dark:text-zinc-500 dark:hover:text-violet-400 ml-1 cursor-pointer"
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

              {isTyping && (
                <div className="px-3 py-1 text-[9px] text-violet-600 dark:text-violet-400 italic animate-pulse bg-zinc-50 dark:bg-zinc-950/90">
                  Alguien está escribiendo...
                </div>
              )}

              {replyingTo && (
                <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-700 dark:text-zinc-400">
                  <span>↩ {replyingTo.content.substring(0, 40)}...</span>
                  <button onClick={() => setReplyingTo(null)} className="hover:text-zinc-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="p-2.5 border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/90 flex items-center gap-1.5"
              >
                <label className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                  <input type="file" onChange={handleChatFileUpload} className="hidden" />
                </label>

                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={handleInputChange}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow shadow-violet-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
