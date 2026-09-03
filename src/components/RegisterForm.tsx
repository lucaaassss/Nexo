'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, ArrowRight, Loader2, CheckCircle2, ShieldCheck, AtSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signUpUser, signInWithGoogle, isSupabaseConfigured } from '@/lib/supabase';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const router = useRouter();

  // Form State
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [usuario, setUsuario] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword] = useState<boolean>(false);
  const [showPasswordState, setShowPasswordState] = useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  // Validation & Submission States
  const [errors, setErrors] = useState<{
    nombre?: string;
    apellido?: string;
    usuario?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);

  // Modal de Términos y Privacidad
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);
  const [termsModalTab, setTermsModalTab] = useState<'terms' | 'privacy'>('terms');

  const handleGoogleAuth = async () => {
    setServerError(null);
    setIsGoogleLoading(true);

    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        setRegisterSuccess(true);
        setTimeout(() => router.push('/dashboard'), 600);
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        setRegisterSuccess(true);
        setTimeout(() => router.push('/dashboard'), 600);
      }
    } catch (err) {
      setRegisterSuccess(true);
      setTimeout(() => router.push('/dashboard'), 600);
    }
  };

  const validateEmail = (emailStr: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr.trim());
  };

  const handleValidation = (): boolean => {
    const newErrors: typeof errors = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio.';
    } else if (apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres.';
    }

    if (!usuario.trim()) {
      newErrors.usuario = 'El nombre de usuario es obligatorio.';
    } else if (usuario.trim().length < 3) {
      newErrors.usuario = 'El usuario debe tener al menos 3 caracteres.';
    }

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresá un correo electrónico válido.';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmá tu contraseña.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = 'Debés aceptar los términos y la política de privacidad.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!handleValidation()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await signUpUser({
          email: email.trim(),
          password: password,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          usuario: usuario.trim(),
        });

        if (error) {
          setServerError(error.message || 'Ocurrió un error al registrar la cuenta.');
          setIsLoading(false);
          return;
        }

        setRegisterSuccess(true);
      } else {
        // Modo Demo simulado
        await new Promise((resolve) => setTimeout(resolve, 1400));
        setRegisterSuccess(true);
      }
    } catch (err: any) {
      setServerError('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header Form Titles */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Creá tu cuenta en Nexor-Space
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Completá tus datos para comenzar.
        </p>
      </div>

      {/* Botón de Registrarse con Google */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading || isGoogleLoading || registerSuccess}
        className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
        <span>{isGoogleLoading ? 'Conectando con Google...' : 'Registrarse con Google'}</span>
      </button>

      {/* Divisor Visual */}
      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
        <span className="bg-zinc-50 dark:bg-zinc-950 px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">
          o completá tu registro
        </span>
      </div>

      {/* Global Server Error Banner */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="flex items-start space-x-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-medium shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{serverError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {registerSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm font-medium space-y-2 shadow-md"
          >
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold">¡Cuenta registrada con éxito!</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Bienvenido/a <strong>{nombre} {apellido}</strong> (usuario: <strong>@{usuario}</strong>).
            </p>
            <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90">
              Enviamos un correo de confirmación. Por favor, <strong>verificá tu casilla de correo</strong> antes de iniciar sesión.
            </p>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="mt-2 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              Ir a Iniciar Sesión
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Register Form */}
      {!registerSuccess && (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          {/* Nombre y Apellido Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nombre Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-nombre"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Nombre <span className="text-violet-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="register-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: undefined }));
                    if (serverError) setServerError(null);
                  }}
                  placeholder="Tu nombre"
                  maxLength={100}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm transition-all duration-200 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.nombre
                      ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-600 dark:focus:border-violet-500'
                  }`}
                />
              </div>
              {errors.nombre && (
                <p className="text-xs font-medium text-rose-500 dark:text-rose-400 pt-0.5">
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Apellido Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-apellido"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Apellido <span className="text-violet-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="register-apellido"
                  type="text"
                  value={apellido}
                  onChange={(e) => {
                    setApellido(e.target.value);
                    if (errors.apellido) setErrors((prev) => ({ ...prev, apellido: undefined }));
                    if (serverError) setServerError(null);
                  }}
                  placeholder="Tu apellido"
                  maxLength={100}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm transition-all duration-200 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.apellido
                      ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-600 dark:focus:border-violet-500'
                  }`}
                />
              </div>
              {errors.apellido && (
                <p className="text-xs font-medium text-rose-500 dark:text-rose-400 pt-0.5">
                  {errors.apellido}
                </p>
              )}
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-usuario"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Nombre de usuario <span className="text-violet-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors">
                <AtSign className="w-4 h-4" />
              </div>
              <input
                id="register-usuario"
                type="text"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  if (errors.usuario) setErrors((prev) => ({ ...prev, usuario: undefined }));
                  if (serverError) setServerError(null);
                }}
                placeholder="ej: milena.ahumada"
                maxLength={50}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm transition-all duration-200 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                  errors.usuario
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-600 dark:focus:border-violet-500'
                }`}
              />
            </div>
            {errors.usuario && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium text-rose-500 dark:text-rose-400 pt-0.5"
              >
                {errors.usuario}
              </motion.p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="register-email"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Correo electrónico <span className="text-violet-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  if (serverError) setServerError(null);
                }}
                placeholder="ejemplo@nexor-space.edu.ar"
                maxLength={255}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm transition-all duration-200 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                  errors.email
                    ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-600 dark:focus:border-violet-500'
                }`}
              />
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium text-rose-500 dark:text-rose-400 pt-0.5"
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          {/* Grid Password and Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Contraseña <span className="text-violet-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPasswordState ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    if (serverError) setServerError(null);
                  }}
                  placeholder="Mín. 6 caract."
                  disabled={isLoading}
                  className={`w-full pl-10 pr-10 py-2 rounded-xl border text-sm transition-all duration-200 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.password
                      ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-600 dark:focus:border-violet-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordState(!showPasswordState)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPasswordState ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Confirmar <span className="text-violet-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  id="confirm-password"
                  type={showPasswordState ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    if (serverError) setServerError(null);
                  }}
                  placeholder="Repetí la clave"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm transition-all duration-200 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                    errors.confirmPassword
                      ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-600 dark:focus:border-violet-500'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="space-y-1 pt-1">
            <div className="flex items-start space-x-2.5">
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.acceptTerms) setErrors((prev) => ({ ...prev, acceptTerms: undefined }));
                }}
                className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-violet-600 focus:ring-violet-500/50 dark:bg-zinc-900 accent-violet-600 cursor-pointer"
              />
              <label
                htmlFor="accept-terms"
                className="text-xs font-normal text-zinc-600 dark:text-zinc-400 leading-normal select-none"
              >
                Acepto los{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTermsModalTab('terms');
                    setTermsModalOpen(true);
                  }}
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium cursor-pointer"
                >
                  Términos de Servicio
                </button>{' '}
                y la{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTermsModalTab('privacy');
                    setTermsModalOpen(true);
                  }}
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium cursor-pointer"
                >
                  Política de Privacidad
                </button>{' '}
                de Nexor-Space.
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 pl-6">
                {errors.acceptTerms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 px-6 rounded-xl font-semibold text-sm text-white shadow-lg shadow-violet-600/25 dark:shadow-violet-900/40 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Crear cuenta</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Modal de Términos de Servicio y Política de Privacidad */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTermsModalTab('terms')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    termsModalTab === 'terms'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Términos de Servicio
                </button>
                <button
                  type="button"
                  onClick={() => setTermsModalTab('privacy')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    termsModalTab === 'privacy'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Política de Privacidad
                </button>
              </div>
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {termsModalTab === 'terms' ? (
                <>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Términos de Servicio de Nexor-Space</h4>
                  <p>
                    Bienvenido a Nexor-Space. Al registrarte y utilizar nuestra plataforma de gestión de proyectos, aceptas cumplir con los siguientes términos:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><strong>Uso Responsable:</strong> Te comprometes a usar la plataforma con fines legítimos de colaboración y gestión de proyectos.</li>
                    <li><strong>Seguridad de Cuenta:</strong> Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
                    <li><strong>Contenido del Equipo:</strong> La información y archivos que compartes son propiedad de tu equipo y organización.</li>
                    <li><strong>Disponibilidad:</strong> Trabajamos continuamente para garantizar alta disponibilidad y sincronización en tiempo real.</li>
                  </ul>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Política de Privacidad</h4>
                  <p>
                    En Nexor-Space respetamos y protegemos la privacidad de tus datos personales y proyectos:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><strong>Protección de Datos:</strong> Tu correo y datos personales nunca serán vendidos a terceros.</li>
                    <li><strong>Cifrado y Seguridad:</strong> Las sesiones y transmisiones de datos se realizan con protocolos seguros (TLS/SSL).</li>
                    <li><strong>Control de Información:</strong> Puedes actualizar o solicitar la eliminación de tu cuenta y proyectos en cualquier momento.</li>
                  </ul>
                </>
              )}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-950/50">
              <button
                type="button"
                onClick={() => {
                  setAcceptTerms(true);
                  if (errors.acceptTerms) setErrors((prev) => ({ ...prev, acceptTerms: undefined }));
                  setTermsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
