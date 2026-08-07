'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Bot,
  ListPlus,
  Clock,
  MessageSquare,
  FileText,
  HelpCircle,
  Send,
  CheckCircle,
} from 'lucide-react';
import { useNexo } from '@/hooks/useNexo';

interface NexoAiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente NexoAiModal
 * Asistente de Inteligencia Artificial integrado para descomposición de proyectos,
 * auto-generación de subtareas, estimaciones de tiempo y respuestas interactivas.
 */
export function NexoAiModal({ isOpen, onClose }: NexoAiModalProps) {
  const { currentProject, projectTasks, projectMessages, createTask, addSubtask } = useNexo();

  const [activeTab, setActiveTab] = useState<'DECOMPOSE' | 'SUBTASKS' | 'SUMMARIZE' | 'QA'>('DECOMPOSE');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([]);
  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState<string>('');

  if (!isOpen) return null;

  /** Ejecuta la acción de Inteligencia Artificial solicitada */
  const handleRunAi = async () => {
    setIsGenerating(true);
    setAiResult(null);

    // Simulación inteligente estructurada según el tipo de acción
    setTimeout(() => {
      if (activeTab === 'DECOMPOSE') {
        const result = [
          {
            title: `Diseñar arquitectura de base de datos para ${currentProject?.name || 'el proyecto'}`,
            description: 'Definir tablas relacionales, índices y restricciones en Prisma ORM',
            priority: 'ALTA',
            estimatedHours: 6,
          },
          {
            title: 'Implementar interfaz web responsive en Next.js',
            description: 'Crear componentes visuales con estilo glassmorphism en modo claro/oscuro',
            priority: 'MEDIA',
            estimatedHours: 8,
          },
          {
            title: 'Configurar canal de comunicación en tiempo real',
            description: 'Habilitar soporte para menciones, emojis y archivos adjuntos',
            priority: 'MEDIA',
            estimatedHours: 5,
          },
          {
            title: 'Pruebas de carga y despliegue continuo en Vercel',
            description: 'Validar optimización de compilación y variables de entorno',
            priority: 'URGENTE',
            estimatedHours: 4,
          },
        ];
        setGeneratedTasks(result);
      } else if (activeTab === 'SUBTASKS') {
        setAiResult([
          'Revisar documentación y requerimientos',
          'Crear maqueta de baja fidelidad',
          'Validar especificaciones con el líder técnico',
          'Ejecutar suite de pruebas unitarias',
        ]);
      } else if (activeTab === 'SUMMARIZE') {
        setAiResult({
          chatSummary: `El equipo ha discutido activamente los requerimientos principales del proyecto ${currentProject?.name}. Se destacaron las tareas de diseño e integración de la API.`,
          projectSummary: `Progreso general adecuado con ${projectTasks.length} tareas registradas y comunicación constante en el chat.`,
        });
      } else if (activeTab === 'QA') {
        setAiResult(`Hola. Basándome en la información del proyecto "${currentProject?.name}", cuentas con ${projectTasks.length} tareas registradas. El equipo se encuentra en fase activa de desarrollo.`);
      }

      setIsGenerating(false);
    }, 1200);
  };

  /** Importa las tareas generadas directamente al tablero */
  const handleImportTasks = () => {
    generatedTasks.forEach((t) => {
      createTask({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: 'PENDIENTE',
        estimatedHours: t.estimatedHours,
      });
    });
    setGeneratedTasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header con gradiente IA */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-violet-950/60 via-purple-950/40 to-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/30 text-purple-300 border border-violet-500/40 shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Asistente Nexo AI
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  GPT-4o / Gemini
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Inteligencia artificial generativa para tu proyecto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Funciones de IA */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/50 p-2 gap-2 overflow-x-auto">
          {[
            { id: 'DECOMPOSE', label: 'Dividir Proyecto', icon: ListPlus },
            { id: 'SUBTASKS', label: 'Generar Subtareas', icon: Bot },
            { id: 'SUMMARIZE', label: 'Resumir Estado', icon: FileText },
            { id: 'QA', label: 'Consultar IA (Q&A)', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setAiResult(null);
                  setGeneratedTasks([]);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido Principal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'DECOMPOSE' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">
                Describe el objetivo general del proyecto o módulo:
              </label>
              <textarea
                rows={3}
                placeholder="Ej. Crear una aplicación SaaS de comercio electrónico con pasarela de pagos..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
              />
              <button
                onClick={handleRunAi}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Generando tareas con IA...' : 'Generar Estructura de Tareas'}</span>
              </button>

              {generatedTasks.length > 0 && (
                <div className="mt-4 space-y-3 pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-200">Tareas Generadas ({generatedTasks.length}):</h4>
                    <button
                      onClick={handleImportTasks}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Importar al Tablero
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {generatedTasks.map((gt, i) => (
                      <div key={i} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                        <p className="font-semibold text-violet-300">{gt.title}</p>
                        <p className="text-zinc-400 text-[11px]">{gt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'SUBTASKS' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">
                Selecciona la tarea a descomponer:
              </label>
              <select
                value={selectedTaskForSubtasks}
                onChange={(e) => setSelectedTaskForSubtasks(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="">Seleccionar Tarea...</option>
                {projectTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.key} - {t.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleRunAi}
                disabled={isGenerating || !selectedTaskForSubtasks}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Bot className="w-4 h-4" />
                <span>Generar Subtareas Automáticamente</span>
              </button>

              {aiResult && Array.isArray(aiResult) && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 mt-3">
                  <h4 className="text-xs font-bold text-zinc-200">Subtareas Recomendadas:</h4>
                  {aiResult.map((sub: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-zinc-300 p-2 bg-zinc-900 rounded-xl">
                      <span>{sub}</span>
                      <button
                        onClick={() => {
                          if (selectedTaskForSubtasks) addSubtask(selectedTaskForSubtasks, sub);
                        }}
                        className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold"
                      >
                        + Añadir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'SUMMARIZE' && (
            <div className="space-y-3">
              <button
                onClick={handleRunAi}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Resumir Estado del Proyecto y Chat</span>
              </button>

              {aiResult && aiResult.chatSummary && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <h4 className="text-xs font-bold text-violet-400">Resumen del Chat:</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{aiResult.chatSummary}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <h4 className="text-xs font-bold text-indigo-400">Resumen de Avance:</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{aiResult.projectSummary}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'QA' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">
                Haz una pregunta sobre el proyecto:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. ¿Cuántas tareas pendientes tenemos para esta semana?"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleRunAi}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                >
                  Preguntar
                </button>
              </div>

              {aiResult && typeof aiResult === 'string' && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1 mt-3">
                  <h4 className="text-xs font-bold text-violet-400">Respuesta de Nexo AI:</h4>
                  <p className="text-xs text-zinc-200 leading-relaxed">{aiResult}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
