import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexo | Plataforma de gestión de proyectos',
  description: 'Una plataforma SaaS moderna para gestionar proyectos, equipos y comunicación.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
