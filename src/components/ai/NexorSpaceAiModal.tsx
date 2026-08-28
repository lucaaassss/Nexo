'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  Bot,
  Send,
  Trash2,
  CheckCircle2,
  Plus,
  Copy,
  Check,
  CornerDownLeft,
  Layers,
  ArrowRight,
  ListTodo,
  FileSpreadsheet,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { formatDateTime, getInitials } from '@/lib/utils';
import { TaskPriority } from '@/types';

interface GeneratedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedHours: number;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  createdAt: Date;
  generatedTasks?: GeneratedTask[];
  suggestedSubtasks?: string[];
  imported?: boolean;
}

interface NexorSpaceAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  {
    label: 'Dividir proyecto',
    icon: ListTodo,
    prompt: 'Descomponé este proyecto en las tareas principales necesarias para completarlo.',
  },
  {
    label: 'Resumen de estado',
    icon: FileSpreadsheet,
    prompt: 'Hacé un resumen detallado del estado actual del proyecto, tareas pendientes y avance.',
  },
  {
    label: 'Sugerir subtareas',
    icon: Sparkles,
    prompt: 'Generá una lista de subtareas recomendadas para las tareas pendientes del proyecto.',
  },
  {
    label: 'Ideas de sprint',
    icon: Clock,
    prompt: '¿Qué prioridades y objetivos deberíamos abordar en el próximo sprint según nuestras tareas?',
  },
];

/**
 * Componente NexorSpaceAiModal
 * Chat unificado e interactivo con Inteligencia Artificial.
 * Comparte el diseño premium y la experiencia fluida del chat del proyecto,
 * permitiendo ejecutar todas las funciones (descomposición, resúmenes, subtareas, Q&A)
 * en una sola conversación continua.
 */
export function NexorSpaceAiModal({ isOpen, onClose }: NexorSpaceAiModalProps) {
  const { currentProject, projectTasks, currentUser, createTask, addSubtask } = useNexorSpace();

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mensaje de bienvenida inicial cuando se abre el modal y no hay mensajes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeContent = currentProject
        ? `¡Hola **${currentUser.name.split(' ')[0]}**! 👋 Soy **Nexor-Space AI**, tu asistente inteligente para el proyecto **${currentProject.name}**.\n\nPuedo ayudarte a:\n- 📋 **Descomponer el proyecto** en tareas estructuradas con 1 clic para importarlas al tablero.\n- 📊 **Analizar el estado** y resumir el avance de las tareas activas.\n- ⚡ **Generar subtareas** técnicas para tareas específicas.\n- 💡 **Resolver dudas** sobre planificación, prioridades o arquitectura.\n\n¿En qué te gustaría avanzar hoy?`
        : `¡Hola **${currentUser.name.split(' ')[0]}**! 👋 Soy **Nexor-Space AI**.\n\n¿En qué puedo colaborarte hoy con la gestión de tus proyectos y tareas?`;

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          content: welcomeContent,
          createdAt: new Date(),
        },
      ]);
    }
  }, [isOpen, currentProject, currentUser, messages.length]);

  // Auto-scroll al final con cada mensaje nuevo
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, isOpen]);

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  /**
   * Generador inteligente de respuestas contextuales de IA
   */
  const generateAiResponse = (userPrompt: string): {
    content: string;
    generatedTasks?: GeneratedTask[];
    suggestedSubtasks?: string[];
  } => {
    const promptLower = userPrompt.toLowerCase();
    const projectName = currentProject?.name || 'este proyecto';
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === 'FINALIZADA').length;
    const pendingTasks = projectTasks.filter((t) => t.status === 'PENDIENTE').length;
    const inProgressTasks = projectTasks.filter((t) => t.status === 'EN_PROGRESO').length;

    // 1. Caso: Descomponer proyecto o crear tareas
    if (
      promptLower.includes('dividir') ||
      promptLower.includes('descompon') ||
      promptLower.includes('estructur') ||
      promptLower.includes('crear tareas') ||
      promptLower.includes('plan de trabajo')
    ) {
      const generatedTasks: GeneratedTask[] = [
        {
          title: `Diseñar arquitectura técnica y base de datos para ${projectName}`,
          description: 'Definir modelos relacionales, flujos de autenticación y migraciones de base de datos.',
          priority: 'ALTA',
          estimatedHours: 6,
        },
        {
          title: `Implementar interfaz web moderna y responsiva`,
          description: 'Construir componentes de UI con diseño unificado, temas y micro-interacciones.',
          priority: 'MEDIA',
          estimatedHours: 8,
        },
        {
          title: `Configurar canal de comunicación y colaboración en tiempo real`,
          description: 'Habilitar soporte para mensajería instantánea, adjuntos y notificaciones.',
          priority: 'MEDIA',
          estimatedHours: 5,
        },
        {
          title: `Validación de calidad, pruebas unitarias y despliegue`,
          description: 'Asegurar cobertura de pruebas, optimización de performance y pipeline CI/CD.',
          priority: 'URGENTE',
          estimatedHours: 4,
        },
      ];

      return {
        content: `He analizado los requerimientos para **${projectName}** y preparé una propuesta estructurada con **${generatedTasks.length} tareas clave**. Podés importarlas directamente a tu tablero con el botón debajo:`,
        generatedTasks,
      };
    }

    // 2. Caso: Resumen de estado y avance
    if (
      promptLower.includes('resumen') ||
      promptLower.includes('estado') ||
      promptLower.includes('avance') ||
      promptLower.includes('progreso') ||
      promptLower.includes('cómo vamos')
    ) {
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      let analysis = '';
      if (totalTasks === 0) {
        analysis = 'Actualmente no hay tareas registradas en el tablero. Te sugiero usar la opción **"Dividir proyecto"** para iniciar la estructura.';
      } else if (progressPercent >= 75) {
        analysis = '¡Excelente progreso! La mayor parte de las tareas ya están concluidas.';
      } else if (inProgressTasks > 0) {
        analysis = `El equipo está trabajando activamente en **${inProgressTasks} tarea(s)** en progreso.`;
      } else {
        analysis = 'Hay tareas pendientes listas para ser asignadas e iniciadas.';
      }

      return {
        content: `### 📊 Diagnóstico del Proyecto: **${projectName}**\n\n- **Progreso general:** \`${progressPercent}%\` completado\n- **Total de tareas:** ${totalTasks}\n  - ⏳ **Pendientes:** ${pendingTasks}\n  - 🚀 **En Progreso:** ${inProgressTasks}\n  - ✅ **Finalizadas:** ${completedTasks}\n\n**Evaluación de la IA:**\n${analysis}`,
      };
    }

    // 3. Caso: Subtareas
    if (
      promptLower.includes('subtarea') ||
      promptLower.includes('pasos') ||
      promptLower.includes('checklist') ||
      promptLower.includes('desglos')
    ) {
      const suggestedSubtasks = [
        'Definir especificaciones técnicas y alcance',
        'Diseñar maqueta y flujo de usuario',
        'Implementar lógica core y validaciones',
        'Ejecutar pruebas unitarias y de integración',
        'Documentar y solicitar revisión de código (PR)',
      ];

      return {
        content: `Aquí tenés una lista de **subtareas sugeridas** para asegurar una entrega de alta calidad. Podés agregarlas a cualquier tarea de tu proyecto:`,
        suggestedSubtasks,
      };
    }

    // 4. Caso: Ideas de sprint / prioridades
    if (
      promptLower.includes('sprint') ||
      promptLower.includes('prioridad') ||
      promptLower.includes('orden') ||
      promptLower.includes('estrategia')
    ) {
      return {
        content: `### 🎯 Recomendaciones Estratégicas para **${projectName}**\n\n1. **Foco en tareas de prioridad URGENTE y ALTA:** Resolver bloqueos arquitectónicos y de infraestructura antes de refactorizaciones visuales.\n2. **Distribución equilibrada de carga:** Asegurar que ningún integrante tenga más de 3 tareas en progreso simultáneamente.\n3. **Criterios de aceptación claros:** Definir subtareas verificables antes de marcar tareas en revisión.\n4. **Monitoreo de tiempos:** Registrar horas reales trabajadas para calibrar futuras estimaciones.`,
      };
    }

    // 5. Respuesta conversacional general
    return {
      content: `Entendido. Con respecto a tu consulta sobre **${projectName}**, te comento que podés gestionar todos los recursos desde la barra lateral. Cuentas con **${totalTasks} tareas** en el tablero y comunicación centralizada.\n\n¿Querés que profundicemos en algún aspecto específico, generemos más tareas o analicemos algún módulo?`,
    };
  };

  /** Envío de mensaje */
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isGenerating) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);

    setTimeout(() => {
      const response = generateAiResponse(text);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: response.content,
        generatedTasks: response.generatedTasks,
        suggestedSubtasks: response.suggestedSubtasks,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 700);
  };

  /** Importar tareas sugeridas por la IA al proyecto */
  const handleImportTasks = (messageId: string, tasksToImport?: GeneratedTask[]) => {
    if (!tasksToImport || tasksToImport.length === 0) return;

    tasksToImport.forEach((t) => {
      createTask({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: 'PENDIENTE',
        estimatedHours: t.estimatedHours,
      });
    });

    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, imported: true } : msg))
    );
  };

  /** Agregar una subtarea recomendada a una tarea seleccionada */
  const handleAddSubtaskToTask = (subtaskText: string) => {
    if (!selectedTaskForSubtasks) return;
    addSubtask(selectedTaskForSubtasks, subtaskText);
  };

  /** Copiar texto de mensaje */
  const handleCopyContent = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /** Limpiar historial */
  const handleClearHistory = () => {
    if (confirm('¿Deseas reiniciar la conversación con Nexor AI?')) {
      setMessages([]);
      setTimeout(() => {
        setMessages([
          {
            id: `welcome-${Date.now()}`,
            sender: 'ai',
            content: `Conversación reiniciada. ¿En qué puedo ayudarte con **${currentProject?.name || 'tu proyecto'}**?`,
            createdAt: new Date(),
          },
        ]);
      }, 100);
    }
  };

  /** Renderizado de contenido Markdown simple */
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Títulos Markdown ###
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-violet-300 pt-1">
                {line.replace('### ', '')}
              </h4>
            );
          }

          // Listas con guión o bullet
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const content = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-xs">
                <span className="text-violet-400 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
              </div>
            );
          }

          // Listas numeradas (1. 2. etc)
          if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+\.)\s(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-1 text-xs">
                  <span className="font-mono text-violet-400 font-semibold">{match[1]}</span>
                  <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(match[2]) }} />
                </div>
              );
            }
          }

          return (
            <p
              key={idx}
              className="text-xs"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
            />
          );
        })}
      </div>
    );
  };

  /** Formatea negrita, código en línea y saltos */
  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-100 font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-800 text-violet-300 rounded font-mono text-[11px]">$1</code>');
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl w-full max-w-3xl h-[85vh] max-h-[750px] overflow-hidden shadow-2xl flex flex-col justify-between ring-1 ring-white/10">
        {/* HEADER DEL CHAT DE IA */}
        <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Avatar Bot con halo de brillo */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 border border-white/20">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-zinc-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  Nexor-Space AI
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Asistente Unificado
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {currentProject ? `Proyecto activo: ${currentProject.name}` : 'Asistente de productividad inteligente'}
              </p>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              title="Reiniciar chat"
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-colors text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Limpiar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HISTORIAL DE MENSAJES */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-900/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-violet-600/40 text-violet-200 font-bold text-xs flex items-center justify-center border border-violet-500/40 shrink-0 mt-0.5 shadow-sm">
                    {getInitials(currentUser.name)}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-violet-400/30 shrink-0 mt-0.5 shadow-md shadow-violet-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                {/* Contenedor del Mensaje */}
                <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
                  {/* Encabezado del mensaje */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 px-1">
                    <span className="font-semibold text-zinc-300">
                      {isUser ? currentUser.name : 'Nexor AI'}
                    </span>
                    <span>{formatDateTime(msg.createdAt.toISOString())}</span>
                  </div>

                  {/* Burbuja Principal */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg relative ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-violet-600/20'
                        : 'bg-zinc-900/90 border border-zinc-800/90 text-zinc-200 rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      renderFormattedText(msg.content)
                    )}

                    {/* Botón copiar mensaje de IA */}
                    {!isUser && (
                      <button
                        onClick={() => handleCopyContent(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                        title="Copiar mensaje"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Tareas Generadas e Importables (Acción Interactiva en el Chat) */}
                  {msg.generatedTasks && msg.generatedTasks.length > 0 && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-violet-500/30 space-y-2.5 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                          <ListTodo className="w-4 h-4 text-violet-400" />
                          Tareas Propuestas ({msg.generatedTasks.length})
                        </span>

                        {msg.imported ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Importadas al Tablero
                          </span>
                        ) : (
                          <button
                            onClick={() => handleImportTasks(msg.id, msg.generatedTasks)}
                            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/30 hover:scale-105 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Importar Todo al Tablero
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {msg.generatedTasks.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5 flex-1">
                              <p className="font-semibold text-zinc-100">{t.title}</p>
                              <p className="text-[11px] text-zinc-400 leading-normal">{t.description}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                                {t.estimatedHours}h
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  t.priority === 'URGENTE'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : t.priority === 'ALTA'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-blue-500/20 text-blue-300'
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

                  {/* Subtareas recomendadas interactivas */}
                  {msg.suggestedSubtasks && msg.suggestedSubtasks.length > 0 && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-violet-500/30 space-y-2.5 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          Subtareas para asignar:
                        </span>

                        {projectTasks.length > 0 && (
                          <select
                            value={selectedTaskForSubtasks}
                            onChange={(e) => setSelectedTaskForSubtasks(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                          >
                            <option value="">Seleccionar Tarea Destino...</option>
                            {projectTasks.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.key} - {t.title.substring(0, 30)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {msg.suggestedSubtasks.map((sub, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300"
                          >
                            <span>{sub}</span>
                            {selectedTaskForSubtasks && (
                              <button
                                onClick={() => handleAddSubtaskToTask(sub)}
                                className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold px-2 py-1 rounded-lg hover:bg-violet-950/50 transition-colors"
                              >
                                + Agregar
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Indicador de Escritura de la IA */}
          {isGenerating && (
            <div className="flex gap-3 items-start animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center border border-violet-400/30 shrink-0 shadow-md">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2 shadow-sm">
                <span>Nexor AI está analizando y respondiendo</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* PILLS DE ACCIÓN RÁPIDA (Sugerencias 1-Click) */}
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-violet-950/40 border border-zinc-800 hover:border-violet-500/40 text-[11px] text-zinc-300 hover:text-violet-300 font-medium whitespace-nowrap transition-all active:scale-95 disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5 text-violet-400" />
                <span>{qp.label}</span>
              </button>
            );
          })}
        </div>

        {/* INPUT DE MENSAJES */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-zinc-950/95 border-t border-zinc-800/90 flex items-end gap-2 shrink-0"
        >
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-3.5 py-2.5 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Preguntale a Nexor AI, pedí tareas, resúmenes o ideas..."
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-28"
            />
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isGenerating}
            className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
