'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { ProfileSelector, UserRole } from './ProfileSelector';
import { signInUser, isSupabaseConfigured } from '@/lib/supabase';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {


  // Form State
  const [role, setRole] = useState<UserRole | null>('alumno');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Validation & Submission States
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // Email format regex
  const validateEmail = (emailStr: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr.trim());
  };

  const handleValidation = (): boolean => {
    const newErrors: { email?: string; password?: string; role?: string } = {};

    if (!role) {
      newErrors.role = 'Por favor seleccioná tu perfil (Alumno o Profesor).';
    }

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
      } else {
        // Modo Demo interactivo (para pruebas locales cuando no hay credenciales de Supabase)
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Simulación de credenciales de prueba o cualquier correo válido con contraseña segura
        const isDemoAccount =
          (email.trim().toLowerCase() === 'alumno@nexo.edu.ar' ||
            email.trim().toLowerCase() === 'profesor@nexo.edu.ar') &&
          password === 'nexo1234';

        // Permitir login si cumple formato demo o password >= 6 caracteres en desarrollo
        if (isDemoAccount || (email.includes('@') && password.length >= 6)) {
          setLoginSuccess(true);
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Bienvenido a Nexo
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Iniciá sesión para continuar.
        </p>
      </div>

      {/* Global Authentication Error Banner */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="flex items-start space-x-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-medium shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
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
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex items-center space-x-3 shadow-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>¡Autenticación exitosa como <strong>{role === 'alumno' ? 'Alumno' : 'Profesor'}</strong>! Conectando a Nexo...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Selector de Perfil */}
        <ProfileSelector
          selectedRole={role}
          onSelectRole={(r) => {
            setRole(r);
            if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
            if (authError) setAuthError(null);
          }}
          error={errors.role}
        />

        {/* Email Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="email-input"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            Correo electrónico <span className="text-violet-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors">
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
              placeholder="Ingresá tu correo electrónico"
              disabled={isLoading || loginSuccess}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
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

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password-input"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Contraseña <span className="text-violet-500">*</span>
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => e.preventDefault()}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500 rounded px-1"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors">
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
              placeholder="Ingresá tu contraseña"
              disabled={isLoading || loginSuccess}
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all duration-200 bg-white/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${
                errors.password
                  ? 'border-rose-500 dark:border-rose-500 focus:border-rose-500'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-violet-600 dark:focus:border-violet-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={0}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none focus:text-violet-500 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-rose-500 dark:text-rose-400 pt-0.5"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Custom Recordarme Checkbox */}
        <div className="flex items-center space-x-2.5 pt-1">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-violet-600 focus:ring-violet-500/50 dark:bg-zinc-900 accent-violet-600 cursor-pointer"
          />
          <label
            htmlFor="remember-me"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none"
          >
            Recordarme en este dispositivo
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className="relative w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white shadow-lg shadow-violet-600/25 dark:shadow-violet-900/40 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group"
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

        {/* Demo Hint Banner */}
        <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
            <span>💡 Credenciales de prueba:</span>
          </p>
          <p>• Alumno: <code className="text-violet-600 dark:text-violet-400">alumno@nexo.edu.ar</code> / <code className="text-violet-600 dark:text-violet-400">nexo1234</code></p>
          <p>• Profesor: <code className="text-indigo-600 dark:text-indigo-400">profesor@nexo.edu.ar</code> / <code className="text-indigo-600 dark:text-indigo-400">nexo1234</code></p>
        </div>
        {/* Switch to Register link */}
        {onSwitchToRegister && (
          <div className="text-center pt-2">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              ¿No tenés una cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline focus:outline-none"
              >
                Registrate acá
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

