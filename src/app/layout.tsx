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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Aplicar tema antes del primer paint para evitar flash
                var stored = localStorage.getItem('nexo_theme');
                var prefersDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (!prefersDark) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }

                // Limpiar atributos de extensiones del navegador
                var observer = new MutationObserver(function(mutations) {
                  for (var i = 0; i < mutations.length; i++) {
                    if (mutations[i].attributeName === 'bis_skin_checked') {
                      mutations[i].target.removeAttribute('bis_skin_checked');
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked']
                });
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-violet-600 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
