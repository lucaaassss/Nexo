'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isMounted = true;

    const handleAuth = async () => {
      try {
        if (typeof window === 'undefined') return;

        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error') || url.searchParams.get('error_description');

        // Si Google o Supabase devolvieron un error explícito
        if (errorParam) {
          console.error('Error de autenticación desde el proveedor:', errorParam);
          if (isMounted) {
            setErrorMessage(url.searchParams.get('error_description') || 'Error al autenticar con Google');
          }
          timeout = setTimeout(() => {
            router.replace('/login');
          }, 3500);
          return;
        }

        // 1. Si viene el código de autorización PKCE, intercambiarlo por la sesión activa
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error al intercambiar código por sesión:', error);
          } else if (data?.session) {
            if (isMounted) router.replace('/');
            return;
          }
        }

        // 2. Verificar si ya existe una sesión activa (ej: tokens en hash o persistida)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error al consultar sesión:', sessionError);
        }
        
        if (session) {
          if (isMounted) router.replace('/');
          return;
        }

        // 3. Suscribirse por si el evento de sesión toma unos milisegundos
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (newSession && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
            subscription.unsubscribe();
            if (isMounted) router.replace('/');
          }
        });

        // 4. Timeout de seguridad si no se logra autenticar tras 4 segundos
        timeout = setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            if (isMounted) router.replace('/');
          } else {
            if (isMounted) router.replace('/login');
          }
        }, 4000);

        return () => {
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Error en autenticación callback:', err);
        if (isMounted) {
          setErrorMessage(err?.message || 'Error durante la autenticación.');
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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white gap-3 p-4 text-center">
      {errorMessage ? (
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10 text-rose-500 animate-bounce" />
          <p className="text-base font-semibold text-rose-300">{errorMessage}</p>
          <p className="text-xs text-zinc-400">Redirigiendo al inicio de sesión...</p>
        </div>
      ) : (
        <>
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm text-zinc-400">Autenticando con Google y preparando tu espacio principal...</p>
        </>
      )}
    </div>
  );
}
