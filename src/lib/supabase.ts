import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de conexión a Supabase
 * Permite realizar operaciones CRUD en tus tablas existentes en Supabase.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
