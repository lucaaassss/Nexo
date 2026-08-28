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
  Zap,
  ArrowUp,
  FolderKanban,
  ShieldAlert,
  FileText,
  Scale,
  BrainCircuit,
  Wand2,
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
  activePage?: 'home' | 'dashboard';
  activeTab?: string;
  taskViewMode?: string;
}

// Catálogo de dominios especializados
interface DomainKnowledge {
  keywords: string[];
  defaultDescription: (name: string) => string;
  taskPool: Array<{ title: string; description: string; priority: TaskPriority; estimatedHours: number; phase: 'core' | 'features' | 'advanced' | 'ops' }>;
}

const DOMAIN_CATALOG: Record<string, DomainKnowledge> = {
  fitness: {
    keywords: ['fit', 'ftness', 'gym', 'gimnasio', 'entrenar', 'entrenamiento', 'rutina', 'musculacion', 'calorias', 'dieta', 'nutricion', 'deporte', 'crossfit', 'pesas'],
    defaultDescription: (name) => `Plataforma integral de Fitness y bienestar para el seguimiento de rutinas de entrenamiento, control calórico, catálogo de ejercicios en video y métricas de progreso corporal en tiempo real.`,
    taskPool: [
      { title: 'Catálogo de ejercicios con filtros por grupo muscular', description: 'Biblioteca interactiva con videos en bucle, instrucciones de postura y niveles de dificultad.', priority: 'ALTA', estimatedHours: 6, phase: 'core' },
      { title: 'Creador dinámico de rutinas personalizadas', description: 'Constructor drag & drop para armar planes semanales de series, repeticiones y descansos.', priority: 'URGENTE', estimatedHours: 8, phase: 'core' },
      { title: 'Registro de progreso, peso y medidas corporales', description: 'Gráficos comparativos de volumen de carga, 1RM estimado y registro fotográfico.', priority: 'MEDIA', estimatedHours: 5, phase: 'features' },
      { title: 'Temporizador HIIT y cronómetro de descansos', description: 'Herramienta de intervalos con alertas de audio y vibración en segundo plano.', priority: 'MEDIA', estimatedHours: 4, phase: 'features' },
      { title: 'Módulo de nutrición y calculadora de macros/calorías', description: 'Desglose diario de proteínas, carbohidratos y grasas con metas de déficit/superávit.', priority: 'ALTA', estimatedHours: 7, phase: 'advanced' },
      { title: 'Integración con wearables (Apple Health / Google Fit)', description: 'Sincronización automática de pasos diarios, frecuencia cardíaca y quema de calorías.', priority: 'MEDIA', estimatedHours: 6, phase: 'ops' },
    ],
  },
  travel: {
    keywords: ['viaje', 'viajes', 'despegar', 'vuelo', 'vuelos', 'hotel', 'hoteles', 'turismo', 'aerius', 'aerolinea', 'booking', 'hospedaje', 'itinerario', 'pasajes'],
    defaultDescription: (name) => `Plataforma de viajes y turismo para la búsqueda, cotización y reserva de vuelos, alojamientos, paquetes vacacionales y alquiler de autos con comparador en tiempo real.`,
    taskPool: [
      { title: 'Buscador de vuelos y hoteles con filtros dinámicos', description: 'Selector de origen, destino, fechas flexibles, escalas y cálculo de tarifas en vivo.', priority: 'URGENTE', estimatedHours: 8, phase: 'core' },
      { title: 'Pasarela de pagos turística con cuotas y moneda local', description: 'Integración de checkout seguro con tarjetas internacionales y generación de vouchers PDF.', priority: 'ALTA', estimatedHours: 7, phase: 'core' },
      { title: 'Motor de itinerarios y confirmación de reservas', description: 'Modelado de reservas vinculando aerolíneas, habitaciones de hotel y datos de pasajeros.', priority: 'ALTA', estimatedHours: 6, phase: 'features' },
      { title: 'Panel de usuario "Mis Viajes" y check-in online', description: 'Gestión de boletos electrónicos, cambios de fecha y alertas de estado de vuelos por email/SMS.', priority: 'MEDIA', estimatedHours: 5, phase: 'features' },
      { title: 'Sistema de reseñas y calificaciones de viajeros verificados', description: 'Puntuación por ubicación, limpieza y atención con carga de fotos reales.', priority: 'BAJA', estimatedHours: 4, phase: 'advanced' },
    ],
  },
  ecommerce: {
    keywords: ['tienda', 'shop', 'ecommerce', 'e-commerce', 'carrito', 'producto', 'productos', 'venta', 'ventas', 'mercadolibre', 'compras', 'catalogo', 'ropa', 'articulos'],
    defaultDescription: (name) => `Tienda digital de comercio electrónico con catálogo interactivo, carrito de compras persistente, pasarela de pago segura y gestión de inventario y pedidos.`,
    taskPool: [
      { title: 'Catálogo de productos con filtros de búsqueda y stock', description: 'Paginación, filtros por categoría/talle/color y galería fotográfica responsiva.', priority: 'ALTA', estimatedHours: 6, phase: 'core' },
      { title: 'Carrito de compras persistente y Checkout con Stripe', description: 'Cálculo dinámico de costos de envío, cupones de descuento y cobros seguros.', priority: 'URGENTE', estimatedHours: 8, phase: 'core' },
      { title: 'Panel de administración de inventario y órdenes', description: 'Control de existencias, notificaciones de bajo stock y cambio de estados de despacho.', priority: 'ALTA', estimatedHours: 6, phase: 'features' },
      { title: 'Cálculo automatizado de costos de envío por código postal', description: 'Integración con APIs logísticas para cotización de fletes en tiempo real.', priority: 'MEDIA', estimatedHours: 5, phase: 'advanced' },
    ],
  },
  realestate: {
    keywords: ['inmobiliaria', 'propiedad', 'propiedades', 'casa', 'departamento', 'alquiler', 'alquileres', 'terreno', 'bienes', 'raices', 'zonaprop'],
    defaultDescription: (name) => `Portal inmobiliario para la publicación, búsqueda y gestión de propiedades en venta y alquiler con mapas interactivos y cotizaciones.`,
    taskPool: [
      { title: 'Buscador de propiedades con mapa geolocalizado', description: 'Filtros por precio, m², dormitorios, tipo de operación y marcadores en mapa interactivo.', priority: 'URGENTE', estimatedHours: 8, phase: 'core' },
      { title: 'Ficha técnica de propiedad con tour virtual y galería HD', description: 'Visualización de características, planos, videos 360° y botón de contacto directo por WhatsApp.', priority: 'ALTA', estimatedHours: 6, phase: 'core' },
      { title: 'Calculadora de créditos hipotecarios y gastos de escrituración', description: 'Simulador de cuotas mensuales según tasa de interés y plazo de amortización.', priority: 'MEDIA', estimatedHours: 4, phase: 'features' },
      { title: 'Panel de agentes inmobiliarios y agenda de visitas', description: 'Organizador de citas presenciales con confirmación por calendario.', priority: 'ALTA', estimatedHours: 5, phase: 'features' },
    ],
  },
  fintech: {
    keywords: ['fintech', 'banco', 'billetera', 'wallet', 'crypto', 'cripto', 'inversion', 'inversiones', 'prestamo', 'tarjeta', 'transferencia', 'dinero'],
    defaultDescription: (name) => `Plataforma FinTech para la gestión financiera, transferencias inmediatas, billetera virtual y seguimiento de inversiones con altos estándares de seguridad.`,
    taskPool: [
      { title: 'Flujo de autenticación 2FA y validación de identidad KYC', description: 'Verificación biométrica y validación de documentos para cumplimiento normativo.', priority: 'URGENTE', estimatedHours: 8, phase: 'core' },
      { title: 'Módulo de transferencias instantáneas y código QR', description: 'Envío y recepción de fondos entre cuentas con conciliación en tiempo real.', priority: 'URGENTE', estimatedHours: 7, phase: 'core' },
      { title: 'Dashboard de métricas de gastos y balance patrimonial', description: 'Categorización automática de egresos y gráficos interactivos de evolución mensual.', priority: 'ALTA', estimatedHours: 6, phase: 'features' },
      { title: 'Generación de extractos bancarios en PDF y notificaciones Push', description: 'Reportes de movimientos con filtros de fecha y alertas de seguridad.', priority: 'MEDIA', estimatedHours: 5, phase: 'features' },
    ],
  },
  food: {
    keywords: ['comida', 'restaurante', 'delivery', 'pedidos', 'menu', 'mozo', 'bar', 'cafeteria', 'pedidosya', 'rappi', 'cocina'],
    defaultDescription: (name) => `Sistema gastronómico y de delivery para menú digital interactivo, toma de comandas en cocina, pedidos a domicilio y facturación de mesas.`,
    taskPool: [
      { title: 'Menú digital interactivo con fotos y modificadores', description: 'Carta categorizada con opciones de agregados, guarniciones y alérgenos.', priority: 'ALTA', estimatedHours: 6, phase: 'core' },
      { title: 'Sistema de comandas en tiempo real para cocina (KDS)', description: 'Pantalla para cocineros con alertas sonoras y tiempos de preparación por mesa/delivery.', priority: 'URGENTE', estimatedHours: 7, phase: 'core' },
      { title: 'Seguimiento de pedidos por GPS para clientes y repartidores', description: 'Mapa en vivo con estimación de tiempo de entrega y contacto del cadete.', priority: 'ALTA', estimatedHours: 8, phase: 'features' },
      { title: 'Cierre de caja diario y reporte de ventas por mozo/canal', description: 'Arqueo de efectivo, cobros con tarjeta y desgloses impositivos.', priority: 'MEDIA', estimatedHours: 5, phase: 'features' },
    ],
  },
  education: {
    keywords: ['educacion', 'curso', 'cursos', 'academia', 'escuela', 'estudiante', 'profesor', 'alumno', 'capacitacion', 'aula', 'e-learning', 'aprender'],
    defaultDescription: (name) => `Plataforma educativa para cursos online, seguimiento del aprendizaje de estudiantes, evaluaciones interactivas y certificados automáticos.`,
    taskPool: [
      { title: 'Reproductor de video interactivo con control de progreso', description: 'Player con velocidad variable, marcadores de capítulos y registro de minutos vistos.', priority: 'ALTA', estimatedHours: 7, phase: 'core' },
      { title: 'Módulo de evaluaciones tipo quiz con corrección automática', description: 'Preguntas de opción múltiple, límite de tiempo y puntaje mínimo de aprobación.', priority: 'ALTA', estimatedHours: 6, phase: 'core' },
      { title: 'Generación automática de certificados PDF con código de validación', description: 'Diploma descargable con firma digital y verificación pública en línea.', priority: 'MEDIA', estimatedHours: 5, phase: 'features' },
      { title: 'Foro de consultas y debate por cada lección', description: 'Hilos de respuestas entre alumnos y docentes con soporte para código e imágenes.', priority: 'MEDIA', estimatedHours: 5, phase: 'features' },
    ],
  },
  social: {
    keywords: ['red', 'social', 'comunidad', 'feed', 'post', 'posts', 'amigos', 'chat', 'mensajes', 'seguidores', 'likes', 'perfil'],
    defaultDescription: (name) => `Red social y plataforma comunitaria con feed de publicaciones, sistema de interacciones sociales, perfiles multimedia y chat privado en tiempo real.`,
    taskPool: [
      { title: 'Feed de publicaciones con carga infinita y multimedia', description: 'Soporte para fotos, videos cortos, encuestas y renderizado optimizado de contenido.', priority: 'URGENTE', estimatedHours: 8, phase: 'core' },
      { title: 'Sistema de interacciones (Likes, comentarios y reposts)', description: 'Actualizaciones optimistas de interfaz con contador de reacciones en tiempo real.', priority: 'ALTA', estimatedHours: 6, phase: 'core' },
      { title: 'Chat privado 1-a-1 con estados de lectura y adjuntos', description: 'Mensajería cifrada con indicadores de "escribiendo..." y notificaciones push.', priority: 'ALTA', estimatedHours: 7, phase: 'features' },
      { title: 'Perfiles de usuario personalizables y lista de seguidores', description: 'Biografía, foto de portada, insignias de verificación y configuración de privacidad.', priority: 'MEDIA', estimatedHours: 5, phase: 'features' },
    ],
  },
};

/**
 * Detecta el dominio del proyecto a partir del nombre, descripción y prompt
 */
function identifyDomain(projectName: string, description: string, prompt: string): DomainKnowledge | null {
  const combined = `${projectName} ${description} ${prompt}`.toLowerCase();

  for (const key of Object.keys(DOMAIN_CATALOG)) {
    const domain = DOMAIN_CATALOG[key];
    if (domain.keywords.some((kw) => combined.includes(kw))) {
      return domain;
    }
  }

  return null;
}

/**
 * Sintetizador contextual de descripciones para proyectos
 */
function synthesizeProjectDescription(projectName: string, contextPrompt: string): string {
  const detected = identifyDomain(projectName, '', contextPrompt);
  if (detected) {
    return detected.defaultDescription(projectName);
  }

  const expMatch = contextPrompt.match(/(?:es\s+una?\s+|trata\s+de\s+|para\s+)([^.,;]+)/i);
  if (expMatch && expMatch[1]) {
    const rawExp = expMatch[1].trim();
    return `Plataforma especializada en ${rawExp}, integrando gestión ágil de tareas, colaboración de equipo y métricas en tiempo real.`;
  }

  return `Espacio de trabajo centralizado para el desarrollo del proyecto ${projectName}, con gestión ágil de tareas, comunicación de equipo y métricas de avance.`;
}

/**
 * Generador inteligente de tareas con ANÁLISIS DE BRECHAS (Gap Analysis)
 * Compara las tareas que YA existen en el proyecto para NUNCA duplicar y sugerir
 * exactamente lo que hace falta en la siguiente etapa del desarrollo.
 */
function generateIntelligentTasks(
  projectName: string,
  projectDescription: string,
  contextPrompt: string,
  existingTasks: Array<{ title: string; tags?: string[] }>
): GeneratedTask[] {
  const detected = identifyDomain(projectName, projectDescription, contextPrompt);
  const existingTitlesLower = existingTasks.map((t) => t.title.toLowerCase());

  if (detected) {
    // Filtrar tareas que NO estén ya en el proyecto
    const availablePool = detected.taskPool.filter(
      (candidate) => !existingTitlesLower.some((ex) => ex.includes(candidate.title.toLowerCase().substring(0, 15)))
    );

    if (availablePool.length >= 3) {
      return availablePool.slice(0, 4).map((t) => ({
        title: t.title,
        description: t.description,
        priority: t.priority,
        estimatedHours: t.estimatedHours,
      }));
    }
  }

  // Si ya tiene tareas base o es un dominio libre, crear tareas de evolución específicas
  const count = existingTasks.length;
  if (count === 0) {
    return [
      { title: `Arquitectura y modelado de datos para ${projectName}`, description: 'Definir entidades principales, relaciones relacionales y contratos de API.', priority: 'ALTA', estimatedHours: 6 },
      { title: `Diseño del sistema de componentes e interfaz de usuario`, description: 'Crear vistas principales con tema responsive, navegación y estados de carga.', priority: 'ALTA', estimatedHours: 8 },
      { title: `Implementación de controladores y endpoints core`, description: 'Construir lógica de negocio con validaciones y manejo de errores.', priority: 'MEDIA', estimatedHours: 7 },
      { title: `Suite de pruebas automatizadas y despliegue continuo`, description: 'Pruebas unitarias de endpoints y configuración del pipeline de producción.', priority: 'URGENTE', estimatedHours: 5 },
    ];
  } else if (count < 5) {
    return [
      { title: `Panel de métricas y analíticas de uso de ${projectName}`, description: 'Visualización de KPIs de rendimiento, usuarios activos y tasas de conversión.', priority: 'ALTA', estimatedHours: 6 },
      { title: `Módulo de notificaciones push y alertas en tiempo real`, description: 'Configurar canal de avisos por correo y notificaciones dentro de la app.', priority: 'MEDIA', estimatedHours: 5 },
      { title: `Optimización de rendimiento y caché con Redis`, description: 'Mejorar tiempos de carga de consultas frecuentes y activos multimedia.', priority: 'MEDIA', estimatedHours: 4 },
      { title: `Auditoría de seguridad y mitigación de vulnerabilidades`, description: 'Revisión de permisos RBAC, sanitización de inputs y rate limiting.', priority: 'URGENTE', estimatedHours: 5 },
    ];
  } else {
    return [
      { title: `Pruebas de carga y estrés para escalar ${projectName}`, description: 'Simular concurrencia de usuarios para identificar cuellos de botella en la base de datos.', priority: 'ALTA', estimatedHours: 6 },
      { title: `Automatización de backups y plan de contingencia`, description: 'Copias de seguridad programadas y logs de auditoría para recuperación ante desastres.', priority: 'MEDIA', estimatedHours: 4 },
      { title: `Documentación técnica de API (Swagger / OpenAPI)`, description: 'Generar especificaciones interactivas para desarrolladores e integraciones externas.', priority: 'BAJA', estimatedHours: 4 },
    ];
  }
}

/**
 * Componente NexorSpaceAiModal
 * Asistente Autónomo con Inteligencia Contextual, Detección de Dominios y Control Total.
 */
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
    deleteProject,
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

  const getLocationLabel = () => {
    if (activePage === 'home') return 'Inicio (Vista General de Proyectos)';
    const tabMap: Record<string, string> = {
      tasks: `Tablero (${taskViewMode.toUpperCase()})`,
      files: 'Bóveda de Archivos',
      analytics: 'Métricas y Analíticas',
      activity: 'Historial de Actividad',
      settings: 'Configuración del Proyecto',
    };
    const tabName = tabMap[activeTab] || activeTab;
    return `${currentProject ? currentProject.name : 'Proyecto'} > ${tabName}`;
  };

  // Píldoras inteligentes dinámicas adaptadas al estado real del proyecto
  const getDynamicQuickPrompts = () => {
    if (!currentProject || projectTasks.length === 0) {
      return [
        { label: 'Estructurar proyecto', icon: ListTodo, prompt: `Generá las tareas clave y específicas para desarrollar ${currentProject?.name || 'este proyecto'} de forma completa.` },
        { label: 'Crear nuevo proyecto', icon: FolderKanban, prompt: 'Creá un nuevo proyecto completo llamado...' },
        { label: 'Sugerir arquitectura', icon: BrainCircuit, prompt: `¿Qué arquitectura y stack tecnológico recomendás para ${currentProject?.name || 'mi aplicación'}?` },
      ];
    }

    const pending = projectTasks.filter((t) => t.status === 'PENDIENTE').length;
    const completed = projectTasks.filter((t) => t.status === 'FINALIZADA').length;

    return [
      { label: 'Auditar cuellos de botella', icon: ShieldAlert, prompt: 'Hacé una auditoría de riesgos y cuellos de botella en las tareas del proyecto.' },
      { label: 'Generar Changelog / Release', icon: FileText, prompt: 'Generá una nota de lanzamiento (Changelog) profesional basada en las tareas finalizadas.' },
      { label: 'Sugerir próximas tareas', icon: Wand2, prompt: `Analizá las ${projectTasks.length} tareas existentes en ${currentProject.name} y proponé las siguientes funcionalidades que faltan.` },
      { label: 'Equilibrar cargas', icon: Scale, prompt: 'Analizá las estimaciones de horas y recomendá cómo distribuir el esfuerzo en el sprint.' },
    ];
  };

  // Mensaje inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const locationText = getLocationLabel();
      const welcomeContent = currentProject
        ? `¡Hola **${currentUser.name.split(' ')[0]}**! 👋 Soy **Nexor-Space AI**.\n\n📍 **Ubicación:** \`${locationText}\`\n📂 **Proyecto activo:** **${currentProject.name}** (${projectTasks.length} tareas registradas)\n\nCuento con análisis semántico y control total sobre tus proyectos:\n- 🎯 *"Creá tareas para el proyecto..."* (Analizo el dominio y lo que ya tenés hecho para no repetir).\n- 🚀 *"Creá un nuevo proyecto para [temática] llamado [Nombre]..."*\n- 🔍 *"Auditá el proyecto y detectá cuellos de botella"* o *"Generá un Changelog"*.\n- ⚡ Cualquier orden sobre tareas, estados, prioridades, subtareas o miembros.\n\n¿En qué te ayudo hoy?`
        : `¡Hola **${currentUser.name.split(' ')[0]}**! 👋 Soy **Nexor-Space AI**.\n\n📍 **Ubicación:** \`${locationText}\`\n\nPodés pedirme crear nuevos proyectos con tareas especializadas o consultarme cualquier duda.`;

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

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, isOpen]);

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
   * MOTOR DE INFERENCIA SEMÁNTICA Y AGENTE PROACTIVO
   */
  const processAutonomousAgent = async (userPrompt: string): Promise<{
    content: string;
    generatedTasks?: GeneratedTask[];
    suggestedSubtasks?: string[];
  }> => {
    const raw = userPrompt.trim();
    const promptLower = raw.toLowerCase();
    const currentProjName = currentProject?.name || 'este proyecto';
    const currentProjDesc = currentProject?.description || '';
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === 'FINALIZADA');
    const pendingTasks = projectTasks.filter((t) => t.status === 'PENDIENTE');
    const inProgressTasks = projectTasks.filter((t) => t.status === 'EN_PROGRESO');

    // =========================================================================
    // 1. AUDITORÍA DE SALUD Y RIESGOS DEL PROYECTO (Health & Risk Audit)
    // =========================================================================
    if (promptLower.includes('auditar') || promptLower.includes('auditoria') || promptLower.includes('cuello de botella') || promptLower.includes('riesgo')) {
      const urgentPending = pendingTasks.filter((t) => t.priority === 'URGENTE');
      const withoutHours = projectTasks.filter((t) => !t.estimatedHours || t.estimatedHours === 0);
      const totalEstimated = projectTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
      const totalLogged = projectTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);

      return {
        content: `### 🛡️ Informe de Auditoría y Salud: **${currentProjName}**\n\n- 📊 **Estado General:** \`${totalTasks} tareas totales\` (${completedTasks.length} completadas, ${inProgressTasks.length} en curso, ${pendingTasks.length} pendientes).\n- ⚠️ **Tareas Críticas sin Iniciar:** ${urgentPending.length > 0 ? urgentPending.map((t) => `\`${t.key}\` (**${t.title}**)`).join(', ') : '*(Ninguna tarea urgente demorada)*'}\n- ⏱️ **Carga de Tiempo:** Estimadas \`${totalEstimated}h\` | Registradas \`${totalLogged}h\`.\n- 🔎 **Tareas sin estimación de horas:** ${withoutHours.length > 0 ? `${withoutHours.length} tareas` : 'Todas tienen estimación'}.\n\n**Recomendación de Nexor AI:**\n${
          urgentPending.length > 0
            ? `Destrabar de inmediato las tareas urgentes pendientes para evitar retrasos en las entregas.`
            : `El tablero se encuentra saludable. Buen momento para generar tareas de las siguientes etapas.`
        }`,
      };
    }

    // =========================================================================
    // 2. GENERADOR DE CHANGELOG / NOTAS DE LANZAMIENTO (Release Notes)
    // =========================================================================
    if (promptLower.includes('changelog') || promptLower.includes('release') || promptLower.includes('nota de lanzamiento') || promptLower.includes('resumen para clientes')) {
      if (completedTasks.length === 0) {
        return {
          content: `Actualmente no hay tareas marcadas como **FINALIZADAS** en **${currentProjName}** para armar el Changelog.\n\nMarcá tareas completadas o pedime: *"Marcá como completada la tarea X"* para generarlo.`,
        };
      }

      const releaseList = completedTasks.map((t) => `- ✨ **${t.title}**: Tarea completada con éxito (\`${t.key}\`).`).join('\n');

      return {
        content: `### 🚀 Notas de Lanzamiento / Changelog: **${currentProjName}** (v1.0)\n\n**Resumen de Entrega:**\nSe completaron **${completedTasks.length} funcionalidades** en el ciclo actual.\n\n**Novedades y Mejoras Implementadas:**\n${releaseList}\n\n*Documento listo para ser compartido con stakeholders y clientes.*`,
      };
    }

    // =========================================================================
    // 3. CREAR UN NUEVO PROYECTO CON ANÁLISIS DE DOMINIO
    // =========================================================================
    const wantsCreateProject =
      /(?:crea|crear|armar|arma|nuevo|nueva|generar|hace|hacer|inicializar)\s+(?:un\s+|el\s+)?(?:nuevo\s+)?proyecto/i.test(promptLower) ||
      (promptLower.includes('proyecto nuevo') || promptLower.includes('nuevo proyecto'));

    if (wantsCreateProject) {
      let newProjectName = '';

      const quoted = raw.match(/["']([a-zA-Z0-9_\-\s]{2,30})["']/);
      if (quoted && quoted[1]) {
        newProjectName = quoted[1].trim();
      } else {
        const nameMatch = raw.match(
          /(?:llamado|titulado|se llame|nombre|a|como)\s+["']?([a-zA-Z0-9_\-]{2,25})["']?(?=\s+y\s+|\s+con\s+|\s+que\s+|\s*,|\s*\.|\s*$)/i
        );
        if (nameMatch && nameMatch[1]) {
          newProjectName = nameMatch[1].trim();
        }
      }

      if (!newProjectName) {
        const pMatch = raw.match(/proyecto\s+(?:llamado\s+|para\s+|de\s+)?([a-zA-Z0-9_\-]{2,25})/i);
        if (pMatch && pMatch[1] && !['nuevo', 'para', 'de', 'un', 'una'].includes(pMatch[1].toLowerCase())) {
          newProjectName = pMatch[1].trim();
        } else {
          newProjectName = `Proyecto ${projects.length + 1}`;
        }
      }

      const formattedName = newProjectName.charAt(0).toUpperCase() + newProjectName.slice(1);
      const cleanKey = formattedName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'PRJ';
      const synthesizedDesc = synthesizeProjectDescription(formattedName, raw);

      const createdProj = createProject({
        name: formattedName,
        key: cleanKey,
        description: synthesizedDesc,
        color: '#7C3AED',
      });

      if (createdProj && createdProj.id) {
        setCurrentProject(createdProj.id);
      }

      // Generar tareas hiper-especializadas según el dominio
      const suggestedTasks = generateIntelligentTasks(formattedName, synthesizedDesc, raw, []);

      return {
        content: `🎉 **¡Nuevo Proyecto Creado e Inicializado!**\n\n- 🏷️ **Nombre:** **${formattedName}**\n- 🔑 **Clave identificadora:** \`${cleanKey}\`\n- 📝 **Descripción Especializada:**\n  *"${synthesizedDesc}"*\n- 👤 **Cuenta:** \`${currentUser.name}\` (\`${currentUser.email}\`)\n\n---\n📋 **Estructura Especializada Propuesta (${suggestedTasks.length} tareas):**\nDiseñé estas tareas a medida para la temática de **${formattedName}**. Podés importarlas todas al tablero con 1 clic:`,
        generatedTasks: suggestedTasks,
      };
    }

    // =========================================================================
    // 4. PLANIFICAR / SUGERIR TAREAS PARA EL PROYECTO ACTUAL (Gap Analysis)
    // =========================================================================
    if (
      promptLower.includes('crear tareas') ||
      promptLower.includes('crea tareas') ||
      promptLower.includes('sugerir tareas') ||
      promptLower.includes('sugiere tareas') ||
      promptLower.includes('proponer tareas') ||
      promptLower.includes('que agregar') ||
      promptLower.includes('qué agregar') ||
      promptLower.includes('dividir') ||
      promptLower.includes('descomponer') ||
      promptLower.includes('plan de trabajo') ||
      promptLower.includes('sprint')
    ) {
      const suggestedTasks = generateIntelligentTasks(
        currentProjName,
        currentProjDesc,
        raw,
        projectTasks
      );

      return {
        content: `### 🧠 Análisis Semántico de Brechas: **${currentProjName}**\n\nHe analizado el contexto de tu proyecto y las **${projectTasks.length} tareas que ya existen** en el tablero.\n\nPara avanzar con las etapas pendientes, te propongo estas **${suggestedTasks.length} tareas especializadas** sin duplicar lo que ya tenés:`,
        generatedTasks: suggestedTasks,
      };
    }

    // =========================================================================
    // 5. CAMBIAR / NAVEGAR DE PROYECTO
    // =========================================================================
    const switchMatch = promptLower.match(
      /(?:cambia|cambiar|pasa|pasar|abrir|abre|ir|selecciona|seleccionar)\s+(?:al|el)?\s*proyecto\s+["']?([^"'\n]+)["']?/i
    );

    if (switchMatch && switchMatch[1]) {
      const targetQuery = switchMatch[1].trim().replace(/^["']|["']$/g, '');
      const found = projects.find(
        (p) => p.name.toLowerCase().includes(targetQuery) || p.key.toLowerCase() === targetQuery
      );

      if (found) {
        setCurrentProject(found.id);
        return {
          content: `🔄 **Proyecto Activo Cambiado:**\n\nAhora estás trabajando en **${found.name}** (Clave: \`${found.key}\`).\nTareas cargadas: **${projectTasks.filter((t) => t.projectId === found.id).length}**.`,
        };
      } else {
        return {
          content: `No encontré ningún proyecto llamado *"${targetQuery}"* en tu cuenta.\n\nTus proyectos disponibles son:\n${projects.map((p) => `- **${p.name}** (\`${p.key}\`)`).join('\n')}`,
        };
      }
    }

    // =========================================================================
    // 6. LISTAR TODOS LOS PROYECTOS DE LA CUENTA
    // =========================================================================
    if (
      promptLower.includes('mis proyectos') ||
      promptLower.includes('listar proyectos') ||
      promptLower.includes('ver proyectos') ||
      promptLower.includes('mostrar proyectos') ||
      promptLower.includes('qué proyectos tengo')
    ) {
      if (projects.length === 0) {
        return { content: `Actualmente no tenés proyectos creados. Podés pedirme: *"Creá un proyecto llamado..."* para comenzar.` };
      }

      const listItems = projects.map(
        (p) =>
          `- ${p.id === currentProject?.id ? '👉 **[ACTIVO]**' : '•'} **${p.name}** (\`${p.key}\`) - *${p.description || 'Sin descripción'}*`
      );

      return {
        content: `📂 **Tus Proyectos Registrados (${projects.length}):**\n\n${listItems.join('\n')}\n\nPodés pedirme cambiar a cualquiera diciendo: *"Cambiá al proyecto [Nombre]"*.`,
      };
    }

    // =========================================================================
    // 7. INSTRUCCIÓN COMPUESTA (RENOMBRAR + GENERAR DESCRIPCIÓN)
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
      let extractedName = '';

      const quotedMatch = raw.match(/["']([a-zA-Z0-9_\-\s]{2,30})["']/);
      if (quotedMatch && quotedMatch[1]) {
        extractedName = quotedMatch[1].trim();
      }

      if (!extractedName) {
        const nameMatch = raw.match(
          /(?:a|por|como|solo|llamado|titulado)\s+["']?([a-zA-Z0-9_\-]{2,25})["']?(?=\s+y\s+|\s+con\s+|\s+que\s+|\s*,|\s*\.|\s*$)/i
        );
        if (nameMatch && nameMatch[1]) {
          extractedName = nameMatch[1].trim();
        }
      }

      if (!extractedName) {
        const fallbackMatch = raw.match(/(?:nombre\s+(?:del\s+proyecto\s+)?a|se\s+llame\s+(?:solo\s+)?)\s*([a-zA-Z0-9_\-]+)/i);
        if (fallbackMatch && fallbackMatch[1]) {
          extractedName = fallbackMatch[1].trim();
        }
      }

      const finalProjectName = extractedName
        ? extractedName.charAt(0).toUpperCase() + extractedName.slice(1).toLowerCase()
        : currentProject.name;

      const generatedDescription = synthesizeProjectDescription(finalProjectName, raw);
      const cleanKey = finalProjectName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || currentProject.key;

      updateProject(currentProject.id, {
        name: finalProjectName,
        description: generatedDescription,
        key: cleanKey,
      });

      const suggestedTasks = generateIntelligentTasks(finalProjectName, generatedDescription, raw, projectTasks);

      return {
        content: `### 🧠 Análisis y Ejecución de Solicitud\n\nHe analizado tu mensaje para **${finalProjectName}**:\n\n- 🏷️ **Nombre del Proyecto:** Actualizado a **${finalProjectName}** (Clave: \`${cleanKey}\`)\n- 📝 **Descripción Contextual Generada:**\n  *"${generatedDescription}"*\n\n---\n🎯 **Estructura Especializada Propuesta:**\nPodés importar estas ${suggestedTasks.length} tareas al tablero con 1 clic:`,
        generatedTasks: suggestedTasks,
      };
    }

    // =========================================================================
    // 8. RENOMBRAR PROYECTO ACTUAL
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
    // 9. CAMBIAR DESCRIPCIÓN DEL PROYECTO ACTUAL
    // =========================================================================
    if (wantsDescription && currentProject) {
      const generatedDescription = synthesizeProjectDescription(currentProject.name, raw);
      updateProject(currentProject.id, { description: generatedDescription });
      return {
        content: `📝 **Descripción del proyecto actualizada exitosamente:**\n\n*"${generatedDescription}"*`,
      };
    }

    // =========================================================================
    // 10. BORRAR TODAS LAS TAREAS DEL PROYECTO
    // =========================================================================
    if (
      /(borra|elimina|borrar|eliminar|quitar|vaciar|limpiar)\s+(todas\s+las\s+|los\s+|las\s+)?tareas/i.test(promptLower) ||
      /(eliminar|borrar)\s+(todo|el\s+tablero)/i.test(promptLower)
    ) {
      if (projectTasks.length === 0) {
        return {
          content: `El proyecto **${currentProjName}** no tiene tareas registradas actualmente.`,
        };
      }

      const count = projectTasks.length;
      projectTasks.forEach((t) => deleteTask(t.id));

      return {
        content: `🗑️ **Acción ejecutada con éxito:**\n\nHe eliminado **${count} tarea(s)** del proyecto **${currentProjName}**.\n\nEl tablero está completamente limpio.`,
      };
    }

    // =========================================================================
    // 11. CREAR TAREAS EN LOTE
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
    // 12. CREAR TAREA INDIVIDUAL
    // =========================================================================
    const createTaskMatch = raw.match(
      /(?:crea|crear|agrega|agregar|nueva|anota|anotar|generar)\s+(?:una\s+|la\s+)?tarea\s+(?:llamada\s+|titulada\s+|de\s+|para\s+)?["']?([^"'\n]+)["']?/i
    );

    if (createTaskMatch && createTaskMatch[1] && !promptLower.includes('subtarea') && !promptLower.includes('dividir') && !promptLower.includes('descomponer') && !promptLower.includes('proyecto')) {
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
    // 13. BORRAR TAREA ESPECÍFICA
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
    // 14. CAMBIAR ESTADO DE TAREA
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
    // 15. RESUMEN Y DIAGNÓSTICO
    // =========================================================================
    if (
      promptLower.includes('resumen') ||
      promptLower.includes('estado') ||
      promptLower.includes('avance') ||
      promptLower.includes('progreso') ||
      promptLower.includes('cómo vamos') ||
      promptLower.includes('horas')
    ) {
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
      const totalEstimated = projectTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);
      const totalLogged = projectTasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);
      const urgentCount = projectTasks.filter((t) => t.priority === 'URGENTE').length;
      const highCount = projectTasks.filter((t) => t.priority === 'ALTA').length;

      return {
        content: `### 📊 Diagnóstico del Proyecto: **${currentProjName}**\n\n- **Porcentaje de Entrega:** \`${progressPercent}%\` (${completedTasks.length} de ${totalTasks} tareas)\n- **Distribución:**\n  - ⏳ **Pendientes:** ${pendingTasks.length}\n  - 🚀 **En Progreso:** ${inProgressTasks.length}\n  - ✅ **Finalizadas:** ${completedTasks.length}\n- **Prioridades Críticas:** ${urgentCount} Urgentes, ${highCount} Altas\n- **Horas Estimadas:** \`${totalEstimated}h\` | **Registradas:** \`${totalLogged}h\`\n\n**Recomendación de Nexor AI:**\n${
          urgentCount > 0
            ? `⚠️ Hay **${urgentCount} tarea(s) urgente(s)** activas. Se sugiere destrabar esos ítems primero.`
            : totalTasks === 0
            ? 'El tablero no tiene tareas activas actualmente. Podés pedirme crear una estructura de trabajo.'
            : 'El flujo de trabajo presenta un ritmo equilibrado.'
        }`,
      };
    }

    // =========================================================================
    // 16. CONSULTORÍA Y ASISTENCIA TÉCNICA ABIERTA
    // =========================================================================
    return {
      content: `### 💡 Asistencia y Análisis: ${raw}\n\nCon respecto a tu consulta en **${getLocationLabel()}**:\n\n1. **Evaluación:** He analizado tu mensaje considerando el dominio del proyecto **${currentProjName}** y sus ${totalTasks} tareas actuales.\n2. **Acciones Disponibles:** Podés pedirme estructurar tareas de las siguientes etapas del proyecto, auditar riesgos, generar un changelog o modificar cualquier parámetro.\n\n¿Querés que cree tareas específicas o que aplique algún cambio?`,
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
            content: `Conversación reiniciada. ¿Qué orden o consulta tenés sobre **${currentProject?.name || 'tu espacio'}**?`,
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

          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-sm text-violet-700 dark:text-violet-300 pt-1">
                {line.replace('### ', '')}
              </h4>
            );
          }

          if (line.trim() === '---') {
            return <hr key={idx} className="my-2 border-zinc-200 dark:border-zinc-800" />;
          }

          if (line.startsWith('- ') || line.startsWith('* ')) {
            const content = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 text-xs sm:text-sm">
                <span className="text-violet-600 dark:text-violet-400 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
              </div>
            );
          }

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

  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-900 dark:text-zinc-100 font-semibold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-violet-700 dark:text-violet-300 rounded font-mono text-[11px] border border-zinc-200 dark:border-zinc-700">$1</code>');
  };

  const quickPrompts = getDynamicQuickPrompts();

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 rounded-3xl w-full max-w-3xl h-[88vh] max-h-[780px] overflow-hidden shadow-2xl flex flex-col justify-between ring-1 ring-black/5 dark:ring-white/10">
        {/* HEADER DEL CHAT DE IA */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
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
                  Agente Semántico
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span>{getLocationLabel()}</span>
              </p>
            </div>
          </div>

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
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-600/40 text-violet-700 dark:text-violet-200 font-bold text-xs flex items-center justify-center border border-violet-200 dark:border-violet-500/40 shrink-0 mt-0.5 shadow-xs">
                    {getInitials(currentUser.name)}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-violet-400/30 shrink-0 mt-0.5 shadow-md shadow-violet-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 px-1">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {isUser ? currentUser.name : 'Nexor AI'}
                    </span>
                    <span>{formatDateTime(msg.createdAt.toISOString())}</span>
                  </div>

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
                          Tareas Especializadas ({msg.generatedTasks.length})
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
                <span>Nexor AI está analizando el dominio y ejecutando</span>
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

        {/* PILLS DE ACCIÓN RÁPIDA DINÁMICAS */}
        <div className="px-4 py-2 bg-zinc-50/90 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, idx) => {
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

        {/* TEXTBOX CARD FLOTANTE */}
        <div className="p-3 sm:p-4 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-violet-500/70 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all p-2.5 sm:p-3 shadow-xs flex flex-col gap-1.5"
          >
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
              placeholder="Ej: 'Auditá el proyecto', 'Generá un Changelog', 'Creá las tareas que faltan'..."
              className="ai-chat-input w-full bg-transparent border-0 outline-none text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none max-h-32 min-h-[38px] leading-relaxed p-1"
            />

            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 select-none">
                <span className="font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Razonamiento Semántico
                </span>
                <span className="hidden sm:inline">• ↵ Enviar • ⇧↵ Salto</span>
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
