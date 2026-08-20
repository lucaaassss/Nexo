'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  AtSign,
  ShieldCheck,
} from 'lucide-react';
import { useNexo } from '@/hooks/useNexo';
import { getInitials } from '@/lib/utils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente ProfileModal
 * Permite al usuario editar su nombre, apellido, usuario y foto de perfil,
 * sincronizándolo directamente con Supabase Auth y la base de datos.
 */
export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { currentUser, updateUserProfile } = useNexo();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [usuario, setUsuario] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializar estado con los datos del usuario actual al abrir
  useEffect(() => {
    if (isOpen && currentUser) {
      const parts = currentUser.name ? currentUser.name.split(' ') : ['', ''];
      setNombre(currentUser.nombre || parts[0] || '');
      setApellido(currentUser.apellido || parts.slice(1).join(' ') || '');
      setUsuario(currentUser.usuario || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || undefined);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  /** Procesa la selección y optimización de una nueva foto de perfil */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('La imagen no puede superar los 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.onload = () => {
          // Escalar a un tamaño óptimo para avatar (256x256)
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setAvatarUrl(optimizedDataUrl);
            setErrorMessage(null);
          } else {
            setAvatarUrl(event.target?.result as string);
            setErrorMessage(null);
          }
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  /** Elimina la foto de perfil personalizada */
  const handleRemoveImage = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /** Guarda los cambios de perfil en Supabase y estado local */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMessage('El nombre es obligatorio.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await updateUserProfile({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      usuario: usuario.trim().replace(/^@/, ''),
      avatarUrl: avatarUrl || '',
      bio: bio.trim(),
    });

    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('¡Perfil actualizado con éxito en la base de datos!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } else {
      setErrorMessage(result.error || 'No se pudo actualizar el perfil.');
    }
  };

  const displayName = `${nombre} ${apellido}`.trim() || currentUser.name || 'Usuario';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all my-auto max-h-[92vh] flex flex-col">
        {/* Header del Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/30 text-violet-700 dark:text-violet-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Mi Perfil</h2>
              <p className="text-xs text-zinc-500">Personaliza tu información y foto de perfil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes de Feedback */}
        {successMessage && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shrink-0 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 shrink-0 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario con scroll vertical interno si la pantalla es reducida */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Sección de Foto de Perfil */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-700 text-white font-bold text-lg flex items-center justify-center ring-3 ring-violet-500/20 shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getInitials(displayName)}</span>
                )}
              </div>

              {/* Botón Flotante para cambiar foto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Cambiar foto de perfil"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg border-2 border-white dark:border-zinc-900 transition-all cursor-pointer hover:scale-105"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Foto de Perfil</h3>
              <p className="text-[11px] text-zinc-500">
                Formatos PNG, JPG o WebP. Se actualiza en tu avatar.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Subir imagen
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Quitar</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-violet-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Apellido
              </label>
              <input
                type="text"
                placeholder="Tu apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-violet-500 shadow-sm"
              />
            </div>
          </div>

          {/* Nombre de Usuario y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre de Usuario (@)
              </label>
              <div className="relative">
                <AtSign className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-violet-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email || ''}
                  className="w-full bg-zinc-100/70 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>

          {/* Biografía / Rol */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Sobre ti (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Escribe brevemente tu rol o especialidad en el equipo..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-violet-500 shadow-sm resize-none"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Cambios</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
