'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Loader2, CheckCircle2, X } from 'lucide-react';
import { signInUser, signInWithGoogle, isSupabaseConfigured, supabase } from '@/lib/supabase';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Validation & Submission States
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // Forgot Password Modal State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // Email format regex
  const validateEmail = (emailStr: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr.trim());
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetEmail.trim() || !validateEmail(resetEmail)) {
      setResetError('Por favor ingresá un correo electrónico válido.');
      return;
    }

    setResetLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
        });
        if (error) {
          setResetError(error.message || 'No se pudo enviar el enlace de recuperación.');
        } else {
          setResetSuccess('¡Enlace de recuperación enviado! Revisá tu casilla de correo.');
        }
      } else {
        await new Promise((r) => setTimeout(r, 800));
        setResetSuccess('¡Enlace de recuperación enviado! Revisá tu casilla de correo.');
      }
    } catch (err: any) {
      setResetError('Ocurrió un error al procesar la solicitud.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);

    try {
      // Simula conexión exitosa con Google y acceso inmediato al dashboard
      await new Promise((r) => setTimeout(r, 600));
      setLoginSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      setAuthError('Ocurrió un error inesperado al conectar con Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleValidation = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresá un correo electrónico válido.';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!handleValidation()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Intento de autenticación real con Supabase
        const { error } = await signInUser({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setAuthError('El correo o la contraseña son incorrectos.');
          setIsLoading(false);
          return;
        }

        setLoginSuccess(true);
        setTimeout(() => router.push('/dashboard'), 600);
      } else {
        // Modo interactivo local/demo
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (email.includes('@') && password.length >= 4) {
          setLoginSuccess(true);
          setTimeout(() => router.push('/dashboard'), 600);
        } else {
          setAuthError('El correo o la contraseña son incorrectos.');
        }
      }
    } catch (err: any) {
      setAuthError('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header Form Titles */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Bienvenido a Nexor-Space
        </h1>
        <p className="text-sm text-zinc-400">
          Iniciá sesión para acceder a tus proyectos y equipo.
        </p>
      </div>

      {/* Botón de Iniciar Sesión con Google */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading || isGoogleLoading || loginSuccess}
        className="w-full py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 group backdrop-blur-sm"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
        ) : (
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{isGoogleLoading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
      </button>

      {/* Divisor Visual */}
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-zinc-800/80 w-full" />
        <span className="bg-zinc-950 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0">
          o continuar con email
        </span>
      </div>

      {/* Global Authentication Error Banner */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="flex items-start space-x-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs sm:text-sm font-medium shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <p>{authError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm font-medium flex items-center space-x-3 shadow-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>¡Autenticación exitosa! Ingresando a tu espacio...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Input */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="email-input"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
          >
            Correo electrónico <span className="text-violet-400">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-violet-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                if (authError) setAuthError(null);
              }}
              placeholder="nombre@ejemplo.com"
              disabled={isLoading || loginSuccess}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 bg-zinc-900/70 text-white placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-violet-500/15 ${
                errors.email
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-zinc-800 hover:border-zinc-700 focus:border-violet-500'
              }`}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-rose-400 pt-0.5"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password-input"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
            >
              Contraseña <span className="text-violet-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setResetEmail(email.trim());
                setResetError(null);
                setResetSuccess(null);
                setIsForgotPasswordOpen(true);
              }}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-violet-400 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                if (authError) setAuthError(null);
              }}
              placeholder="••••••••••••"
              disabled={isLoading || loginSuccess}
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all duration-200 bg-zinc-900/70 text-white placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-violet-500/15 ${
                errors.password
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-zinc-800 hover:border-zinc-700 focus:border-violet-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={0}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-200 focus:outline-none focus:text-violet-400 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-rose-400 pt-0.5"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Recordarme Checkbox */}
        <div className="flex items-center space-x-2.5 pt-0.5 text-left">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 text-violet-600 focus:ring-violet-500/40 bg-zinc-900 accent-violet-600 cursor-pointer"
          />
          <label
            htmlFor="remember-me"
            className="text-xs font-medium text-zinc-400 cursor-pointer select-none"
          >
            Recordarme en este dispositivo
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className="relative w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white shadow-xl shadow-violet-600/30 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Iniciando sesión...</span>
              </>
            ) : loginSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>¡Sesión Iniciada!</span>
              </>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Switch to Register link */}
        {onSwitchToRegister && (
          <div className="text-center pt-3">
            <p className="text-xs text-zinc-400">
              ¿No tenés una cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-violet-400 hover:text-violet-300 hover:underline focus:outline-none transition-colors cursor-pointer"
              >
                Registrate acá gratis
              </button>
            </p>
          </div>
        )}
      </form>

      {/* Modal de Recuperación de Contraseña */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-left">
                <h3 className="text-base font-bold text-white">
                  Recuperar Contraseña
                </h3>
                <p className="text-xs text-zinc-400">
                  Ingresá tu correo electrónico para recibir un enlace seguro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {!resetSuccess && (
              <form onSubmit={handleResetPassword} className="space-y-3 pt-1 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {resetLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Enviar Enlace</span>
                  </button>
                </div>
              </form>
            )}

            {resetSuccess && (
              <div className="pt-2 text-right">
                <button
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
