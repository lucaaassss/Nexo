import { ArrowRight, Bot, CalendarDays, CheckCircle2, FolderKanban, MessageSquareText, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

/* ==================== DATOS ESTÁTICOS ==================== */
/**
 * Información de módulos del producto
 * No contiene datos de usuario, solo descripción de características
 */
const modules = [
  {
    title: 'Gestión de proyectos',
    description: 'Organiza equipos, permisos y entregables desde un espacio único.',
    icon: FolderKanban,
  },
  {
    title: 'Chat y colaboración',
    description: 'Comunicación contextual con mensajes, menciones y archivos.',
    icon: MessageSquareText,
  },
  {
    title: 'IA productiva',
    description: 'Divide proyectos, sugiere prioridades y resume conversaciones largas.',
    icon: Bot,
  },
  {
    title: 'Planificación visual',
    description: 'Kanban, lista, calendario y timeline sincronizados en tiempo real.',
    icon: CalendarDays,
  },
];

/* ==================== PÁGINA: HOME ==================== */
/**
 * PÁGINA: Inicio (Landing Page)
 * Propósito: Presentar Nexo y dar acceso al dashboard
 * 
 * Secciones:
 * - Hero con CTA al dashboard
 * - Descripción de características
 * - Módulos principales del producto
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:bg-white lg:px-8 lg:text-slate-900 lg:dark:bg-slate-950 lg:dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* ==================== SECCIÓN: HERO ==================== */}
        <header className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 sm:p-6 lg:bg-slate-50 lg:dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-300 dark:text-violet-200 lg:dark:text-violet-200">
              <Sparkles size={16} />
              SaaS premium para equipos modernos
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-2xl space-y-5">
              <h1 className="text-4xl font-bold tracking-tight text-slate-100 dark:text-slate-100 sm:text-5xl lg:text-slate-900 lg:dark:text-slate-100">
                Nexo centraliza tu trabajo, tus equipos y tu ejecución.
              </h1>
              <p className="max-w-xl text-lg text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                Gestiona proyectos, tareas, archivos y conversaciones desde una sola plataforma elegante, rápida y preparada para producción.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-3 font-semibold text-white transition hover:from-violet-600 hover:to-indigo-700"
                >
                  Entrar al dashboard
                </Link>
                <a
                  href="#modulos"
                  className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-6 py-3 font-semibold text-violet-300 transition hover:bg-violet-500/20 dark:text-violet-200 lg:dark:text-violet-200"
                >
                  Ver módulos
                </a>
              </div>
            </div>

            {/* Tarjeta de información */}
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
              <div className="flex items-center gap-3 rounded-lg border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200 dark:text-violet-300 lg:dark:text-violet-300">
                <Zap size={18} />
                IA + automatización + productividad
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-slate-900 p-3 dark:bg-slate-800 lg:bg-slate-50 lg:dark:bg-slate-800">
                  <p className="text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                    Stack tecnológico
                  </p>
                  <p className="mt-1 font-semibold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                    Next.js 14 + TypeScript
                  </p>
                </div>
                <div className="rounded-lg bg-slate-900 p-3 dark:bg-slate-800 lg:bg-slate-50 lg:dark:bg-slate-800">
                  <p className="text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                    Diseño responsivo
                  </p>
                  <p className="mt-1 font-semibold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                    Tailwind CSS + Claro/Oscuro
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ==================== SECCIÓN: DESCRIPCIÓN ==================== */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-violet-400 dark:text-violet-300">
              <CheckCircle2 size={20} />
              <p className="text-lg font-semibold">Diseño premium escalable</p>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
              Una plataforma pensada para operaciones reales.
            </h2>
            <p className="mt-3 max-w-2xl text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
              Nexo combina gestión visual, colaboración en tiempo real y automatización para que todo el ciclo de trabajo sea más rápido y ordenado.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-950/40 p-4 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
                <Users className="text-violet-400 dark:text-violet-300" />
                <h3 className="mt-3 font-semibold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                  Gestión de equipos
                </h3>
                <p className="mt-2 text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                  Invitaciones, roles y permisos con control fino.
                </p>
              </div>
              <div className="rounded-lg bg-slate-950/40 p-4 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
                <CalendarDays className="text-violet-400 dark:text-violet-300" />
                <h3 className="mt-3 font-semibold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                  Planificación visual
                </h3>
                <p className="mt-2 text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                  Kanban, lista, calendario y timeline.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:dark:bg-slate-900/50">
            <p className="text-sm uppercase tracking-widest text-violet-400 dark:text-violet-300 lg:text-slate-600 lg:dark:text-violet-300">
              Arquitectura preparada
            </p>
            <h3 className="mt-3 text-xl font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
              Stack moderno para Vercel
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
              <li>• Next.js 14 App Router para rendimiento y SEO</li>
              <li>• TypeScript para escalabilidad y seguridad</li>
              <li>• Tailwind CSS para diseño rápido y consistente</li>
              <li>• Componentes reutilizables listos para conectar a tu DB</li>
            </ul>
            <a href="#modulos" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 dark:text-violet-200 lg:dark:text-violet-300">
              Descubrir más <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* ==================== SECCIÓN: MÓDULOS ==================== */}
        <section id="modulos" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:dark:bg-slate-900/50">
          <div>
            <p className="text-sm uppercase tracking-widest text-violet-400 dark:text-violet-300 lg:text-slate-600 lg:dark:text-violet-300">
              Módulos principales
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
              Todo lo que necesita un equipo moderno
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.title}
                  className="rounded-lg border border-white/10 bg-slate-950/40 p-5 dark:border-slate-700 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900"
                >
                  <Icon className="text-violet-400 dark:text-violet-300" size={24} />
                  <h3 className="mt-3 font-semibold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                    {module.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
