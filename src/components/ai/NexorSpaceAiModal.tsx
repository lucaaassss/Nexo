'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  Bot,
  Trash2,
  CheckCircle2,
  Plus,
  Copy,
  Check,
  ListTodo,
  Zap,
  ArrowUp,
  AlertCircle,
  Wand2,
  FileText,
  ShieldAlert,
  Scale,
  FolderKanban,
  BrainCircuit,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { formatDateTime, getInitials } from '@/lib/utils';
import { TaskPriority, TaskStatus } from '@/types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ConversationMessage {
  role: 'user' | 'model';
  content: string;
}

interface SuggestedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours: number;
  tags?: string[];
}

interface AIAction {
  type:
    | 'create_task'
    | 'delete_task'
    | 'update_task'
    | 'create_project'
    | 'switch_project'
    | 'update_project'
    | 'add_subtask'
    | 'suggest_tasks';
  title?: string;
  description?: string;
  priority?: TaskPriority;
  estimatedHours?: number;
  tags?: string[];
  taskId?: string | null;
  deleteAll?: boolean;
  updates?: Record<string, unknown>;
  name?: string;
  key?: string;
  color?: string;
  projectId?: string;
  tasks?: SuggestedTask[];
}

interface DisplayMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: Date;
  suggestedTasks?: SuggestedTask[];
  imported?: boolean;
  actionLog?: string[];
  error?: boolean;
}

interface NexorSpaceAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePage?: 'home' | 'dashboard';
  activeTab?: string;
  taskViewMode?: string;
}

// ─── Píldoras de sugerencias dinámicas ──────────────────────────────────────────
function buildQuickPrompts(hasProject: boolean, taskCount: number) {
  if (!hasProject) {
    return [
      { icon: FolderKanban, label: 'Crear nuevo proyecto', text: 'Creá un nuevo proyecto completo para...' },
      { icon: BrainCircuit, label: '¿Qué podés hacer?', text: '¿Qué funciones y control tenés sobre la plataforma?' },
    ];
  }
  if (taskCount === 0) {
    return [
      { icon: ListTodo, label: 'Estructurar proyecto', text: 'Creá y proponé las tareas clave y específicas para desarrollar este proyecto.' },
      { icon: Wand2, label: 'Sugerir arquitectura', text: '¿Qué arquitectura y stack tecnológico recomendás para este proyecto?' },
    ];
  }
  return [
    { icon: ShieldAlert, label: 'Auditar cuellos de botella', text: 'Auditá el proyecto y decime los riesgos o tareas urgentes pendientes.' },
    { icon: FileText, label: 'Generar Changelog', text: 'Generá una nota de versión (Changelog) profesional de las tareas finalizadas.' },
    { icon: Wand2, label: 'Próximas tareas a crear', text: 'Analizá las tareas actuales y proponé las siguientes funcionalidades que faltan.' },
    { icon: Scale, label: 'Balancear cargas', text: 'Analizá las horas estimadas y decime cómo optimizar el esfuerzo del equipo.' },
  ];
}

// ─── Renderizado de Markdown simple ────────────────────────────────────────────
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  const inlineFmt = (str: string) =>
    str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-zinc-900 dark:text-zinc-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-violet-700 dark:text-violet-300 rounded font-mono text-[11px] border border-zinc-200 dark:border-zinc-700">$1</code>');

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push(<div key={i} className="h-1.5" />);
    } else if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="font-bold text-sm text-violet-700 dark:text-violet-300 mt-2 mb-1">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-2 mb-1">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mt-2 mb-1">
          {line.slice(2)}
        </h2>
      );
    } else if (line.trim() === '---') {
      elements.push(<hr key={i} className="border-zinc-200 dark:border-zinc-700 my-2" />);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm pl-1">
          <span className="text-violet-500 mt-0.5 shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: inlineFmt(line.slice(2)) }} />
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const m = line.match(/^(\d+\.)\s(.*)/);
      if (m) {
        elements.push(
          <div key={i} className="flex items-start gap-2 text-xs sm:text-sm pl-1">
            <span className="text-violet-600 dark:text-violet-400 font-mono font-bold shrink-0">{m[1]}</span>
            <span dangerouslySetInnerHTML={{ __html: inlineFmt(m[2]) }} />
          </div>
        );
      }
    } else {
      elements.push(
        <p
          key={i}
          className="text-xs sm:text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineFmt(line) }}
        />
      );
    }
    i++;
  }

  return <div className="space-y-1 text-zinc-800 dark:text-zinc-200">{elements}</div>;
}

// ─── Componente Principal ───────────────────────────────────────────────────────
export function NexorSpaceAiModal({
  isOpen,
  onClose,
  activePage = 'dashboard',
  activeTab = 'tasks',
  taskViewMode = 'kanban',
}: NexorSpaceAiModalProps) {
  const {
    currentProject,
    projects,
    projectTasks,
    currentUser,
    createProject,
    setCurrentProject,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateProject,
  } = useNexorSpace();

  const [mounted, setMounted] = useState(false);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 150);
  }, [isOpen]);

  // Mensaje de bienvenida inicial conversacional
  useEffect(() => {
    if (isOpen && displayMessages.length === 0) {
      const firstName = currentUser.name.split(' ')[0] || 'Lucas';
      const projectLine = currentProject
        ? `\n\nEstoy conectado a tu proyecto **${currentProject.name}** con **${projectTasks.length} tarea${projectTasks.length !== 1 ? 's' : ''}** activas.`
        : '';

      setDisplayMessages([
        {
          id: 'welcome',
          role: 'ai',
          content: `¡Hola **${firstName}**! 👋 Soy **Nexor-Space AI**.\n\nPodemos charlar de cualquier cosa, analizar arquitectura de código, o darme órdenes directas como *"creá las tareas que faltan"*, *"borrá todas las tareas"* o *"creá un proyecto para una app de viajes"* y lo ejecutaré en tiempo real.${projectLine}\n\n¿En qué te ayudo hoy?`,
          createdAt: new Date(),
        },
      ]);
    }
  }, [isOpen, currentProject, currentUser, projectTasks.length, displayMessages.length]);

  const getLocationLabel = () => {
    if (activePage === 'home') return 'Inicio (Vista General de Proyectos)';
    const tabNames: Record<string, string> = {
      tasks: `Tablero (${taskViewMode.toUpperCase()})`,
      files: 'Bóveda de Archivos',
      analytics: 'Métricas',
      activity: 'Historial',
      settings: 'Configuración',
    };
    return currentProject
      ? `${currentProject.name} › ${tabNames[activeTab] || activeTab}`
      : tabNames[activeTab] || activeTab;
  };

  // ─── Ejecución de Acciones en la Plataforma ──────────────────────────────────
  const executeActions = useCallback(
    (actions: AIAction[]): { log: string[]; suggestedTasks?: SuggestedTask[] } => {
      const log: string[] = [];
      let suggestedTasks: SuggestedTask[] | undefined;

      for (const action of actions) {
        try {
          switch (action.type) {
            case 'create_task': {
              const t = createTask({
                title: action.title || 'Nueva Tarea',
                description: action.description || '',
                priority: action.priority || 'MEDIA',
                status: 'PENDIENTE',
                estimatedHours: action.estimatedHours || 4,
                tags: action.tags || ['General'],
              });
              log.push(`✅ Tarea creada en el tablero: **${t.title}** (\`${t.key}\`)`);
              break;
            }

            case 'delete_task': {
              if (action.deleteAll) {
                const count = projectTasks.length;
                projectTasks.forEach((t) => deleteTask(t.id));
                log.push(`🗑️ Se eliminaron **${count}** tareas del tablero.`);
              } else if (action.taskId) {
                const target = projectTasks.find(
                  (t) =>
                    t.id === action.taskId ||
                    t.key.toLowerCase() === String(action.taskId).toLowerCase() ||
                    t.title.toLowerCase().includes(String(action.taskId).toLowerCase())
                );
                if (target) {
                  deleteTask(target.id);
                  log.push(`🗑️ Tarea eliminada: **${target.title}**`);
                } else {
                  log.push(`⚠️ No se encontró la tarea \`${action.taskId}\`.`);
                }
              }
              break;
            }

            case 'update_task': {
              if (action.taskId && action.updates) {
                const target = projectTasks.find(
                  (t) =>
                    t.id === action.taskId ||
                    t.key.toLowerCase() === String(action.taskId).toLowerCase() ||
                    t.title.toLowerCase().includes(String(action.taskId).toLowerCase())
                );
                if (target) {
                  updateTask(target.id, action.updates as any);
                  log.push(`✏️ Tarea actualizada: **${target.title}**`);
                }
              }
              break;
            }

            case 'create_project': {
              const np = createProject({
                name: action.name || 'Nuevo Proyecto',
                key: action.key || action.name?.slice(0, 3).toUpperCase() || 'PRJ',
                description: action.description || '',
                color: action.color || '#7C3AED',
              });
              if (np && np.id) {
                setCurrentProject(np.id);
                log.push(`🎉 Proyecto creado y activado: **${np.name}** (\`${np.key}\`)`);
              }
              break;
            }

            case 'switch_project': {
              if (action.projectId) {
                const found = projects.find(
                  (p) =>
                    p.id === action.projectId ||
                    p.key.toLowerCase() === action.projectId?.toLowerCase() ||
                    p.name.toLowerCase().includes(action.projectId?.toLowerCase() || '')
                );
                if (found) {
                  setCurrentProject(found.id);
                  log.push(`🔄 Proyecto activo cambiado a: **${found.name}**`);
                }
              }
              break;
            }

            case 'update_project': {
              if (currentProject && action.updates) {
                updateProject(currentProject.id, action.updates as any);
                log.push(`✏️ Proyecto **${currentProject.name}** actualizado exitosamente.`);
              }
              break;
            }

            case 'add_subtask': {
              if (action.taskId && action.title) {
                const target = projectTasks.find(
                  (t) =>
                    t.id === action.taskId ||
                    t.key.toLowerCase() === String(action.taskId).toLowerCase()
                );
                if (target) {
                  addSubtask(target.id, action.title);
                  log.push(`➕ Subtarea agregada a **${target.title}**: "${action.title}"`);
                }
              }
              break;
            }

            case 'suggest_tasks': {
              suggestedTasks = action.tasks;
              break;
            }
          }
        } catch (err) {
          console.error('Error ejecutando acción:', action, err);
        }
      }

      return { log, suggestedTasks };
    },
    [
      projectTasks,
      projects,
      currentProject,
      createTask,
      deleteTask,
      updateTask,
      createProject,
      setCurrentProject,
      updateProject,
      addSubtask,
    ]
  );

  // ─── Enviar Mensaje a la IA ──────────────────────────────────────────────────
  const handleSend = async (textOverride?: string) => {
    const text = (textOverride || input).trim();
    if (!text || isLoading) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userDisplayMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    const updatedHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: 'user', content: text },
    ];

    setDisplayMessages((prev) => [...prev, userDisplayMsg]);
    setConversationHistory(updatedHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          context: {
            project: currentProject
              ? {
                  id: currentProject.id,
                  name: currentProject.name,
                  key: currentProject.key,
                  description: currentProject.description,
                }
              : null,
            tasks: projectTasks.map((t) => ({
              id: t.id,
              key: t.key,
              title: t.title,
              status: t.status,
              priority: t.priority,
              estimatedHours: t.estimatedHours,
              loggedHours: t.loggedHours,
            })),
            allProjects: projects.map((p) => ({
              id: p.id,
              name: p.name,
              key: p.key,
              description: p.description,
            })),
            currentUser: {
              name: currentUser.name,
              email: currentUser.email,
            },
            activePage,
            activeTab,
            taskViewMode,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor de IA (${res.status})`);
      }

      const data = await res.json();
      const reply: string = data.reply || 'No obtuve una respuesta.';
      const actions: AIAction[] = Array.isArray(data.actions) ? data.actions : [];

      // Ejecutar acciones de inmediato
      const { log, suggestedTasks } = executeActions(actions);

      setConversationHistory((prev) => [...prev, { role: 'model', content: reply }]);

      const aiDisplayMsg: DisplayMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: reply,
        createdAt: new Date(),
        suggestedTasks,
        actionLog: log.length > 0 ? log : undefined,
      };

      setDisplayMessages((prev) => [...prev, aiDisplayMsg]);
    } catch (err: any) {
      console.error('Error en Nexor AI Chat:', err);
      setDisplayMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'ai',
          content: `Hubo un inconveniente al conectar con el motor de IA: **${err.message}**.\n\nPodés reintentar tu mensaje o consultar tus proyectos.`,
          createdAt: new Date(),
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Importar Tareas Propuestas ──────────────────────────────────────────────
  const handleImportTasks = (msgId: string, tasks: SuggestedTask[]) => {
    tasks.forEach((t) => {
      createTask({
        title: t.title,
        description: t.description || '',
        priority: t.priority || 'MEDIA',
        status: 'PENDIENTE',
        estimatedHours: t.estimatedHours || 4,
        tags: t.tags || ['General'],
      });
    });

    setDisplayMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, imported: true } : m))
    );
  };

  const handleClear = () => {
    if (!confirm('¿Reiniciar la conversación con Nexor AI?')) return;
    setDisplayMessages([]);
    setConversationHistory([]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  };

  if (!isOpen || !mounted) return null;

  const quickPrompts = buildQuickPrompts(!!currentProject, projectTasks.length);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl h-[88vh] max-h-[800px] flex flex-col shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">

        {/* HEADER */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Nexor-Space AI</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Gemini & Multi-LLM
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500" />
                {getLocationLabel()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HISTORIAL DE MENSAJES */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/40">
          {displayMessages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-600/30 text-violet-700 dark:text-violet-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-violet-200 dark:border-violet-500/30">
                    {getInitials(currentUser.name)}
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-2xl text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md ${msg.error ? 'bg-rose-500' : 'bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-violet-500/20'}`}>
                    {msg.error ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                )}

                <div className={`max-w-[86%] sm:max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Nombre y Fecha */}
                  <div className={`flex items-center gap-2 text-[10px] text-zinc-400 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                      {isUser ? currentUser.name : 'Nexor AI'}
                    </span>
                    <span>{formatDateTime(msg.createdAt.toISOString())}</span>
                  </div>

                  {/* Burbuja */}
                  <div
                    className={`relative p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-violet-500/20'
                        : msg.error
                        ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-tl-none'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    ) : (
                      renderMarkdown(msg.content)
                    )}

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Log de Acciones ejecutadas */}
                  {msg.actionLog && msg.actionLog.length > 0 && (
                    <div className="px-3.5 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 space-y-1 w-full">
                      {msg.actionLog.map((log, i) => (
                        <p key={i} className="text-xs text-violet-900 dark:text-violet-200 font-medium">
                          {log}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Tareas Sugeridas para Importar con 1 Clic */}
                  {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                    <div className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-violet-200 dark:border-violet-500/30 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
                          <ListTodo className="w-4 h-4 text-violet-600" />
                          Tareas Propuestas ({msg.suggestedTasks.length})
                        </span>
                        {msg.imported ? (
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Importadas al Tablero
                          </span>
                        ) : (
                          <button
                            onClick={() => handleImportTasks(msg.id, msg.suggestedTasks!)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-violet-500/25 hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Importar Todo
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {msg.suggestedTasks.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3 text-xs"
                          >
                            <div className="flex-1 space-y-0.5">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</p>
                              {t.description && (
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{t.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-transparent">
                                {t.estimatedHours}h
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  t.priority === 'URGENTE'
                                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                    : t.priority === 'ALTA'
                                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                    : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Animación de Pensando */}
          {isLoading && (
            <div className="flex gap-3 items-start animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shadow-sm">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Nexor AI está procesando</span>
                <span className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* PÍLDORAS DE ACCIÓN RÁPIDA DINÁMICAS */}
        {quickPrompts.length > 0 && (
          <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((qp, i) => {
              const Icon = qp.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(qp.text)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-500/40 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-violet-700 dark:hover:text-violet-300 whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                  {qp.label}
                </button>
              );
            })}
          </div>
        )}

        {/* INPUT DE MENSAJE */}
        <div className="p-3 sm:p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/15 transition-all p-3 flex flex-col gap-2 shadow-xs"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Escribí lo que quieras... Ej: 'Hola', 'Borrá todas las tareas', 'Creá las tareas para una app de viajes'..."
              className="ai-chat-input w-full bg-transparent border-0 outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none max-h-32 min-h-[36px] leading-relaxed"
            />
            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-violet-500" />
                Multi-LLM Inteligente · ↵ Enviar · ⇧↵ Salto de línea
              </span>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-violet-500/25 transition-all active:scale-95 cursor-pointer"
              >
                Enviar <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
