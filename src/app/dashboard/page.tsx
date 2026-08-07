'use client';

import { useState } from 'react';
import { CheckCircle2, FolderKanban, MessageSquareText, Paperclip, Plus, Search, Send, Sparkles, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

/* ==================== TIPOS DE DATOS ==================== */
/**
 * Define las estructuras de datos principales de la aplicación
 * Estas interfaces coinciden con tu modelo de base de datos
 */

type TaskStatus = 'Pendiente' | 'En progreso' | 'Revisión' | 'Finalizada' | 'Cancelada';
type TaskPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  priority: TaskPriority;
  description?: string;
  dueDate?: string;
}

interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: string;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

/* ==================== FUNCIONES AUXILIARES ==================== */

/**
 * Función para formatear timestamp a formato legible
 * @param date - Date object o string ISO
 * @returns Hora formateada HH:mm
 */
const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/* ==================== COMPONENTE PRINCIPAL ==================== */
/**
 * PÁGINA: Dashboard
 * Propósito: Panel de operaciones principal para gestionar proyectos
 * 
 * Módulos incluidos:
 * - Gestión de tareas (CRUD)
 * - Chat en tiempo real
 * - Compartir archivos
 * - Métricas del proyecto
 */
export default function DashboardPage() {
  // ========== ESTADO: TAREAS ==========
  /**
   * Estado para gestionar la lista de tareas
   * TODO: Conectar a API GET /api/tasks
   */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTask, setSearchTask] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Media');

  // ========== ESTADO: CHAT ==========
  /**
   * Estado para gestionar mensajes del chat
   * TODO: Conectar a WebSocket o API polling para actualizaciones en tiempo real
   */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');

  // ========== ESTADO: ARCHIVOS ==========
  /**
   * Estado para gestionar archivos compartidos
   * TODO: Conectar a API POST /api/files para subir archivos
   */
  const [files, setFiles] = useState<ProjectFile[]>([]);

  // ========== ESTADO: PROYECTO ==========
  /**
   * Estado general del proyecto
   * TODO: Conectar a API GET /api/project/{projectId}
   */
  const [projectName] = useState('Mi Proyecto');

  /* ==================== FUNCIONES: TAREAS ==================== */
  
  /**
   * Crear una nueva tarea
   * Validación: No permite tareas sin título
   * TODO: Llamar POST /api/tasks con los datos
   */
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      assignee: newTaskAssignee || 'Sin asignar',
      status: 'Pendiente',
      priority: newTaskPriority,
      dueDate: new Date().toISOString(),
    };

    // TODO: Reemplazar con: 
    // const response = await fetch('/api/tasks', { 
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newTask) 
    // })
    // const createdTask = await response.json()
    // setTasks([...tasks, createdTask])

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewTaskPriority('Media');
  };

  /**
   * Actualizar una tarea existente
   * TODO: Llamar PUT /api/tasks/{taskId} con los datos actualizados
   */
  const handleUpdateTask = (id: string, patch: Partial<Task>) => {
    // TODO: Reemplazar con: 
    // await fetch(`/api/tasks/${id}`, { 
    //   method: 'PUT', 
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(patch) 
    // })

    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  };

  /**
   * Eliminar una tarea
   * TODO: Llamar DELETE /api/tasks/{taskId}
   */
  const handleDeleteTask = (id: string) => {
    // TODO: Reemplazar con:
    // await fetch(`/api/tasks/${id}`, { method: 'DELETE' })

    setTasks(tasks.filter((task) => task.id !== id));
  };

  /**
   * Cambiar estado de una tarea (por ejemplo, marcar como completada)
   * TODO: Llamar PUT /api/tasks/{taskId}/status
   */
  const handleCompleteTask = (id: string) => {
    handleUpdateTask(id, { status: 'Finalizada' });
  };

  /**
   * Filtrar tareas por búsqueda
   * Se ejecuta en cliente para UX rápida
   * Búsqueda por título, responsable o estado
   */
  const filteredTasks = tasks.filter((task) => {
    const search = searchTask.toLowerCase();
    return (
      task.title.toLowerCase().includes(search) ||
      task.assignee.toLowerCase().includes(search) ||
      task.status.toLowerCase().includes(search)
    );
  });

  /* ==================== FUNCIONES: CHAT ==================== */

  /**
   * Enviar un mensaje al chat del proyecto
   * Validación: No permite mensajes vacíos
   * TODO: Llamar POST /api/chat/messages con el contenido
   */
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      author: 'Tú',
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    // TODO: Reemplazar con:
    // const response = await fetch('/api/chat/messages', { 
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newMessage) 
    // })
    // const savedMessage = await response.json()
    // setMessages([...messages, savedMessage])

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  /* ==================== FUNCIONES: ARCHIVOS ==================== */

  /**
   * Manejar subida de archivos
   * Abre un input file y luego sube a servidor
   * TODO: Implementar multipart/form-data a POST /api/files
   */
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // TODO: Crear FormData y enviar a POST /api/files
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('projectId', projectId);
      // const response = await fetch('/api/files', { 
      //   method: 'POST', 
      //   body: formData 
      // })
      // const uploadedFile = await response.json()
      // setFiles([uploadedFile, ...files])

      const newFile: ProjectFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type || 'Archivo desconocido',
        size: `${(file.size / 1024).toFixed(2)} KB`,
        uploadedAt: new Date().toISOString(),
      };

      setFiles([newFile, ...files]);
    };
    input.click();
  };

  /* ==================== MÉTRICAS CALCULADAS ==================== */

  /**
   * Calcular estadísticas del proyecto
   * Se recalculan automáticamente cuando cambian las tareas
   */
  const completedCount = tasks.filter((t) => t.status === 'Finalizada').length;
  const totalCount = tasks.length;
  const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const inProgressCount = tasks.filter((t) => t.status === 'En progreso').length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 lg:bg-white lg:text-slate-900 lg:dark:bg-slate-950 lg:dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ==================== SECCIÓN: HEADER ==================== */}
        <header className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:text-slate-900 lg:dark:bg-slate-900/50 lg:dark:text-slate-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-300 dark:text-violet-200 lg:dark:text-violet-200">
                <Sparkles size={16} />
                Panel de operaciones
              </div>
              <h1 className="text-3xl font-bold text-slate-100 dark:text-slate-100 sm:text-4xl lg:text-slate-900 lg:dark:text-slate-100">
                Gestiona tu sprint
              </h1>
              <p className="mt-2 max-w-2xl text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                Crea tareas, actualiza estados y comunica cambios con tu equipo en tiempo real.
              </p>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Link
                href="/"
                className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20 dark:hover:bg-violet-500/20 lg:bg-slate-100 lg:text-slate-700 lg:hover:bg-slate-200 lg:dark:bg-slate-800 lg:dark:text-slate-300 lg:dark:hover:bg-slate-700"
              >
                ← Inicio
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

          {/* ==================== SECCIÓN: GESTIÓN DE TAREAS ==================== */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:dark:bg-slate-900/50">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-violet-400 dark:text-violet-300 lg:text-slate-600 lg:dark:text-violet-300">
                  Gestión de tareas
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                  Tablero interactivo
                </h2>
              </div>

              {/* ========== BÚSQUEDA DE TAREAS ========== */}
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
                <Search size={16} className="text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchTask}
                  onChange={(e) => setSearchTask(e.target.value)}
                  placeholder="Buscar tarea..."
                  className="bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500 dark:text-slate-300 lg:text-slate-900 lg:placeholder:text-slate-400 lg:dark:bg-slate-900 lg:dark:text-slate-300"
                />
              </div>
            </div>

            {/* ========== FORMULARIO: CREAR TAREA ========== */}
            <div className="mb-6 space-y-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 dark:border-slate-700 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                  placeholder="Título de la tarea..."
                  className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 lg:bg-slate-50 lg:text-slate-900 lg:dark:bg-slate-900 lg:dark:text-slate-300"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 lg:bg-slate-50 lg:text-slate-900 lg:dark:bg-slate-900 lg:dark:text-slate-300"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  placeholder="Responsable..."
                  className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 lg:bg-slate-50 lg:text-slate-900 lg:dark:bg-slate-900 lg:dark:text-slate-300"
                />
                <button
                  onClick={handleCreateTask}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-violet-600 hover:to-indigo-700"
                >
                  <Plus size={16} />
                  Crear
                </button>
              </div>
            </div>

            {/* ========== LISTA: TAREAS FILTRADAS ========== */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-600 bg-slate-950/20 p-8 text-center dark:bg-slate-900/20 lg:bg-slate-100 lg:dark:bg-slate-900/20">
                  <p className="text-slate-500 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                    {tasks.length === 0 ? 'Crea tu primera tarea' : 'No hay tareas que coincidan'}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-white/10 bg-slate-950/50 p-4 dark:border-slate-700 dark:bg-slate-900/50 lg:bg-white lg:dark:bg-slate-900/50"
                  >
                    {/* Título y prioridad */}
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleUpdateTask(task.id, { title: e.target.value })}
                        className="flex-1 bg-transparent text-base font-semibold text-slate-100 outline-none dark:text-slate-200 lg:text-slate-900 lg:dark:text-slate-100"
                      />
                      <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-medium text-violet-300 dark:text-violet-200 lg:dark:text-violet-200">
                        {task.priority}
                      </span>
                    </div>

                    {/* Estado y responsable */}
                    <div className="mb-4 grid gap-3 sm:grid-cols-[150px_1fr]">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 dark:bg-slate-900 dark:text-slate-300 lg:bg-slate-50 lg:text-slate-900 lg:dark:bg-slate-900 lg:dark:text-slate-300"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En progreso">En progreso</option>
                        <option value="Revisión">Revisión</option>
                        <option value="Finalizada">Finalizada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                      <input
                        type="text"
                        value={task.assignee}
                        onChange={(e) => handleUpdateTask(task.id, { assignee: e.target.value })}
                        placeholder="Responsable"
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 dark:bg-slate-900 dark:text-slate-300 lg:bg-slate-50 lg:text-slate-900 lg:dark:bg-slate-900 lg:dark:text-slate-300"
                      />
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 dark:text-emerald-200 lg:dark:text-emerald-300"
                      >
                        <CheckCircle2 size={14} />
                        Completar
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20 dark:text-rose-200 lg:dark:text-rose-300"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ==================== SECCIÓN: MÉTRICAS ==================== */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:dark:bg-slate-900/50">
              <p className="text-sm uppercase tracking-widest text-violet-400 dark:text-violet-300 lg:text-slate-600 lg:dark:text-violet-300">
                Métricas
              </p>

              {/* Tarjetas de métricas */}
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-slate-950/40 p-4 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
                  <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                    {completionRate}%
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                    Progreso general
                  </p>
                </div>
                <div className="rounded-lg bg-slate-950/40 p-4 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
                  <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                    {completedCount}/{totalCount}
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                    Tareas completadas
                  </p>
                </div>
                <div className="rounded-lg bg-slate-950/40 p-4 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
                  <p className="text-2xl font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                    {inProgressCount}
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                    En ejecución
                  </p>
                </div>
              </div>
            </div>

            {/* ========== INFORMACIÓN DEL PROYECTO ========== */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-violet-400 dark:text-violet-300">
                <FolderKanban size={20} />
                <h3 className="text-lg font-bold">Proyecto</h3>
              </div>
              <div className="mt-4 rounded-lg bg-slate-950/40 p-4 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
                <p className="text-sm text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                  Nombre del proyecto
                </p>
                <p className="mt-1 font-semibold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                  {projectName}
                </p>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-500 lg:text-slate-600 lg:dark:text-slate-500">
                TODO: Conectar a GET /api/project/{'{projectId}'}
              </p>
            </div>
          </section>
        </div>

        {/* ==================== SECCIÓN: CHAT Y ARCHIVOS ==================== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

          {/* ========== CHAT ========== */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:dark:bg-slate-900/50">
            <div className="mb-4 flex items-center gap-2 text-violet-400 dark:text-violet-300">
              <MessageSquareText size={20} />
              <h3 className="text-lg font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                Chat del proyecto
              </h3>
            </div>

            {/* Área de mensajes */}
            <div className="mb-4 max-h-64 space-y-2 overflow-y-auto rounded-lg bg-slate-950/40 p-4 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                  Aún no hay mensajes. TODO: Conectar a WebSocket
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="rounded-lg bg-slate-900 p-2 dark:bg-slate-800">
                    <p className="text-xs font-semibold text-violet-300 dark:text-violet-200 lg:dark:text-violet-200">
                      {msg.author}
                    </p>
                    <p className="text-sm text-slate-200 dark:text-slate-300 lg:text-slate-900 lg:dark:text-slate-300">
                      {msg.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Formulario enviar mensaje */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none focus:border-violet-500 dark:bg-slate-900 dark:text-slate-200 lg:bg-slate-50 lg:text-slate-900 lg:dark:bg-slate-900 lg:dark:text-slate-300"
              />
              <button
                onClick={handleSendMessage}
                className="flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-600"
              >
                <Send size={16} />
              </button>
            </div>
          </section>

          {/* ========== ARCHIVOS ========== */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 lg:bg-slate-50 lg:dark:bg-slate-900/50">
            <div className="mb-4 flex items-center gap-2 text-violet-400 dark:text-violet-300">
              <Paperclip size={20} />
              <h3 className="text-lg font-bold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                Archivos
              </h3>
            </div>

            <button
              onClick={handleFileUpload}
              className="mb-4 w-full rounded-lg border-2 border-dashed border-violet-500/50 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20 dark:text-violet-200 lg:dark:text-violet-300"
            >
              + Adjuntar archivo
            </button>

            {/* Lista de archivos */}
            <div className="space-y-2">
              {files.length === 0 ? (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                  Aún no hay archivos
                </p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-lg bg-slate-950/40 p-3 dark:bg-slate-900 lg:bg-white lg:dark:bg-slate-900"
                  >
                    <p className="text-sm font-semibold text-slate-100 dark:text-slate-100 lg:text-slate-900 lg:dark:text-slate-100">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-400 lg:text-slate-600 lg:dark:text-slate-400">
                      {file.type} · {file.size}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
