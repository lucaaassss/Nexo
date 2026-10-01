'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'password_reset' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado del formulario de nueva contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isMounted = true;

    const handleAuth = async () => {
      try {
        if (typeof window === 'undefined') return;

        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error') || url.searchParams.get('error_description');
        const type = url.searchParams.get('type'); // 'recovery' para reset de contraseña

        // Si Google o Supabase devolvieron un error explícito
        if (errorParam) {
          console.error('Error de autenticación desde el proveedor:', errorParam);
          if (isMounted) {
            setErrorMessage(url.searchParams.get('error_description') || 'Error al autenticar');
            setStatus('error');
          }
          timeout = setTimeout(() => {
            router.replace('/login');
          }, 4000);
          return;
        }

        // 1. Escuchar el evento de auth para detectar PASSWORD_RECOVERY
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!isMounted) return;

          if (event === 'PASSWORD_RECOVERY') {
            // El usuario llegó desde un link de recuperación de contraseña
            subscription.unsubscribe();
            setStatus('password_reset');
            return;
          }

          if (event === 'SIGNED_IN' && session) {
            // Login normal (ej: Google OAuth exitoso)
            subscription.unsubscribe();
            setStatus('success');
            setTimeout(() => {
              if (isMounted) router.replace('/');
            }, 800);
            return;
          }
        });

        // 2. Si viene código PKCE (Google OAuth o Recovery), intercambiarlo
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error al intercambiar código por sesión:', error);
          } else if (data?.session) {
            // Verificar si es un flujo de recuperación revisando la URL o los metadatos
            if (type === 'recovery') {
              if (isMounted) {
                subscription.unsubscribe();
                setStatus('password_reset');
              }
              return;
            }
            // Login normal exitoso
            if (isMounted) {
              subscription.unsubscribe();
              setStatus('success');
              router.replace('/');
            }
            return;
          }
        }

        // 3. Verificar si ya existe sesión (tokens en hash o persistida)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error al consultar sesión:', sessionError);
        }

        if (session) {
          if (type === 'recovery') {
            if (isMounted) {
              subscription.unsubscribe();
              setStatus('password_reset');
            }
            return;
          }
          if (isMounted) {
            subscription.unsubscribe();
            setStatus('success');
            router.replace('/');
          }
          return;
        }

        // 4. Timeout de seguridad si no se logra autenticar
        timeout = setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            if (isMounted) {
              subscription.unsubscribe();
              setStatus('success');
              router.replace('/');
            }
          } else {
            if (isMounted) {
              subscription.unsubscribe();
              router.replace('/login');
            }
          }
        }, 5000);

        return () => {
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Error en autenticación callback:', err);
        if (isMounted) {
          setErrorMessage(err?.message || 'Error durante la autenticación.');
          setStatus('error');
        }
        timeout = setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    };

    handleAuth();

    return () => {
      isMounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [router]);

  // Manejar el cambio de contraseña
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden. Verificalas e intentá de nuevo.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        if (error.message?.includes('same password') || error.message?.includes('different')) {
          setPasswordError('La nueva contraseña debe ser diferente a la actual.');
        } else {
          setPasswordError(error.message || 'Error al actualizar la contraseña.');
        }
      } else {
        setStatus('success');
        setTimeout(() => router.replace('/dashboard'), 1500);
      }
    } catch (err: any) {
      setPasswordError('Ocurrió un error inesperado. Intentá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Vista: Formulario de nueva contraseña
  if (status === 'password_reset') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/30 mx-auto">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Nueva Contraseña</h1>
              <p className="text-sm text-zinc-400">Elegí una contraseña segura para tu cuenta.</p>
            </div>

            {/* Error banner */}
            {passwordError && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <p>{passwordError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {/* New password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Nueva Contraseña <span className="text-violet-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                    placeholder="Mínimo 8 caracteres"
                    required
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/70 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Confirmar Contraseña <span className="text-violet-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
                    placeholder="Repetí la contraseña"
                    required
                    className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/70 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>

              {/* Password strength hint */}
              {newPassword.length > 0 && (
                <p className={`text-xs font-medium ${newPassword.length >= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {newPassword.length >= 8
                    ? '✓ Contraseña válida'
                    : `Faltan ${8 - newPassword.length} caracteres para el mínimo`}
                </p>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Nueva Contraseña</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Vista: Éxito (contraseña cambiada o login exitoso)
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white gap-4 p-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-base font-semibold text-emerald-300">¡Contraseña actualizada!</p>
        <p className="text-xs text-zinc-400">Ingresando a tu espacio...</p>
        <Loader2 className="w-5 h-5 text-violet-500 animate-spin mt-1" />
      </div>
    );
  }

  // Vista: Error
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white gap-3 p-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 text-rose-500 animate-bounce" />
          <p className="text-base font-semibold text-rose-300">{errorMessage}</p>
          <p className="text-xs text-zinc-400">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  // Vista: Loading (estado inicial)
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white gap-3 p-4 text-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      <p className="text-sm text-zinc-400">Verificando sesión...</p>
    </div>
  );
}
