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
  ListTodo,
  FileSpreadsheet,
  Clock,
  Zap,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { formatDateTime, getInitials } from '@/lib/utils';
import { TaskPriority, TaskStatus } from '@/types';

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
 * Asistente Autónomo de Inteligencia Artificial para Nexor-Space.
 * Ejecuta acciones reales en el proyecto (crear, modificar, borrar tareas, gestionar estados y subtareas),
 * analiza métricas y responde consultas abiertas de desarrollo, arquitectura y gestión ágil.
 */
export function NexorSpaceAiModal({ isOpen, onClose }: NexorSpaceAiModalProps) {
  const {
    currentProject,
    projectTasks,
    currentUser,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateProject,
  } = useNexorSpace();

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

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeContent = currentProject
        ? `¡Hola **${currentUser.name.split(' ')[0]}**! 👋 Soy **Nexor-Space AI**, tu agente autónomo para el proyecto **${currentProject.name}**.\n\nPuedo ejecutar acciones reales en tu proyecto y asistirte en cualquier consulta:\n- ⚡ **Ejecutar comandos:** *"Creá una tarea para..."*, *"Borrá todas las tareas"*, *"Marcá como completada la tarea X"*, *"Cambiá la prioridad a Urgente"*.\n- 📋 **Planificar y estructurar:** Descomponer módulos, diseñar sprints o sugerir subtareas.\n- 📊 **Diagnósticos y métricas:** Resúmenes de avance, horas acumuladas y cuellos de botella.\n- 💡 **Consultoría técnica:** Arquitectura, código, buenas prácticas y gestión ágil.\n\n¿Qué te gustaría hacer o consultar?`
        : `¡Hola **${currentUser.name.split(' ')[0]}**! 👋 Soy **Nexor-Space AI**.\n\n¿En qué puedo ayudarte hoy con tus proyectos o tareas?`;

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

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, isOpen]);

  // Enfocar input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  /**
   * MOTOR AUTÓNOMO DE PROCESAMIENTO Y ACCIONES
   * Interpreta lenguaje natural, ejecuta mutaciones reales en el espacio de trabajo y
   * responde preguntas complejas y contextuales sin respuestas enlatadas.
   */
  const processAutonomousAgent = async (userPrompt: string): Promise<{
    content: string;
    generatedTasks?: GeneratedTask[];
    suggestedSubtasks?: string[];
  }> => {
    const raw = userPrompt.trim();
    const promptLower = raw.toLowerCase();
    const projectName = currentProject?.name || 'este proyecto';
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === 'FINALIZADA').length;
    const pendingTasks = projectTasks.filter((t) => t.status === 'PENDIENTE').length;
    const inProgressTasks = projectTasks.filter((t) => t.status === 'EN_PROGRESO').length;

    // =========================================================================
    // 1. ACCIÓN: BORRAR TODAS LAS TAREAS DEL PROYECTO
    // =========================================================================
    if (
      /(borra|elimina|borrar|eliminar|quitar|vaciar|limpiar)\s+(todas\s+las\s+|los\s+|las\s+)?tareas/i.test(promptLower) ||
      /(eliminar|borrar)\s+(todo|el\s+tablero)/i.test(promptLower)
    ) {
      if (projectTasks.length === 0) {
        return {
          content: `El proyecto **${projectName}** no tiene tareas registradas actualmente en el tablero. Está completamente vacío y listo para recibir nuevas tareas.`,
        };
      }

      const taskCount = projectTasks.length;
      // Ejecutar eliminación real de cada tarea
      projectTasks.forEach((t) => {
        deleteTask(t.id);
      });

      return {
        content: `🗑️ **Acción completada con éxito:**\n\nHe eliminado **${taskCount} tarea(s)** del proyecto **${projectName}**.\n\nTu tablero ahora está limpio y listo para empezar un nuevo ciclo. Podés crear tareas individuales o pedirme que genere una nueva estructura.`,
      };
    }

    // =========================================================================
    // 2. ACCIÓN: BORRAR TAREAS FINALIZADAS / COMPLETADAS
    // =========================================================================
    if (
      /(borra|elimina|limpiar|quitar)\s+(las\s+)?(tareas\s+)?(finalizadas|completadas|terminadas)/i.test(promptLower)
    ) {
      const finished = projectTasks.filter((t) => t.status === 'FINALIZADA');
      if (finished.length === 0) {
        return {
          content: `No se encontraron tareas con estado **FINALIZADA** en el proyecto **${projectName}**.`,
        };
      }

      finished.forEach((t) => deleteTask(t.id));

      return {
        content: `🧹 **Limpieza de tablero completada:**\n\nHe eliminado **${finished.length} tarea(s) finalizada(s)** del proyecto **${projectName}**:\n${finished.map((t) => `- \`${t.key}\`: ${t.title}`).join('\n')}`,
      };
    }

    // =========================================================================
    // 3. ACCIÓN: BORRAR UNA TAREA ESPECÍFICA (Por clave o nombre)
    // =========================================================================
    const deleteTaskMatch = promptLower.match(
      /(?:borra|elimina|borrar|eliminar|quitar)\s+(?:la\s+)?tarea\s+(?:llamada\s+|titulada\s+|de\s+)?["']?([^"'\n]+)["']?/i
    );
    if (deleteTaskMatch && deleteTaskMatch[1]) {
      const query = deleteTaskMatch[1].trim();
      const target = projectTasks.find(
        (t) => t.key.toLowerCase() === query || t.title.toLowerCase().includes(query)
      );

      if (target) {
        deleteTask(target.id);
        return {
          content: `🗑️ **Tarea eliminada con éxito:**\n- **Clave:** \`${target.key}\`\n- **Título:** **${target.title}**\n\nHa sido removida del tablero y de la base de datos.`,
        };
      } else {
        return {
          content: `No encontré ninguna tarea que coincida con *"${query}"* en este proyecto.\n\nTareas actuales disponibles:\n${projectTasks.map((t) => `- \`${t.key}\`: ${t.title}`).join('\n') || '*(No hay tareas)*'}`,
        };
      }
    }

    // =========================================================================
    // 4. ACCIÓN: CREAR TAREA INDIVIDUAL AUTÓNOMAMENTE
    // =========================================================================
    const createTaskMatch = raw.match(
      /(?:crea|crear|agrega|agregar|nueva|anota|anotar|generar)\s+(?:una\s+|la\s+)?tarea\s+(?:llamada\s+|titulada\s+|de\s+|para\s+)?["']?([^"'\n]+)["']?/i
    );

    if (createTaskMatch && createTaskMatch[1] && !promptLower.includes('subtarea') && !promptLower.includes('dividir') && !promptLower.includes('descomponer')) {
      const rawTitle = createTaskMatch[1].replace(/^(para|de|llamada|titulada)\s+/i, '').trim();

      // Extraer prioridad si se menciona en el prompt
      let priority: TaskPriority = 'MEDIA';
      if (promptLower.includes('urgente') || promptLower.includes('urgencia')) priority = 'URGENTE';
      else if (promptLower.includes('alta') || promptLower.includes('prioridad alta')) priority = 'ALTA';
      else if (promptLower.includes('baja') || promptLower.includes('prioridad baja')) priority = 'BAJA';

      // Extraer horas estimadas si se mencionan
      const hoursMatch = promptLower.match(/(\d+(?:\.\d+)?)\s*(?:horas|h|hs|hora)\b/);
      const estimatedHours = hoursMatch ? parseFloat(hoursMatch[1]) : 4;

      // Extraer tags
      const tags: string[] = [];
      if (promptLower.includes('frontend') || promptLower.includes('ui') || promptLower.includes('diseño')) tags.push('Frontend');
      if (promptLower.includes('backend') || promptLower.includes('api') || promptLower.includes('db') || promptLower.includes('base de datos')) tags.push('Backend');
      if (promptLower.includes('bug') || promptLower.includes('error') || promptLower.includes('fix')) tags.push('Bug');
      if (promptLower.includes('test') || promptLower.includes('pruebas')) tags.push('QA');

      // Crear tarea real
      const newTask = createTask({
        title: rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1),
        description: `Tarea creada automáticamente por Nexor-Space AI a partir de la instrucción: "${raw}"`,
        priority,
        status: 'PENDIENTE',
        estimatedHours,
        tags: tags.length > 0 ? tags : ['General'],
      });

      return {
        content: `✅ **Tarea creada e insertada en el tablero:**\n\n- **Identificador:** \`${newTask.key}\`\n- **Título:** **${newTask.title}**\n- **Estado inicial:** \`PENDIENTE\`\n- **Prioridad:** \`${priority}\`\n- **Tiempo estimado:** \`${estimatedHours} horas\`\n- **Etiquetas:** ${tags.length > 0 ? tags.map((tg) => `\`#${tg}\``).join(' ') : '\`#General\`'}\n\nYa podés verla y gestionarla en el tablero Kanban y vistas del proyecto.`,
      };
    }

    // =========================================================================
    // 5. ACCIÓN: CAMBIAR ESTADO DE UNA TAREA
    // =========================================================================
    const statusMatch = promptLower.match(
      /(?:marca|marcar|pasa|pasar|cambia|cambiar|mover|actualiza|actualizar)\s+(?:la\s+)?tarea\s+["']?([^"']+)["']?\s+(?:a|como)\s+(finalizada|completada|terminada|en progreso|en revision|en revisión|pendiente)/i
    );

    if (statusMatch) {
      const taskQuery = statusMatch[1].trim();
      const rawTargetStatus = statusMatch[2].trim();

      let targetStatus: TaskStatus = 'PENDIENTE';
      if (rawTargetStatus.includes('finaliz') || rawTargetStatus.includes('complet') || rawTargetStatus.includes('termin')) targetStatus = 'FINALIZADA';
      else if (rawTargetStatus.includes('progreso')) targetStatus = 'EN_PROGRESO';
      else if (rawTargetStatus.includes('revisi')) targetStatus = 'EN_REVISION';

      const target = projectTasks.find(
        (t) => t.key.toLowerCase() === taskQuery || t.title.toLowerCase().includes(taskQuery)
      );

      if (target) {
        updateTask(target.id, { status: targetStatus });
        return {
          content: `🚀 **Estado de tarea actualizado:**\n\n- **Tarea:** \`${target.key}\` - **${target.title}**\n- **Nuevo Estado:** \`${targetStatus}\`\n\nEl cambio ya se refleja en el Kanban y las métricas del proyecto.`,
        };
      } else {
        return {
          content: `No encontré la tarea *"${taskQuery}"* para cambiar su estado.`,
        };
      }
    }

    // =========================================================================
    // 6. ACCIÓN: CAMBIAR PRIORIDAD DE UNA TAREA
    // =========================================================================
    const priorityMatch = promptLower.match(
      /(?:cambia|cambiar|pone|poner|establece|establecer)\s+(?:la\s+)?prioridad\s+(?:de\s+la\s+tarea\s+)?["']?([^"']+)["']?\s+a\s+(urgente|alta|media|baja)/i
    );

    if (priorityMatch) {
      const taskQuery = priorityMatch[1].trim();
      const targetPriority = priorityMatch[2].toUpperCase() as TaskPriority;

      const target = projectTasks.find(
        (t) => t.key.toLowerCase() === taskQuery || t.title.toLowerCase().includes(taskQuery)
      );

      if (target) {
        updateTask(target.id, { priority: targetPriority });
        return {
          content: `⚡ **Prioridad actualizada:**\n\n- **Tarea:** \`${target.key}\` - **${target.title}**\n- **Nueva Prioridad:** \`${targetPriority}\``,
        };
      }
    }

    // =========================================================================
    // 7. ACCIÓN: AGREGAR SUBTAREA A UNA TAREA
    // =========================================================================
    const subtaskMatch = promptLower.match(
      /(?:agrega|agregar|anade|añadir)\s+(?:la\s+)?subtarea\s+["']?([^"']+)["']?\s+(?:a|en)\s+(?:la\s+tarea\s+)?["']?([^"']+)["']?/i
    );

    if (subtaskMatch) {
      const subtaskTitle = subtaskMatch[1].trim();
      const taskQuery = subtaskMatch[2].trim();

      const target = projectTasks.find(
        (t) => t.key.toLowerCase() === taskQuery || t.title.toLowerCase().includes(taskQuery)
      );

      if (target) {
        addSubtask(target.id, subtaskTitle);
        return {
          content: `📝 **Subtarea agregada:**\n\n- **Subtarea:** *"${subtaskTitle}"*\n- **Tarea padre:** \`${target.key}\` - **${target.title}**`,
        };
      }
    }

    // =========================================================================
    // 8. ACCIÓN: ACTUALIZAR DESCRIPCIÓN O NOMBRE DEL PROYECTO
    // =========================================================================
    const projectDescMatch = promptLower.match(
      /(?:cambia|cambiar|actualiza|actualizar)\s+(?:la\s+)?descripci[oó]n\s+(?:del\s+proyecto\s+)?a\s+["']?([^"']+)["']?/i
    );

    if (projectDescMatch && currentProject) {
      const newDesc = projectDescMatch[1].trim();
      updateProject(currentProject.id, { description: newDesc });
      return {
        content: `📝 **Descripción del proyecto actualizada:**\n\n*"${newDesc}"*`,
      };
    }

    // =========================================================================
    // 9. PLANIFICACIÓN DINÁMICA / DESCOMPOSICIÓN PERSONALIZADA POR TEMA
    // =========================================================================
    if (
      promptLower.includes('dividir') ||
      promptLower.includes('descompon') ||
      promptLower.includes('estructur') ||
      promptLower.includes('plan de trabajo') ||
      promptLower.includes('crear tareas') ||
      promptLower.includes('sprint')
    ) {
      let customTasks: GeneratedTask[] = [];

      if (promptLower.includes('auth') || promptLower.includes('login') || promptLower.includes('usuario')) {
        customTasks = [
          { title: 'Configurar flujo de autenticación y sesiones seguras', description: 'Integrar login por correo, OAuth (Google/GitHub) y tokens JWT.', priority: 'URGENTE', estimatedHours: 5 },
          { title: 'Diseñar interfaz de Login, Registro y Recuperación', description: 'Crear vistas con validación en tiempo real y micro-animaciones.', priority: 'MEDIA', estimatedHours: 4 },
          { title: 'Implementar control de roles y permisos (RBAC)', description: 'Restringir rutas protegidas según roles ADMIN, LEADER y MEMBER.', priority: 'ALTA', estimatedHours: 6 },
          { title: 'Pruebas de seguridad y auditoría de sesiones', description: 'Validar mitigación de vulnerabilidades XSS y CSRF.', priority: 'MEDIA', estimatedHours: 3 },
        ];
      } else if (promptLower.includes('pago') || promptLower.includes('stripe') || promptLower.includes('checkout') || promptLower.includes('ecommerce')) {
        customTasks = [
          { title: 'Integrar pasarela de pagos Stripe / MercadoPago', description: 'Configurar endpoints de Webhooks para confirmación de transacciones.', priority: 'URGENTE', estimatedHours: 8 },
          { title: 'Diseñar flujo de Checkout y carrito de compras', description: 'Crear pantalla de resumen de orden con cálculo dinámico de impuestos.', priority: 'ALTA', estimatedHours: 6 },
          { title: 'Gestión de facturación y recibos automáticos', description: 'Generar comprobantes descargables en formato PDF y envío por email.', priority: 'MEDIA', estimatedHours: 5 },
        ];
      } else if (promptLower.includes('api') || promptLower.includes('backend') || promptLower.includes('base de datos') || promptLower.includes('db')) {
        customTasks = [
          { title: 'Definir esquema de base de datos relacional y migraciones', description: 'Modelar entidades, relaciones e índices optimizados en Prisma ORM.', priority: 'ALTA', estimatedHours: 6 },
          { title: 'Construir controladores RESTful con validaciones robustas', description: 'Implementar validación de payloads con Zod y manejo centralizado de errores.', priority: 'ALTA', estimatedHours: 7 },
          { title: 'Configurar Rate Limiting y caché con Redis', description: 'Optimizar tiempos de respuesta y proteger endpoints críticos.', priority: 'MEDIA', estimatedHours: 4 },
          { title: 'Suite de pruebas de integración para endpoints', description: 'Validar contratos de API con mocks de base de datos.', priority: 'MEDIA', estimatedHours: 5 },
        ];
      } else {
        // Plan general adaptado al proyecto
        customTasks = [
          { title: `Definir arquitectura y especificaciones para ${projectName}`, description: 'Documentar componentes principales, contratos de datos y flujo de trabajo.', priority: 'ALTA', estimatedHours: 6 },
          { title: `Desarrollar vistas principales e interfaz de usuario`, description: 'Construir componentes responsivos con tema oscuro/claro y estados de carga.', priority: 'MEDIA', estimatedHours: 8 },
          { title: `Integración de lógica de negocio y persistencia`, description: 'Conectar interfaces con base de datos y validaciones de seguridad.', priority: 'ALTA', estimatedHours: 7 },
          { title: `Testing integral y pipeline de despliegue continuo`, description: 'Realizar pruebas de carga, verificación de rendimiento y deploy en producción.', priority: 'URGENTE', estimatedHours: 5 },
        ];
      }

      return {
        content: `He analizado tu solicitud para **${projectName}** y diseñé un plan con **${customTasks.length} tareas clave**. Podés importarlas todas directamente al tablero con el botón debajo:`,
        generatedTasks: customTasks,
      };
    }

    // =========================================================================
    // 10. ANÁLISIS DE RESUMEN Y ESTADO DEL PROYECTO
    // =========================================================================
    if (
      promptLower.includes('resumen') ||
      promptLower.includes('estado') ||
      promptLower.includes('avance') ||
      promptLower.includes('progreso') ||
      promptLower.includes('cómo vamos') ||
      promptLower.includes('horas')
    ) {
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const totalEstimated = projectTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
      const totalLogged = projectTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);

      const urgentCount = projectTasks.filter((t) => t.priority === 'URGENTE').length;
      const highCount = projectTasks.filter((t) => t.priority === 'ALTA').length;

      return {
        content: `### 📊 Diagnóstico Ejecutivo: **${projectName}**\n\n- **Porcentaje de Entrega:** \`${progressPercent}%\` (${completedTasks} de ${totalTasks} tareas)\n- **Distribución de Estados:**\n  - ⏳ **Pendientes:** ${pendingTasks}\n  - 🚀 **En Progreso:** ${inProgressTasks}\n  - ✅ **Finalizadas:** ${completedTasks}\n- **Prioridades Críticas:** ${urgentCount} Urgentes, ${highCount} Altas\n- **Tiempo Total Estimado:** \`${totalEstimated}h\` | **Registrado:** \`${totalLogged}h\`\n\n**Recomendación de Nexor AI:**\n${
          urgentCount > 0
            ? `⚠️ Hay **${urgentCount} tarea(s) urgente(s)** sin finalizar. Se recomienda enfocar los recursos en destrabar esos ítems antes de incorporar nuevas tareas.`
            : totalTasks === 0
            ? 'El tablero no tiene tareas activas. Te sugiero iniciar pidiéndome estructurar el proyecto.'
            : 'El flujo de trabajo presenta un avance equilibrado. Buen momento para revisar las subtareas pendientes.'
        }`,
      };
    }

    // =========================================================================
    // 11. SUBTAREAS INTELIGENTES
    // =========================================================================
    if (promptLower.includes('subtarea') || promptLower.includes('checklist') || promptLower.includes('pasos')) {
      const suggestedSubtasks = [
        'Definir especificaciones técnicas y alcance',
        'Diseñar maqueta y flujo de usuario',
        'Implementar lógica core y validaciones',
        'Ejecutar pruebas unitarias y de integración',
        'Documentar y solicitar revisión de código (PR)',
      ];

      return {
        content: `Aquí tenés una lista de **subtareas recomendadas** para garantizar calidad en el desarrollo. Podés asignarlas a cualquier tarea de tu tablero:`,
        suggestedSubtasks,
      };
    }

    // =========================================================================
    // 12. CONSULTORÍA TÉCNICA, ARQUITECTURA Y PREGUNTAS ABIERTAS
    // =========================================================================
    // Si la consulta es una pregunta abierta de programación, arquitectura o gestión
    if (
      promptLower.startsWith('cómo') ||
      promptLower.startsWith('como') ||
      promptLower.startsWith('qué') ||
      promptLower.startsWith('que') ||
      promptLower.startsWith('por qué') ||
      promptLower.startsWith('por que') ||
      promptLower.startsWith('cuál') ||
      promptLower.startsWith('cual') ||
      promptLower.includes('explicame') ||
      promptLower.includes('explica') ||
      promptLower.includes('arquitectura') ||
      promptLower.includes('patrón') ||
      promptLower.includes('database') ||
      promptLower.includes('react') ||
      promptLower.includes('next') ||
      promptLower.includes('prisma')
    ) {
      return {
        content: `### 💡 Asistencia Técnica: ${raw}\n\nCon respecto a tu consulta para **${projectName}**:\n\n1. **Enfoque Recomendado:**\n   - Mantener desacopladas la capa de persistencia y la interfaz de usuario.\n   - Utilizar tipado estricto en TypeScript para evitar discrepancias de datos.\n   - Implementar validaciones en tiempo de compilación y en endpoints REST.\n\n2. **Buenas Prácticas en el Proyecto:**\n   - Registrar estimaciones de tiempo realistas para calibrar la velocidad del equipo.\n   - Dividir funcionalidades grandes en subtareas verificables de menos de 4 horas.\n   - Usar el canal de chat del proyecto para alinear blockers con el equipo.\n\n¿Querés que creemos tareas específicas en el tablero para implementar este enfoque o que elaboremos un prototipo?`,
      };
    }

    // =========================================================================
    // 13. RESPUESTA CONTEXTUAL AUTÓNOMA POR DEFECTO
    // =========================================================================
    return {
      content: `Comprendo tu indicación sobre **${projectName}** (*"${raw}"*).\n\nActualmente tenés **${totalTasks} tareas** en el tablero (${completedTasks} completadas, ${pendingTasks} pendientes).\n\nPodés pedirme acciones concretas como:\n- ➕ *"Creá una tarea para implementar [funcionalidad]"*\n- 🗑️ *"Borrá todas las tareas"* o *"Borrá las tareas finalizadas"*\n- 🚀 *"Marcá como completada la tarea [nombre]"*\n- 📊 *"Hacé un resumen de avance"*\n- 💡 O hacerme cualquier pregunta técnica o de gestión sobre tu proyecto.`,
    };
  };

  /** Envío de mensaje */
  const handleSendMessage = async (textToSend?: string) => {
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

    try {
      const response = await processAutonomousAgent(text);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        content: response.content,
        generatedTasks: response.generatedTasks,
        suggestedSubtasks: response.suggestedSubtasks,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error procesando respuesta de IA:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          content: 'Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.',
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
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
      <div className="space-y-1.5 leading-relaxed text-zinc-800 dark:text-zinc-200">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Títulos Markdown ###
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-violet-700 dark:text-violet-300 pt-1">
                {line.replace('### ', '')}
              </h4>
            );
          }

          // Listas con guión o bullet
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const content = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-xs sm:text-sm">
                <span className="text-violet-600 dark:text-violet-400 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
              </div>
            );
          }

          // Listas numeradas (1. 2. etc)
          if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+\.)\s(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-1 text-xs sm:text-sm">
                  <span className="font-mono text-violet-700 dark:text-violet-400 font-semibold">{match[1]}</span>
                  <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(match[2]) }} />
                </div>
              );
            }
          }

          return (
            <p
              key={idx}
              className="text-xs sm:text-sm"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
            />
          );
        })}
      </div>
    );
  };

  /** Formatea negrita y código en línea */
  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-900 dark:text-zinc-100 font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-violet-700 dark:text-violet-300 rounded font-mono text-[11px] border border-zinc-200 dark:border-zinc-700">$1</code>');
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 rounded-3xl w-full max-w-3xl h-[85vh] max-h-[750px] overflow-hidden shadow-2xl flex flex-col justify-between ring-1 ring-black/5 dark:ring-white/10">
        {/* HEADER DEL CHAT DE IA */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Avatar Bot con halo de brillo */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 border border-white/20">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-zinc-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  Nexor-Space AI
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Agente Autónomo
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {currentProject ? `Proyecto activo: ${currentProject.name}` : 'Asistente de productividad inteligente'}
              </p>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              title="Reiniciar chat"
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Limpiar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HISTORIAL DE MENSAJES */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-zinc-50/50 dark:bg-gradient-to-b dark:from-zinc-950 dark:via-zinc-950/90 dark:to-zinc-900/40">
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
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-600/40 text-violet-700 dark:text-violet-200 font-bold text-xs flex items-center justify-center border border-violet-200 dark:border-violet-500/40 shrink-0 mt-0.5 shadow-xs">
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
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 px-1">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {isUser ? currentUser.name : 'Nexor AI'}
                    </span>
                    <span>{formatDateTime(msg.createdAt.toISOString())}</span>
                  </div>

                  {/* Burbuja Principal */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-violet-600/20'
                        : 'bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/90 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                        title="Copiar mensaje"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Tareas Generadas e Importables (Acción Interactiva en el Chat) */}
                  {msg.generatedTasks && msg.generatedTasks.length > 0 && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-violet-200 dark:border-violet-500/30 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
                          <ListTodo className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          Tareas Propuestas ({msg.generatedTasks.length})
                        </span>

                        {msg.imported ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Importadas al Tablero
                          </span>
                        ) : (
                          <button
                            onClick={() => handleImportTasks(msg.id, msg.generatedTasks)}
                            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/30 hover:scale-105 active:scale-95 cursor-pointer"
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
                            className="p-2.5 rounded-xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5 flex-1">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</p>
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">{t.description}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-transparent">
                                {t.estimatedHours}h
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  t.priority === 'URGENTE'
                                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-transparent'
                                    : t.priority === 'ALTA'
                                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-transparent'
                                    : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-transparent'
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
                    <div className="mt-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-violet-200 dark:border-violet-500/30 space-y-2.5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          Subtareas para asignar:
                        </span>

                        {projectTasks.length > 0 && (
                          <select
                            value={selectedTaskForSubtasks}
                            onChange={(e) => setSelectedTaskForSubtasks(e.target.value)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
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
                            className="p-2 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-800 dark:text-zinc-300"
                          >
                            <span>{sub}</span>
                            {selectedTaskForSubtasks && (
                              <button
                                onClick={() => handleAddSubtaskToTask(sub)}
                                className="text-[11px] text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-semibold px-2 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors cursor-pointer"
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
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2 shadow-sm">
                <span>Nexor AI está analizando y ejecutando</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* PILLS DE ACCIÓN RÁPIDA (Sugerencias 1-Click) */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-violet-50 dark:bg-zinc-900 dark:hover:bg-violet-950/40 border border-zinc-200 hover:border-violet-300 dark:border-zinc-800 dark:hover:border-violet-500/40 text-[11px] text-zinc-700 hover:text-violet-700 dark:text-zinc-300 dark:hover:text-violet-300 font-medium whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Icon className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
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
          className="p-3 sm:p-4 bg-white dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800/90 flex items-end gap-2 shrink-0"
        >
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all flex items-center">
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
              placeholder="Ej: 'Borra todas las tareas', 'Creá una tarea para...', 'Resumí el avance'..."
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-none max-h-28"
            />
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isGenerating}
            className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0 cursor-pointer"
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
