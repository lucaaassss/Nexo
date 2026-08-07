import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  MessageSquareText,
  NotebookPen,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { aiSuggestions, chatMessages, metrics, projectTasks, recentFiles, teamActivity } from '@/lib/mock-data';

const stats = [
  { label: 'Proyectos activos', value: '128+' },
  { label: 'Tareas automatizadas', value: '4.2k' },
  { label: 'Tiempo ahorrado', value: '37%' },
];

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

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Hero / presentación principal */}
        <header className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-soft backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-sm text-violet-200">
              <Sparkles size={16} />
              SaaS premium para equipos modernos
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-2xl space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Nexo centraliza tu trabajo, tus equipos y tu ejecución.
              </h1>
              <p className="max-w-xl text-lg text-slate-300">
                Gestiona proyectos, tareas, archivos y conversaciones desde una sola plataforma elegante,
                rápida y preparada para producción.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#dashboard"
                  className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 font-medium text-white transition hover:opacity-90"
                >
                  Explorar plataforma
                </a>
                <a
                  href="#modulos"
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Ver módulos
                </a>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5 shadow-2xl">
              <div className="flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
                <Zap size={18} />
                IA + automatización + productividad en tiempo real
              </div>
              <div className="mt-4 grid gap-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="text-sm text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Bloque de experiencia y arquitectura */}
        <section id="dashboard" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-soft">
            <div className="flex items-center gap-2 text-violet-300">
              <CheckCircle2 size={18} />
              Diseño premium para equipos de alto rendimiento
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              Un panel de control de producto pensado para operaciones reales.
            </h2>
            <p className="mt-3 max-w-2xl text-slate-400">
              Nexo combina gestión visual, colaboración en tiempo real y automatización con IA para que todo
              el ciclo de trabajo sea más rápido y ordenado.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Users className="text-violet-300" />
                <h3 className="mt-3 font-semibold text-white">Gestión de equipos</h3>
                <p className="mt-2 text-sm text-slate-400">Invitaciones, roles y permisos con control fino.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <CalendarDays className="text-violet-300" />
                <h3 className="mt-3 font-semibold text-white">Planificación visual</h3>
                <p className="mt-2 text-sm text-slate-400">Kanban, lista, calendario y timeline sincronizados.</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Arquitectura preparada</p>
            <h3 className="mt-3 text-xl font-semibold text-white">Stack moderno para Vercel</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>• Next.js 14 App Router para rendimiento y SEO</li>
              <li>• TypeScript para escalabilidad y seguridad</li>
              <li>• Tailwind CSS para diseño rápido y consistente</li>
              <li>• Componentes reutilizables para UX premium</li>
            </ul>
            <a href="#modulos" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-200">
              Descubrir más <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* Módulos principales del producto */}
        <section id="modulos" className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Módulos principales</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Todo lo que necesita un equipo moderno</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <Icon className="text-violet-300" size={20} />
                  <h3 className="mt-3 font-semibold text-white">{module.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{module.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Panel de métricas, tareas y actividad */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-soft">
            <div className="flex items-center gap-2 text-violet-300">
              <NotebookPen size={18} />
              Vista de producto y operaciones
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-xs text-violet-200">{metric.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Tareas del sprint</h3>
                <span className="text-sm text-violet-200">4 pendientes</span>
              </div>
              <div className="mt-4 space-y-3">
                {projectTasks.map((task) => (
                  <div key={task.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="text-sm text-slate-400">{task.assignee} · {task.status}</p>
                    </div>
                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-200">{task.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-soft">
              <h3 className="font-semibold text-white">Actividad reciente</h3>
              <div className="mt-4 space-y-3">
                {teamActivity.map((activity) => (
                  <div key={activity.name} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-sm font-medium text-white">{activity.name}</p>
                    <p className="text-sm text-slate-400">{activity.action}</p>
                    <p className="mt-1 text-xs text-violet-200">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-soft">
              <h3 className="font-semibold text-white">IA y colaboración</h3>
              <div className="mt-4 space-y-3">
                {aiSuggestions.map((item) => (
                  <div key={item} className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-sm text-violet-100">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h4 className="font-medium text-white">Chat del proyecto</h4>
                <div className="mt-3 space-y-2">
                  {chatMessages.map((message) => (
                    <div key={`${message.author}-${message.time}`} className="rounded-xl bg-slate-950/40 p-3">
                      <p className="text-sm text-white">{message.author}</p>
                      <p className="mt-1 text-sm text-slate-400">{message.message}</p>
                      <p className="mt-1 text-xs text-violet-200">{message.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Archivos recientes y recursos compartidos */}
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Archivos recientes</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Centralización de documentos y recursos</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {recentFiles.map((file) => (
              <div key={file.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">{file.name}</p>
                <p className="mt-1 text-sm text-slate-400">{file.type}</p>
                <p className="mt-2 text-xs text-violet-200">{file.size}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
