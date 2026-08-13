import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexo - Plataforma Colaborativa de Gestión de Proyectos Enterprise',
  description:
    'Nexo centraliza la organización de tareas, la comunicación del equipo en tiempo real y el intercambio de archivos en una experiencia SaaS moderna y escalable.',
  keywords: ['gestión de proyectos', 'kanban', 'scrum', 'chat', 'archivos', 'ia', 'saas', 'linear', 'notion'],
  authors: [{ name: 'Nexo Team' }],
};

/**
 * RootLayout Principal de Nexo
 * Provee la estructura base HTML5, SEO meta-tags y configuración de temas.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-violet-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
