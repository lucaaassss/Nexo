'use client'; // Directiva de Next.js: indica que este componente se ejecuta en el navegador (lado del cliente) para permitir interactividad y estados de React.

// Importación de React y hooks para manejo de estado
import React, { useState } from 'react';
// Hook de Next.js para navegación y redirecciones programáticas entre rutas
import { useRouter } from 'next/navigation';
// Componentes de Framer Motion para animaciones fluidas y animaciones de entrada/salida (montaje/desmontaje)
import { motion, AnimatePresence } from 'framer-motion';
// Íconos visuales de la librería Lucide React
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Loader2, CheckCircle2, X } from 'lucide-react';
// Funciones de autenticación y cliente de Supabase importados de la configuración del proyecto
import { signInUser, signInWithGoogle, isSupabaseConfigured, supabase } from '@/lib/supabase';
// Store global de la aplicación (para almacenar datos de sesión y tareas en memoria/localStorage)
import { store } from '@/lib/store';

// Definición de las propiedades (props) que recibe este componente
interface LoginFormProps {
  // Función opcional para alternar a la vista de registro si estamos en una misma pantalla dividida
  onSwitchToRegister?: () => void;
}

// Componente principal de Login (Inicio de sesión)
export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  // Instancia del router para redireccionar al usuario a otras páginas (ej: /dashboard)
  const router = useRouter();

  // ==========================================
  // ESTADOS DEL FORMULARIO PRINCIPAL
  // ==========================================
  // Guarda el texto ingresado en el campo de correo electrónico
  const [email, setEmail] = useState<string>('');
  // Guarda el texto ingresado en el campo de contraseña
  const [password, setPassword] = useState<string>('');
  // Booleano para alternar entre ver la contraseña en texto plano o en asteriscos
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // Booleano para la casilla de verificación "Recordarme"
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // ==========================================
  // ESTADOS DE VALIDACIÓN Y CONTROL DE CARGA
  // ==========================================
  // Guarda los mensajes de error individuales de cada campo ({ email: "...", password: "..." })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  // Guarda mensajes de error globales provenientes del servidor o de la autenticación
  const [authError, setAuthError] = useState<string | null>(null);
  // Indica si la petición de inicio de sesión con email/password está en curso (muestra spinner)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Indica si la autenticación con Google está en curso
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  // Indica si el inicio de sesión fue exitoso para mostrar animación de confirmación antes de redirigir
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // ==========================================
  // ESTADOS DEL MODAL "RECUPERAR CONTRASEÑA"
  // ==========================================
  // Controla la visibilidad del modal de recuperación de contraseña
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  // Almacena el correo ingresado en el modal de recuperación
  const [resetEmail, setResetEmail] = useState<string>('');
  // Indica si el envío del correo de recuperación está cargando
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  // Mensaje de éxito tras enviar el correo de recuperación
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  // Mensaje de error si falla el envío de recuperación
  const [resetError, setResetError] = useState<string | null>(null);

  // ==========================================
  // VALIDACIONES
  // ==========================================
  // Función auxiliar con Expresión Regular para comprobar que el email tenga formato correcto (usuario@dominio.ext)
  const validateEmail = (emailStr: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr.trim());
  };

  // Valida los campos del formulario antes de enviarlo
  const handleValidation = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Comprobación de email vacío o con formato inválido
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresá un correo electrónico válido.';
    }

    // Comprobación de contraseña obligatoria
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    }

    // Actualizamos el estado de errores
    setErrors(newErrors);
    // Retorna true si no hay ningún error (objeto vacío)
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // MANEJADOR: RECUPERACIÓN DE CONTRASEÑA
  // ==========================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue por el submit del formulario
    setResetError(null); // Limpia errores previos
    setResetSuccess(null); // Limpia mensajes de éxito previos

    // Validar que el correo no esté vacío y tenga formato correcto
    if (!resetEmail.trim() || !validateEmail(resetEmail)) {
      setResetError('Por favor ingresá un correo electrónico válido.');
      return;
    }

    setResetLoading(true); // Activa el spinner de carga en el botón del modal
    try {
      if (isSupabaseConfigured) {
        // Si Supabase está conectado, envía el mail de reseteo oficial.
        // El redirectTo debe apuntar a /auth/callback para que Supabase maneje el token correctamente.
        const redirectTo = typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
          redirectTo,
        });
        if (error) {
          // Traducir errores comunes de Supabase al español
          if (error.message?.includes('rate limit') || error.message?.includes('Too many')) {
            setResetError('Demasiadas solicitudes. Esperá unos minutos antes de intentarlo de nuevo.');
          } else if (error.message?.includes('not found') || error.message?.includes('user')) {
            // Por seguridad, no revelamos si el correo existe o no
            setResetSuccess('Si existe una cuenta con ese correo, recibirás el enlace en breve.');
          } else {
            setResetError(error.message || 'No se pudo enviar el enlace de recuperación.');
          }
        } else {
          setResetSuccess('¡Enlace de recuperación enviado! Revisá tu casilla de correo (también la carpeta de spam).');
        }
      } else {
        // Sin Supabase configurado, avisar al usuario
        setResetError('La recuperación de contraseña requiere que Supabase esté configurado. Completá las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el archivo .env.local.');
      }
    } catch (err: any) {
      setResetError('Ocurrió un error al procesar la solicitud. Verificá tu conexión e intentá de nuevo.');
    } finally {
      setResetLoading(false); // Apaga el estado de carga
    }
  };

  // ==========================================
  // MANEJADOR: INICIAR SESIÓN CON GOOGLE
  // ==========================================
  const handleGoogleAuth = async () => {
    setAuthError(null); // Limpia errores anteriores
    setIsGoogleLoading(true); // Activa el spinner en el botón de Google

    try {
      if (isSupabaseConfigured) {
        // Dispara la redirección OAuth con Google provista por Supabase
        const { error } = await signInWithGoogle();
        if (error) {
          // Mensajes de error específicos según el tipo de fallo
          if (error.message?.includes('provider') || error.message?.includes('Provider')) {
            setAuthError('El proveedor de Google no está habilitado en tu proyecto Supabase. Activalo en Authentication → Providers → Google en el panel de Supabase.');
          } else if (error.message?.includes('redirect') || error.message?.includes('URL')) {
            setAuthError('URL de redirección no permitida. Agregá ' + window.location.origin + '/auth/callback en Supabase → Authentication → URL Configuration → Redirect URLs.');
          } else {
            setAuthError(error.message || 'Error al conectar con Google. Verificá la configuración de OAuth en Supabase.');
          }
          setIsGoogleLoading(false);
        }
        // Si no hay error, la redirección a Google ocurre automáticamente
      } else {
        // Si no están configuradas las variables de entorno de Supabase
        setAuthError('El inicio de sesión con Google requiere Supabase configurado. Usá email y contraseña por ahora, o completá las variables en .env.local.');
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setAuthError('Ocurrió un error inesperado al conectar con Google. Intentá con email y contraseña.');
      setIsGoogleLoading(false);
    }
  };

  // ==========================================
  // MANEJADOR: SUBMIT DEL FORMULARIO DE LOGIN
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recargar la página
    setAuthError(null); // Resetea cualquier error previo

    // Si la validación de campos falla, cancela el envío
    if (!handleValidation()) {
      return;
    }

    setIsLoading(true); // Activa el estado de carga del botón principal

    try {
      let loggedUser: any = null;

      // PASO 1: Si Supabase está disponible, validamos credenciales en Supabase Auth
      if (isSupabaseConfigured) {
        const { data, error } = await signInUser({
          email: email.trim(),
          password: password,
        });

        // Si Supabase rechaza las credenciales, muestra error y detiene el flujo
        if (error) {
          setAuthError('El correo o la contraseña son incorrectos.');
          setIsLoading(false);
          return;
        }

        // Si fue exitoso, formateamos los datos del usuario obtenido
        if (data?.user) {
          loggedUser = {
            id: data.user.id,
            email: data.user.email || email.trim(),
            name: data.user.user_metadata?.nombre || email.split('@')[0],
            role: 'MEMBER',
          };
        }
      }

      // PASO 2: Validar o sincronizar el usuario con el backend local (SQLite / API)
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const loginData = await loginRes.json();
      // Si la API local falla:
      // - Sin Supabase: mostrar error (no hay otro método de autenticación)
      // - Con Supabase: ignorar error local (Supabase ya autenticó correctamente)
      if (!loginRes.ok && !isSupabaseConfigured) {
        setAuthError(loginData.error || 'El correo o la contraseña son incorrectos.');
        setIsLoading(false);
        return;
      }
      // Con Supabase configurado y la API local fallando, igual continuamos
      // (el usuario ya fue validado por Supabase en el paso anterior)
      if (!loginRes.ok && isSupabaseConfigured && !loggedUser) {
        setAuthError('El correo o la contraseña son incorrectos.');
        setIsLoading(false);
        return;
      }

      // Consolidamos la información del usuario activo (de la API local, de Supabase o un fallback seguro)
      const activeUser = loginData.user || loggedUser || {
        id: 'usr_' + Date.now(),
        email: email.trim(),
        name: email.split('@')[0],
        role: email.includes('admin') ? 'ADMIN' : 'MEMBER',
        createdAt: new Date().toISOString(),
      };

      // PASO 3: Guardamos el usuario en el store global y sincronizamos datos de la base de datos
      store.setCurrentUser(activeUser);
      await store.syncWithDatabase();

      // PASO 4: Comprobamos si el usuario ingresó a través de un link de invitación a un espacio de trabajo
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const pendingInviteToken =
        urlParams?.get('inviteToken') || (typeof window !== 'undefined' ? localStorage.getItem('pending_invite_token') : null);

      // Activamos el cartel verde de éxito
      setLoginSuccess(true);

      // PASO 5: Redirección según corresponda (a la invitación pendiente o al dashboard)
      if (pendingInviteToken) {
        setTimeout(() => router.push(`/invite/${encodeURIComponent(pendingInviteToken)}`), 500);
      } else {
        setTimeout(() => router.push('/dashboard'), 600);
      }
    } catch (err: any) {
      setAuthError('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsLoading(false); // Desactiva el indicador de carga
    }
  };

  // ==========================================
  // RENDERIZADO DEL COMPONENTE (INTERFAZ JSX)
  // ==========================================
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Encabezado: Título y subtítulo de bienvenida */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Bienvenido a Nexor-Space
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Iniciá sesión para acceder a tus proyectos y equipo.
        </p>
      </div>

      {/* Botón de Autenticación Rápida con Google */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={isLoading || isGoogleLoading || loginSuccess}
        className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 group backdrop-blur-sm"
      >
        {/* Spinner animado si está conectando con Google, de lo contrario muestra el logo SVG de Google */}
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-violet-600 dark:text-violet-400" />
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

      {/* Separador Visual: Línea horizontal + texto "o continuar con email" */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider shrink-0 select-none">
          o continuar con email
        </span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Banner animado para Errores de Autenticación */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="flex items-start space-x-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-left">
              <p>{authError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner animado de Éxito de Inicio de Sesión */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm font-medium flex items-center space-x-3 shadow-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>¡Autenticación exitosa! Ingresando a tu espacio...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario Tradicional de Email y Contraseña */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Campo de Correo Electrónico */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="email-input"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            Correo electrónico <span className="text-violet-600 dark:text-violet-400">*</span>
          </label>
          <div className="relative group">
            {/* Ícono de sobre a la izquierda */}
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            {/* Input de texto para email */}
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Si el usuario empieza a escribir, quitamos el error que existía previamente
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                if (authError) setAuthError(null);
              }}
              placeholder="nombre@ejemplo.com"
              disabled={isLoading || loginSuccess}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 bg-white dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-violet-500/15 ${
                errors.email
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-violet-500'
              }`}
            />
          </div>
          {/* Mensaje de validación debajo del input de email */}
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 pt-0.5"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Campo de Contraseña */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password-input"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Contraseña <span className="text-violet-600 dark:text-violet-400">*</span>
            </label>
            {/* Enlace / Botón para abrir el modal de contraseña olvidada */}
            <button
              type="button"
              onClick={() => {
                setResetEmail(email.trim()); // Precarga el correo si ya lo escribió
                setResetError(null);
                setResetSuccess(null);
                setIsForgotPasswordOpen(true);
              }}
              className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative group">
            {/* Ícono de candado a la izquierda */}
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            {/* Input de contraseña (alterna entre 'password' y 'text') */}
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                // Si el usuario escribe, limpiamos errores de contraseña
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                if (authError) setAuthError(null);
              }}
              placeholder="••••••••••••"
              disabled={isLoading || loginSuccess}
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all duration-200 bg-white dark:bg-zinc-900/70 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-violet-500/15 ${
                errors.password
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 focus:border-violet-500'
              }`}
            />
            {/* Botón de ojito a la derecha para ver/ocultar los caracteres de la contraseña */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={0}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none focus:text-violet-600 dark:focus:text-violet-400 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Mensaje de validación debajo del input de contraseña */}
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 pt-0.5"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Checkbox "Recordarme en este dispositivo" */}
        <div className="flex items-center space-x-2.5 pt-0.5 text-left">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-violet-600 focus:ring-violet-500/40 bg-white dark:bg-zinc-900 accent-violet-600 cursor-pointer"
          />
          <label
            htmlFor="remember-me"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer select-none"
          >
            Recordarme en este dispositivo
          </label>
        </div>

        {/* Botón Principal de Envío (Submit) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className="relative w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white shadow-xl shadow-violet-600/30 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-violet-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
          >
            {/* Si está cargando muestra spinner, si tuvo éxito muestra tilde verde, de lo contrario texto normal */}
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

        {/* Enlace para cambiar a la pantalla o tab de Registro */}
        {onSwitchToRegister && (
          <div className="text-center pt-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              ¿No tenés una cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline focus:outline-none transition-colors cursor-pointer"
              >
                Registrate acá gratis
              </button>
            </p>
          </div>
        )}
      </form>

      {/* ==========================================
          MODAL DE RECUPERACIÓN DE CONTRASEÑA
          ========================================== */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          {/* Tarjeta interna del modal */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            {/* Cabecera del modal con botón de cierre (X) */}
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-left">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Recuperar Contraseña
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Ingresá tu correo electrónico para recibir un enlace seguro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cartel de confirmación si el email de recuperación se envió correctamente */}
            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* Cartel de error si falló el envío */}
            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {/* Formulario de ingreso de email para recuperación (se oculta tras el envío exitoso) */}
            {!resetSuccess && (
              <form onSubmit={handleResetPassword} className="space-y-3 pt-1 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                {/* Botones de acción del modal: Cancelar y Enviar Enlace */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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

            {/* Botón "Entendido" para cerrar el modal cuando ya se envió con éxito */}
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
