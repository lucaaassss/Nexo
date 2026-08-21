import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Cliente Singleton de Supabase para Autenticación y Consumo de APIs en Nexor-Space
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
