'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          router.replace('/dashboard');
          return;
        }

        // Escuchar por si el intercambio de tokens de Google toma unos instantes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe();
            router.replace('/dashboard');
          }
        });

        // Timeout de seguridad en caso de fallo
        timeout = setTimeout(() => {
          router.replace('/login');
        }, 5000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timeout);
        };
      } catch (err) {
        console.error('Error en autenticación callback:', err);
        router.replace('/login');
      }
    };

    handleAuth();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white gap-3">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      <p className="text-sm text-zinc-400">Autenticando con Google y preparando tu espacio...</p>
    </div>
  );
}
