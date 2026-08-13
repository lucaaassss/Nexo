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
import { useNexo } from '@/hooks/useNexo';
import { formatDateTime, getInitials } from '@/lib/utils';
import { ChatMessage } from '@/types';

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '🚀', '🎉', '👀'];

/**
 * ChatBubble
 * Burbuja flotante que abre el chat del proyecto como popup en la esquina inferior derecha.
 */
export function ChatBubble() {
  const {
    projectMessages,
    sendChatMessage,
    toggleMessageReaction,
    currentProject,
    currentUser,
    uploadFile,
  } = useNexo();

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
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-2xl shadow-violet-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ring-2 ring-white/10"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-zinc-950 animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Panel del Chat Popup */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[380px] flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-black/50 overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[540px]'
          }`}
          style={{ maxHeight: 'calc(100vh - 5rem)' }}
        >
          {/* Header */}
          <div className="h-14 shrink-0 px-4 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-100 leading-none">
                  {currentProject?.name ?? 'Chat del Proyecto'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">
                  {filteredMessages.length} mensajes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen((s) => !s)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Buscar mensajes"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized((m) => !m)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          {!isMinimized && isSearchOpen && (
            <div className="px-3 py-2 border-b border-zinc-800/60 bg-zinc-950">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar en el chat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Mensajes */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-950/90">
                {filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs py-10">
                    <MessageSquare className="w-7 h-7 mb-2 opacity-30 text-violet-400" />
                    <p>El canal está listo. Sé el primero en escribir.</p>
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
                        <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 font-bold text-[9px] flex items-center justify-center border border-violet-500/30 shrink-0 mt-0.5">
                          {getInitials(msg.sender?.name || 'U')}
                        </div>

                        <div className={`max-w-[260px] space-y-0.5 ${isMine ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 px-1">
                            <span className="font-semibold text-zinc-400">{msg.sender?.name || 'Usuario'}</span>
                            <span>{formatDateTime(msg.createdAt)}</span>
                          </div>

                          {parentMsg && (
                            <div className="text-[9px] p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 italic mb-0.5">
                              ↩ {parentMsg.content.substring(0, 35)}...
                            </div>
                          )}

                          <div
                            className={`py-2 px-3 rounded-2xl text-xs leading-relaxed inline-block shadow ${
                              isMine
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none'
                                : 'bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-tl-none'
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
                                  className="px-1 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[9px] flex items-center gap-0.5 hover:border-violet-500/40"
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
                                className="hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="text-zinc-500 hover:text-violet-400 ml-1"
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
                <div className="px-3 py-1 text-[9px] text-violet-400 italic animate-pulse bg-zinc-950/90">
                  Alguien está escribiendo...
                </div>
              )}

              {replyingTo && (
                <div className="px-3 py-1.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>↩ {replyingTo.content.substring(0, 40)}...</span>
                  <button onClick={() => setReplyingTo(null)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center gap-1.5"
              >
                <label className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 cursor-pointer transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                  <input type="file" onChange={handleChatFileUpload} className="hidden" />
                </label>

                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={handleInputChange}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow shadow-violet-600/30 transition-all"
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
