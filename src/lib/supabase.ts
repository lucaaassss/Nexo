import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Cliente Singleton de Supabase para Autenticación y Consumo de APIs en Nexor-Space
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Indica si Supabase está configurado activamente con llaves reales en las variables de entorno.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
);

/**
 * Función auxiliar para Iniciar Sesión en Supabase Auth
 */
export async function signInUser({ email, password }: { email: string; password: string }) {
  if (typeof (supabase.auth as any).signInWithPassword === 'function') {
    return await (supabase.auth as any).signInWithPassword({ email, password });
  }
  return await (supabase.auth as any).signIn({ email, password });
}

/**
 * Función auxiliar para Registrar Usuario en Supabase Auth
 */
export async function signUpUser({
  email,
  password,
  nombre,
  apellido,
  usuario,
  role = 'MEMBER',
}: {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  usuario: string;
  role?: string;
}) {
  if (typeof (supabase.auth as any).signUp === 'function') {
    return await (supabase.auth as any).signUp({
      email,
      password,
      options: {
        data: { nombre, apellido, usuario, role },
      },
    });
  }
  return { data: null, error: new Error('Supabase signUp no disponible') };
}

/**
 * Obtiene la URL base de la aplicación de manera 100% dinámica.
 * Prioriza el dominio actual en el navegador (ej: https://tu-proyecto.vercel.app),
 * o variables de entorno de producción de Vercel.
 */
export function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`.replace(/\/+$/, '');
  }
  return '';
}

/**
 * Función auxiliar para Iniciar Sesión o Registrarse con Google vía OAuth
 * Redirige al flujo oficial de Google (accounts.google.com) y luego al /auth/callback en Vercel
 */
export async function signInWithGoogle() {
  const appUrl = getAppUrl();
  const redirectTo = appUrl ? `${appUrl}/auth/callback` : undefined;

  try {
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    return res;
  } catch (err: any) {
    console.error('Error al redirigir con Google OAuth:', err);
    return { data: null, error: err };
  }
}
