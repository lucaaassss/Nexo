'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  FileSpreadsheet,
  Clock,
  Zap,
  ArrowUp,
} from 'lucide-react';
import { useNexorSpace } from '@/hooks/useNexorSpace';
import { formatDateTime, getInitials } from '@/lib/utils';
import { TaskPriority, TaskStatus, MemberRole } from '@/types';

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

const COLOR_MAP: Record<string, string> = {
  violeta: '#7C3AED',
  purpura: '#9333EA',
  púrpura: '#9333EA',
  indigo: '#4F46E5',
  índigo: '#4F46E5',
  azul: '#2563EB',
  verde: '#059669',
  esmeralda: '#059669',
  ambar: '#D97706',
  ámbar: '#D97706',
  amarillo: '#D97706',
  rojo: '#E11D48',
  rosa: '#E11D48',
};

/**
 * Sintetizador contextual de descripciones para proyectos
 */
function synthesizeProjectDescription(projectName: string, contextPrompt: string): string {
  const pLower = contextPrompt.toLowerCase();

  if (pLower.includes('viaje') || pLower.includes('despegar') || pLower.includes('vuelo') || pLower.includes('hotel') || pLower.includes('turism')) {
    return `Plataforma integral de viajes y turismo para la búsqueda, cotización y reserva de vuelos, alojamientos, paquetes vacacionales y alquileres con comparador de tarifas en tiempo real.`;
  }
  if (pLower.includes('ecommerce') || pLower.includes('tienda') || pLower.includes('compra') || pLower.includes('producto') || pLower.includes('carrito')) {
    return `Tienda digital y plataforma de comercio electrónico para catálogo interactivo de productos, carrito de compras, gestión de inventario y checkout online con pasarelas de pago seguras.`;
  }
  if (pLower.includes('streaming') || pLower.includes('musica') || pLower.includes('video') || pLower.includes('media') || pLower.includes('netflix') || pLower.includes('spotify')) {
    return `Plataforma de streaming y entretenimiento multimedia con reproducción en alta definición, listas de reproducción personalizadas y sistema de recomendaciones inteligentes.`;
  }
  if (pLower.includes('fintech') || pLower.includes('banco') || pLower.includes('cripto') || pLower.includes('crypto') || pLower.includes('billetera') || pLower.includes('pago')) {
    return `Solución FinTech para la administración financiera, billetera digital, procesamiento seguro de transacciones y panel de métricas patrimoniales en tiempo real.`;
  }
  if (pLower.includes('turno') || pLower.includes('salud') || pLower.includes('medic') || pLower.includes('clinica')) {
    return `Sistema de gestión médica y turnos online para la administración de historias clínicas, agenda de profesionales y atención centralizada a pacientes.`;
  }
  if (pLower.includes('educa') || pLower.includes('curso') || pLower.includes('academia') || pLower.includes('estudiant')) {
    return `Plataforma educativa interactiva para la gestión de cursos online, seguimiento del aprendizaje de estudiantes, evaluaciones y emisión de certificados.`;
  }
  if (pLower.includes('saas') || pLower.includes('gestion') || pLower.includes('crm') || pLower.includes('erp') || pLower.includes('equipo')) {
    return `Plataforma SaaS para la optimización de procesos operativos, gestión ágil de equipos de trabajo y análisis de métricas de rendimiento en tiempo real.`;
  }

  // Extracción genérica si el usuario explicó algo
  const expMatch = contextPrompt.match(/(?:es\s+una?\s+|trata\s+de\s+|para\s+)([^.,;]+)/i);
  if (expMatch && expMatch[1]) {
    const rawExp = expMatch[1].trim();
    return `Plataforma orientada a ${rawExp}, integrando módulos de gestión, comunicación de equipo y seguimiento centralizado de objetivos.`;
  }

  return `Espacio de trabajo centralizado para el desarrollo, diseño y despliegue del proyecto ${projectName}, con gestión ágil de tareas, comunicación de equipo y métricas en tiempo real.`;
}

/**
 * Genera tareas iniciales relevantes según el tema del proyecto
 */
function generateTopicTasks(projectName: string, contextPrompt: string): GeneratedTask[] {
  const pLower = contextPrompt.toLowerCase();

  if (pLower.includes('viaje') || pLower.includes('despegar') || pLower.includes('vuelo') || pLower.includes('hotel')) {
    return [
      { title: 'Buscador de vuelos y hoteles con filtros dinámicos', description: 'Implementar interfaz con selector de origen, destino, fechas y cálculo de tarifas en tiempo real.', priority: 'URGENTE', estimatedHours: 8 },
      { title: 'Integración de pasarela de pagos turística', description: 'Conectar checkout para cobro con tarjetas, cuotas sin interés y generación de vouchers PDF.', priority: 'ALTA', estimatedHours: 6 },
      { title: 'Sistema de reserva y confirmación de itinerarios', description: 'Modelar entidades de Reservas, Pasajeros y Hoteles con confirmación por email.', priority: 'ALTA', estimatedHours: 7 },
      { title: 'Panel de usuario "Mis Viajes" y cancelaciones', description: 'Vista para que el cliente consulte sus boletos, check-in online y gestione cambios de fecha.', priority: 'MEDIA', estimatedHours: 5 },
    ];
  }
  if (pLower.includes('ecommerce') || pLower.includes('tienda')) {
    return [
      { title: 'Catálogo de productos con filtros y búsqueda', description: 'Paginación, filtros por categoría/precio y vista detallada de producto con fotos.', priority: 'ALTA', estimatedHours: 6 },
      { title: 'Carrito de compras y Checkout con Stripe', description: 'Gestión de carrito en memoria/storage y pasarela de pago segura.', priority: 'URGENTE', estimatedHours: 7 },
      { title: 'Panel de administración de inventario y pedidos', description: 'Control de stock, órdenes entrantes y cambio de estados de envío.', priority: 'MEDIA', estimatedHours: 5 },
    ];
  }

  return [
    { title: `Definir especificaciones y arquitectura para ${projectName}`, description: 'Documentar componentes principales, contratos de datos y flujo de trabajo.', priority: 'ALTA', estimatedHours: 5 },
    { title: `Desarrollar vistas principales e interfaz de usuario`, description: 'Construir vistas responsivas con tema oscuro/claro y componentes interactivos.', priority: 'MEDIA', estimatedHours: 8 },
    { title: `Integración de lógica de negocio y persistencia`, description: 'Conectar modelos de base de datos y endpoints con validaciones robustas.', priority: 'ALTA', estimatedHours: 7 },
    { title: `Testing integral y pipeline de despliegue`, description: 'Validar rendimiento, pruebas unitarias y puesta en producción.', priority: 'URGENTE', estimatedHours: 4 },
  ];
}

/**
 * Componente NexorSpaceAiModal
 * Asistente Autónomo con Razonamiento Multi-Intención y Control Total sobre el Proyecto.
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
    addMemberToProject,
    logTimeWorked,
  } = useNexorSpace();

  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTaskForSubtasks, setSelectedTaskForSubtasks] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mensaje inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeContent = currentProject
        ? `¡Hola **${currentUser.name.split(' ')[0]}**! 👋 Soy **Nexor-Space AI**, tu agente con **Control Total** sobre el proyecto **${currentProject.name}**.\n\nPuedo procesar instrucciones compuestas y gestionar todo tu espacio de trabajo:\n- 🏷️ *"Cambiá el nombre del proyecto a Aerius y creá una descripción para una app de viajes..."*\n- ➕ *"Creá estas 3 tareas: 1. Setup, 2. Backend, 3. UI..."*\n- 🗑️ *"Borrá todas las tareas"* o *"Borrá las tareas finalizadas"*\n- 🚀 *"Marcá como completada la tarea X"* o *"Cambiá la prioridad a Urgente"*\n- 📝 *"Agregá la subtarea 'Revisar PR' a la tarea X"*\n- 📊 *"Resumí el avance"* o consultame cualquier duda técnica de arquitectura y código.\n\n¿Qué orden o consulta tenés para hoy?`
        : `¡Hola **${currentUser.name.split(' ')[0]}**! 👋 Soy **Nexor-Space AI**.\n\n¿En qué puedo ayudarte hoy?`;

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

  // Enfocar y auto-ajustar textarea
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  if (!isOpen || !mounted) return null;

  /**
   * MOTOR DE RAZONAMIENTO Y EJECUCIÓN MULTI-INTENCIÓN (Deep Intent & Action Pipeline)
   * Analiza la estructura completa del mensaje, extrae entidades limpias, detecta múltiples
   * acciones simultáneas (renombrar + generar descripción + crear tareas) y las ejecuta.
   */
  const processAutonomousAgent = async (userPrompt: string): Promise<{
    content: string;
    generatedTasks?: GeneratedTask[];
    suggestedSubtasks?: string[];
  }> => {
    const raw = userPrompt.trim();
    const promptLower = raw.toLowerCase();
    const currentProjName = currentProject?.name || 'este proyecto';
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === 'FINALIZADA').length;
    const pendingTasks = projectTasks.filter((t) => t.status === 'PENDIENTE').length;
    const inProgressTasks = projectTasks.filter((t) => t.status === 'EN_PROGRESO').length;

    // =========================================================================
    // CASO 1: INSTRUCCIÓN COMPUESTA (RENOMBRAR + GENERAR DESCRIPCIÓN)
    // Ejemplo: "cambia el nombre del proyecto a aerius y crea una descripcion que explique de que trata, es una pagina de viajes tipo despegar"
    // O: "queria que el proyecto se llame solo "aerius" y que aparte de cambiarle el nombre me hagas una descripcion"
    // =========================================================================
    const wantsRename =
      /(?:cambia|cambiar|renombra|renombrar|ponele|poner|llama|llamar|se llame|nombre)\s+(?:el\s+)?(?:nombre\s+)?(?:del\s+proyecto\s+)?/i.test(promptLower) ||
      promptLower.includes('nombre del proyecto') ||
      promptLower.includes('se llame');

    const wantsDescription =
      /(?:crea|crear|hagas|hacer|pone|poner|genera|generar|actualiza|actualizar|armar)\s+(?:una\s+|la\s+)?descripci[oó]n/i.test(promptLower) ||
      promptLower.includes('descripcion') ||
      promptLower.includes('descripción');

    if (wantsRename && wantsDescription && currentProject) {
      // Extraer el nombre limpio
      let extractedName = '';

      // Patrón 1: Entre comillas
      const quotedMatch = raw.match(/["']([a-zA-Z0-9_\-\s]{2,30})["']/);
      if (quotedMatch && quotedMatch[1]) {
        extractedName = quotedMatch[1].trim();
      }

      // Patrón 2: Después de "a", "por", "como", "solo"
      if (!extractedName) {
        const nameMatch = raw.match(
          /(?:a|por|como|solo|llamado|titulado)\s+["']?([a-zA-Z0-9_\-]{2,25})["']?(?=\s+y\s+|\s+con\s+|\s+que\s+|\s*,|\s*\.|\s*$)/i
        );
        if (nameMatch && nameMatch[1]) {
          extractedName = nameMatch[1].trim();
        }
      }

      // Fallback si aún no lo tiene: primera palabra capitalizable tras "nombre a" o "se llame"
      if (!extractedName) {
        const fallbackMatch = raw.match(/(?:nombre\s+(?:del\s+proyecto\s+)?a|se\s+llame\s+(?:solo\s+)?)\s*([a-zA-Z0-9_\-]+)/i);
        if (fallbackMatch && fallbackMatch[1]) {
          extractedName = fallbackMatch[1].trim();
        }
      }

      const finalProjectName = extractedName
        ? extractedName.charAt(0).toUpperCase() + extractedName.slice(1).toLowerCase()
        : currentProject.name;

      // Generar la descripción contextual
      const generatedDescription = synthesizeProjectDescription(finalProjectName, raw);

      // Calcular clave
      const cleanKey = finalProjectName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || currentProject.key;

      // Ejecutar mutación real en el proyecto
      updateProject(currentProject.id, {
        name: finalProjectName,
        description: generatedDescription,
        key: cleanKey,
      });

      // Generar tareas recomendadas según el tema
      const suggestedTasks = generateTopicTasks(finalProjectName, raw);

      return {
        content: `### 🧠 Análisis y Ejecución de Solicitud\n\nHe analizado tu mensaje y apliqué los siguientes cambios en **${finalProjectName}**:\n\n- 🏷️ **Nombre del Proyecto:** Actualizado a **${finalProjectName}** (Clave: \`${cleanKey}\`)\n- 📝 **Descripción Contextual Generada:**\n  *"${generatedDescription}"*\n\n---\n🎯 **Estructura de Trabajo Sugerida para ${finalProjectName}:**\nPara ayudarte a comenzar, generé **${suggestedTasks.length} tareas clave** basadas en tu temática. Podés importarlas todas al tablero con 1 clic:`,
        generatedTasks: suggestedTasks,
      };
    }

    // =========================================================================
    // CASO 2: RENOMBRAR PROYECTO ÚNICAMENTE
    // =========================================================================
    if (wantsRename && currentProject) {
      let cleanName = '';
      const quoted = raw.match(/["']([a-zA-Z0-9_\-\s]{2,30})["']/);
      if (quoted && quoted[1]) {
        cleanName = quoted[1].trim();
      } else {
        const m = raw.match(
          /(?:cambia|cambiar|renombra|renombrar|ponele|poner|llama|llamar|se llame)\s+(?:el\s+)?(?:nombre\s+)?(?:del\s+proyecto\s+)?(?:a|por|como|solo)?\s*["']?([a-zA-Z0-9_\-]{2,25})["']?/i
        );
        if (m && m[1]) {
          cleanName = m[1].trim();
        }
      }

      if (cleanName) {
        const finalName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        const cleanKey = finalName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || currentProject.key;
        updateProject(currentProject.id, { name: finalName, key: cleanKey });
        return {
          content: `🏷️ **Nombre del proyecto actualizado:**\n\nEl proyecto ahora se llama **${finalName}** (Identificador: \`${cleanKey}\`).`,
        };
      }
    }

    // =========================================================================
    // CASO 3: CAMBIAR / GENERAR DESCRIPCIÓN DEL PROYECTO ÚNICAMENTE
    // =========================================================================
    if (wantsDescription && currentProject) {
      const generatedDescription = synthesizeProjectDescription(currentProject.name, raw);
      updateProject(currentProject.id, { description: generatedDescription });
      return {
        content: `📝 **Descripción del proyecto actualizada exitosamente:**\n\n*"${generatedDescription}"*`,
      };
    }

    // =========================================================================
    // CASO 4: CAMBIAR COLOR DEL PROYECTO
    // =========================================================================
    const colorMatch = promptLower.match(
      /(?:cambia|cambiar|pone|poner)\s+(?:el\s+)?color\s+(?:del\s+proyecto\s+)?(?:a|por)\s+(#[0-9a-f]{3,6}|[a-záéíóú]+)/i
    );

    if (colorMatch && colorMatch[1] && currentProject) {
      const rawColor = colorMatch[1].trim();
      const mappedColor = COLOR_MAP[rawColor] || (rawColor.startsWith('#') ? rawColor : '#7C3AED');
      updateProject(currentProject.id, { color: mappedColor });
      return {
        content: `🎨 **Color del proyecto actualizado:**\n\nSe aplicó el color **${rawColor}** (\`${mappedColor}\`) al proyecto **${currentProject.name}**.`,
      };
    }

    // =========================================================================
    // CASO 5: BORRAR TODAS LAS TAREAS DEL PROYECTO
    // =========================================================================
    if (
      /(borra|elimina|borrar|eliminar|quitar|vaciar|limpiar)\s+(todas\s+las\s+|los\s+|las\s+)?tareas/i.test(promptLower) ||
      /(eliminar|borrar)\s+(todo|el\s+tablero)/i.test(promptLower)
    ) {
      if (projectTasks.length === 0) {
        return {
          content: `El proyecto **${currentProjName}** no tiene tareas registradas actualmente en el tablero.`,
        };
      }

      const count = projectTasks.length;
      projectTasks.forEach((t) => deleteTask(t.id));

      return {
        content: `🗑️ **Acción ejecutada con éxito:**\n\nHe eliminado **${count} tarea(s)** del proyecto **${currentProjName}**.\n\nEl tablero está completamente limpio.`,
      };
    }

    // =========================================================================
    // CASO 6: BORRAR TAREAS POR ESTADO (FINALIZADAS O PENDIENTES)
    // =========================================================================
    if (/(borra|elimina|limpiar|quitar)\s+(las\s+)?(tareas\s+)?(finalizadas|completadas|terminadas)/i.test(promptLower)) {
      const finished = projectTasks.filter((t) => t.status === 'FINALIZADA');
      if (finished.length === 0) {
        return { content: `No se encontraron tareas en estado **FINALIZADA** para eliminar.` };
      }
      finished.forEach((t) => deleteTask(t.id));
      return {
        content: `🧹 **Limpieza de tablero completada:** Se eliminaron **${finished.length} tarea(s) finalizada(s)** de **${currentProjName}**:\n${finished.map((t) => `- \`${t.key}\`: ${t.title}`).join('\n')}`,
      };
    }

    // =========================================================================
    // CASO 7: CREAR TAREAS EN LOTE (MÚLTIPLES TAREAS)
    // =========================================================================
    const isMultiTaskCreation =
      (promptLower.includes('crea') || promptLower.includes('agrega')) &&
      (raw.includes('1.') || raw.includes('2.') || raw.includes('- ') || (raw.split(',').length >= 3 && promptLower.includes('tareas:')));

    if (isMultiTaskCreation) {
      const lines = raw.split(/\n|,/).map((l) => l.trim()).filter(Boolean);
      const createdList: string[] = [];

      for (const line of lines) {
        const cleanTitle = line.replace(/^(?:crea|crear|agrega|agregar|las siguientes tareas:?|\d+[\.\)]|\-\s*)\s*/i, '').trim();
        if (cleanTitle && cleanTitle.length > 2 && !cleanTitle.toLowerCase().startsWith('tarea')) {
          const t = createTask({
            title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
            description: `Tarea creada en lote por Nexor AI.`,
            priority: 'MEDIA',
            status: 'PENDIENTE',
            estimatedHours: 4,
          });
          createdList.push(`- \`${t.key}\`: **${t.title}**`);
        }
      }

      if (createdList.length > 0) {
        return {
          content: `✅ **Se crearon e insertaron ${createdList.length} tareas en el tablero:**\n\n${createdList.join('\n')}\n\nTodas están listas en estado \`PENDIENTE\` en **${currentProjName}**.`,
        };
      }
    }

    // =========================================================================
    // CASO 8: CREAR TAREA INDIVIDUAL
    // =========================================================================
    const createTaskMatch = raw.match(
      /(?:crea|crear|agrega|agregar|nueva|anota|anotar|generar)\s+(?:una\s+|la\s+)?tarea\s+(?:llamada\s+|titulada\s+|de\s+|para\s+)?["']?([^"'\n]+)["']?/i
    );

    if (createTaskMatch && createTaskMatch[1] && !promptLower.includes('subtarea') && !promptLower.includes('dividir') && !promptLower.includes('descomponer')) {
      const rawTitle = createTaskMatch[1].replace(/^(para|de|llamada|titulada)\s+/i, '').trim().replace(/^["']|["']$/g, '');

      let priority: TaskPriority = 'MEDIA';
      if (promptLower.includes('urgente')) priority = 'URGENTE';
      else if (promptLower.includes('alta') || promptLower.includes('prioridad alta')) priority = 'ALTA';
      else if (promptLower.includes('baja') || promptLower.includes('prioridad baja')) priority = 'BAJA';

      const hoursMatch = promptLower.match(/(\d+(?:\.\d+)?)\s*(?:horas|h|hs|hora)\b/);
      const estimatedHours = hoursMatch ? parseFloat(hoursMatch[1]) : 4;

      const tags: string[] = [];
      if (promptLower.includes('frontend') || promptLower.includes('ui') || promptLower.includes('diseño')) tags.push('Frontend');
      if (promptLower.includes('backend') || promptLower.includes('api') || promptLower.includes('db')) tags.push('Backend');
      if (promptLower.includes('bug') || promptLower.includes('error')) tags.push('Bug');
      if (promptLower.includes('qa') || promptLower.includes('test')) tags.push('QA');

      const newTask = createTask({
        title: rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1),
        description: `Tarea creada automáticamente por Nexor-Space AI a partir de la instrucción: "${raw}"`,
        priority,
        status: 'PENDIENTE',
        estimatedHours,
        tags: tags.length > 0 ? tags : ['General'],
      });

      return {
        content: `✅ **Tarea creada e insertada en el tablero:**\n\n- **Identificador:** \`${newTask.key}\`\n- **Título:** **${newTask.title}**\n- **Estado inicial:** \`PENDIENTE\`\n- **Prioridad:** \`${priority}\`\n- **Tiempo estimado:** \`${estimatedHours}h\`\n- **Etiquetas:** ${tags.length > 0 ? tags.map((tg) => `\`#${tg}\``).join(' ') : '\`#General\`'}\n\nYa la podés ver en el tablero Kanban de **${currentProjName}**.`,
      };
    }

    // =========================================================================
    // CASO 9: BORRAR TAREA ESPECÍFICA
    // =========================================================================
    const deleteTaskMatch = promptLower.match(
      /(?:borra|elimina|borrar|eliminar|quitar)\s+(?:la\s+)?tarea\s+(?:llamada\s+|titulada\s+|de\s+)?["']?([^"'\n]+)["']?/i
    );

    if (deleteTaskMatch && deleteTaskMatch[1]) {
      const query = deleteTaskMatch[1].trim().replace(/^["']|["']$/g, '');
      const target = projectTasks.find(
        (t) => t.key.toLowerCase() === query || t.title.toLowerCase().includes(query)
      );

      if (target) {
        deleteTask(target.id);
        return {
          content: `🗑️ **Tarea eliminada con éxito:**\n- **Clave:** \`${target.key}\`\n- **Título:** **${target.title}**\n\nFue removida del tablero del proyecto **${currentProjName}**.`,
        };
      } else {
        return {
          content: `No encontré ninguna tarea que coincida con *"${query}"* en este proyecto.\n\nTareas actuales:\n${projectTasks.map((t) => `- \`${t.key}\`: ${t.title}`).join('\n') || '*(No hay tareas)*'}`,
        };
      }
    }

    // =========================================================================
    // CASO 10: CAMBIAR ESTADO DE TAREA
    // =========================================================================
    const statusMatch = promptLower.match(
      /(?:marca|marcar|pasa|pasar|cambia|cambiar|mover|actualiza|actualizar)\s+(?:la\s+)?tarea\s+["']?([^"']+)["']?\s+(?:a|como)\s+(finalizada|completada|terminada|en progreso|en revision|en revisión|pendiente)/i
    );

    if (statusMatch) {
      const taskQuery = statusMatch[1].trim().replace(/^["']|["']$/g, '');
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
          content: `🚀 **Estado de tarea actualizado:**\n\n- **Tarea:** \`${target.key}\` - **${target.title}**\n- **Nuevo Estado:** \`${targetStatus}\``,
        };
      }
    }

    // =========================================================================
    // CASO 11: CAMBIAR PRIORIDAD DE TAREA
    // =========================================================================
    const priorityMatch = promptLower.match(
      /(?:cambia|cambiar|pone|poner|establece|establecer)\s+(?:la\s+)?prioridad\s+(?:de\s+la\s+tarea\s+)?["']?([^"']+)["']?\s+a\s+(urgente|alta|media|baja)/i
    );

    if (priorityMatch) {
      const taskQuery = priorityMatch[1].trim().replace(/^["']|["']$/g, '');
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
    // CASO 12: REGISTRAR HORAS TRABAJADAS
    // =========================================================================
    const logTimeMatch = promptLower.match(
      /(?:registra|registrar|anota|anotar|agrega|agregar)\s+(\d+(?:\.\d+)?)\s*(?:horas|h|hs)\s+(?:trabajadas\s+)?(?:en|a)\s+(?:la\s+tarea\s+)?["']?([^"'\n]+)["']?/i
    );

    if (logTimeMatch) {
      const hours = parseFloat(logTimeMatch[1]);
      const taskQuery = logTimeMatch[2].trim().replace(/^["']|["']$/g, '');

      const target = projectTasks.find(
        (t) => t.key.toLowerCase() === taskQuery || t.title.toLowerCase().includes(taskQuery)
      );

      if (target) {
        logTimeWorked(target.id, hours);
        return {
          content: `⏱️ **Horas registradas:**\n\nSe sumaron **${hours}h** a la tarea \`${target.key}\` - **${target.title}**. Total acumulado: \`${(target.loggedHours || 0) + hours}h\`.`,
        };
      }
    }

    // =========================================================================
    // CASO 13: AGREGAR SUBTAREA
    // =========================================================================
    const subtaskMatch = promptLower.match(
      /(?:agrega|agregar|anade|añadir)\s+(?:la\s+)?subtarea\s+["']?([^"']+)["']?\s+(?:a|en)\s+(?:la\s+tarea\s+)?["']?([^"']+)["']?/i
    );

    if (subtaskMatch) {
      const subtaskTitle = subtaskMatch[1].trim().replace(/^["']|["']$/g, '');
      const taskQuery = subtaskMatch[2].trim().replace(/^["']|["']$/g, '');

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
    // CASO 14: INVITAR MIEMBRO
    // =========================================================================
    const inviteMatch = promptLower.match(
      /(?:invita|invitar|agrega|agregar|anade|añadir)\s+(?:al\s+miembro\s+|a\s+)?([^\s@]+@[^\s@]+\.[^\s@]+)(?:\s+como\s+(admin|administrador|lider|líder|miembro|invitado))?/i
    );

    if (inviteMatch && inviteMatch[1] && currentProject) {
      const email = inviteMatch[1].trim();
      const rawRole = (inviteMatch[2] || 'MEMBER').toLowerCase();
      let role: MemberRole = 'MEMBER';
      if (rawRole.includes('admin')) role = 'ADMIN';
      else if (rawRole.includes('lid') || rawRole.includes('líd')) role = 'LEADER';
      else if (rawRole.includes('invit') || rawRole.includes('guest')) role = 'GUEST';

      addMemberToProject(currentProject.id, email, role);
      return {
        content: `👥 **Miembro incorporado al equipo:**\n\n- **Email:** \`${email}\`\n- **Rol:** \`${role}\`\n- **Proyecto:** **${currentProject.name}**`,
      };
    }

    // =========================================================================
    // CASO 15: DESCOMPOSICIÓN DINÁMICA / PLAN TEMÁTICO
    // =========================================================================
    if (
      promptLower.includes('dividir') ||
      promptLower.includes('descompon') ||
      promptLower.includes('estructur') ||
      promptLower.includes('plan de trabajo') ||
      promptLower.includes('crear tareas') ||
      promptLower.includes('sprint')
    ) {
      const suggested = generateTopicTasks(currentProjName, raw);
      return {
        content: `He diseñado una propuesta estructurada con **${suggested.length} tareas clave** para **${currentProjName}**. Podés importarlas todas directamente al tablero con el botón debajo:`,
        generatedTasks: suggested,
      };
    }

    // =========================================================================
    // CASO 16: RESUMEN Y DIAGNÓSTICO
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
        content: `### 📊 Diagnóstico del Proyecto: **${currentProjName}**\n\n- **Porcentaje de Entrega:** \`${progressPercent}%\` (${completedTasks} de ${totalTasks} tareas)\n- **Distribución:**\n  - ⏳ **Pendientes:** ${pendingTasks}\n  - 🚀 **En Progreso:** ${inProgressTasks}\n  - ✅ **Finalizadas:** ${completedTasks}\n- **Prioridades Críticas:** ${urgentCount} Urgentes, ${highCount} Altas\n- **Horas Estimadas:** \`${totalEstimated}h\` | **Registradas:** \`${totalLogged}h\`\n\n**Recomendación de Nexor AI:**\n${
          urgentCount > 0
            ? `⚠️ Hay **${urgentCount} tarea(s) urgente(s)** activas. Se sugiere destrabar esos ítems primero.`
            : totalTasks === 0
            ? 'El tablero no tiene tareas activas actualmente. Podés pedirme crear una estructura de trabajo.'
            : 'El flujo de trabajo presenta un ritmo equilibrado.'
        }`,
      };
    }

    // =========================================================================
    // CASO 17: CONSULTORÍA Y ASISTENCIA TÉCNICA ABIERTA
    // =========================================================================
    return {
      content: `### 💡 Asistencia y Análisis: ${raw}\n\nCon respecto a tu consulta sobre **${currentProjName}**:\n\n1. **Evaluación:** He analizado tu solicitud en relación a los recursos actuales del proyecto (${totalTasks} tareas registradas).\n2. **Acciones Disponibles:** Podés pedirme modificar cualquier configuración (nombre, descripción, color), crear o reordenar tareas en el tablero, o planificar un nuevo módulo.\n\n¿Querés que aplique algún cambio específico en el proyecto o que creemos las tareas necesarias?`,
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
          content: 'Ocurrió un error al procesar la instrucción. Por favor, intenta de nuevo.',
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
            content: `Conversación reiniciada. ¿Qué orden o consulta tenés sobre **${currentProject?.name || 'tu proyecto'}**?`,
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

          // Separador horizontal ---
          if (line.trim() === '---') {
            return <hr key={idx} className="my-2 border-zinc-200 dark:border-zinc-800" />;
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
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 rounded-3xl w-full max-w-3xl h-[88vh] max-h-[780px] overflow-hidden shadow-2xl flex flex-col justify-between ring-1 ring-black/5 dark:ring-white/10">
        {/* HEADER DEL CHAT DE IA */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-950/90 flex items-center justify-between shrink-0">
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
                  Control Total Activo
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {currentProject ? `Proyecto: ${currentProject.name}` : 'Asistente de productividad'}
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

                  {/* Tareas Generadas e Importables */}
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

          {/* Indicador de Escritura / Ejecución */}
          {isGenerating && (
            <div className="flex gap-3 items-start animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center border border-violet-400/30 shrink-0 shadow-md">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2 shadow-sm">
                <span>Nexor AI está analizando y ejecutando cambios</span>
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
        <div className="px-4 py-2 bg-zinc-50/90 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
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

        {/* TEXTBOX REDISEÑADO: CARD FLOTANTE MODERNA SIN BORDES DOBLES */}
        <div className="p-3 sm:p-4 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-violet-500/70 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all p-2.5 sm:p-3 shadow-xs flex flex-col gap-1.5"
          >
            {/* Textarea sin bordes, transparente y fluido */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ordená cualquier acción: 'Cambiá el nombre a...', 'Creá 3 tareas...', 'Borrá las tareas'..."
              className="ai-chat-input w-full bg-transparent border-0 outline-none text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none max-h-32 min-h-[38px] leading-relaxed p-1"
            />

            {/* Barra inferior integrada en el input */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 select-none">
                <span className="font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Control Total
                </span>
                <span className="hidden sm:inline">• ↵ Enviar • ⇧↵ Salto de línea</span>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isGenerating}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-violet-600/25 transition-all active:scale-95 cursor-pointer"
                title="Enviar mensaje"
              >
                <span>Enviar</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
