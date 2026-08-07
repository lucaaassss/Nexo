"use client";

import { useMemo, useState } from 'react';
import { ArrowRight, Bot, CalendarDays, CheckCircle2, FolderKanban, MessageSquareText, Plus, Search, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { projectTasks, teamActivity, recentFiles, aiSuggestions, chatMessages, metrics } from '@/lib/mock-data';

type TaskStatus = 'Pendiente' | 'En progreso' | 'Revisión' | 'Finalizada' | 'Cancelada';

type Task = {
  id: number;
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
};

const initialTasks: Task[] = projectTasks.map((task, index) => ({
  id: index + 1,
  title: task.title,
  assignee: task.assignee,
  status: task.status as TaskStatus,
  priority: task.priority as Task['priority'],
}));

const statusOrder: TaskStatus[] = ['Pendiente', 'En progreso', 'Revisión', 'Finalizada', 'Cancelada'];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState('');
  const [taskTitle, setTaskTitle] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

  const addTask = () => {
    if (!taskTitle.trim()) return;
    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title: taskTitle.trim(),
        assignee: 'Nuevo',
        status: 'Pendiente',
        priority: 'Media',
      },
    ]);
    setTaskTitle('');
  };

  const moveTask = (id: number, direction: -1 | 1) => {
    setTasks((current) => {
      const index = current.findIndex((task) => task.id === id);
      if (index === -1) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const updated = [...current];
      const [task] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, task);
      return updated;
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-soft backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-sm text-violet-200">
                <Sparkles size={16} />
                Panel de operaciones funcional
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Gestiona tu sprint desde un tablero real</h1>
              <p className="mt-2 max-w-2xl text-slate-300">Crea tareas, busca trabajo, organiza estados y mantén todo visible para tu equipo.</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
                Volver al inicio
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Tareas</p>
                <h2 className="text-xl font-semibold text-white">Tablero interactivo</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-transparent text-sm text-slate-200 outline-none"
                  placeholder="Buscar tarea"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3 sm:flex-row">
              <input
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none"
                placeholder="Agregar nueva tarea"
              />
              <button onClick={addTask} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white">
                <Plus size={16} />
                Crear tarea
              </button>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {filteredTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-white">{task.title}</h3>
                    <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs text-violet-200">{task.priority}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Responsable: {task.assignee}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-slate-950/40 px-2.5 py-1 text-xs text-slate-300">{task.status}</span>
                    <button onClick={() => moveTask(task.id, -1)} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-200">Mover ↑</button>
                    <button onClick={() => moveTask(task.id, 1)} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-200">Mover ↓</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-soft">
              <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Métricas</p>
              <div className="mt-4 space-y-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xl font-semibold text-white">{metric.value}</p>
                    <p className="text-sm text-slate-400">{metric.label}</p>
                    <p className="mt-1 text-xs text-violet-200">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-white">IA de planificación</h3>
              <div className="mt-4 space-y-3">
                {aiSuggestions.map((item) => (
                  <div key={item} className="rounded-2xl border border-violet-400/20 bg-slate-900/40 p-3 text-sm text-violet-100">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-soft">
            <div className="flex items-center gap-2 text-violet-300">
              <MessageSquareText size={18} />
              Chat del proyecto
            </div>
            <div className="mt-4 space-y-3">
              {chatMessages.map((message) => (
                <div key={`${message.author}-${message.time}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{message.author}</p>
                    <p className="text-xs text-violet-200">{message.time}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{message.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-soft">
            <div className="flex items-center gap-2 text-violet-300">
              <FolderKanban size={18} />
              Archivos recientes
            </div>
            <div className="mt-4 space-y-3">
              {recentFiles.map((file) => (
                <div key={file.name} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{file.type} · {file.size}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-soft">
          <div className="flex items-center gap-2 text-violet-300">
            <Users size={18} />
            Actividad del equipo
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {teamActivity.map((activity) => (
              <div key={activity.name} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="font-medium text-white">{activity.name}</p>
                <p className="mt-2 text-sm text-slate-400">{activity.action}</p>
                <p className="mt-2 text-xs text-violet-200">{activity.time}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
