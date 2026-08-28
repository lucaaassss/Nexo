import { NextResponse } from 'next/server';

/**
 * Catálogo exhaustivo de dominios especializados y fases evolutivas de desarrollo
 */
interface DomainPhase {
  phaseName: string;
  tasks: Array<{
    title: string;
    description: string;
    priority: 'ALTA' | 'MEDIA' | 'URGENTE' | 'BAJA';
    estimatedHours: number;
    tags: string[];
  }>;
}

interface DomainKnowledge {
  keywords: string[];
  phases: DomainPhase[];
}

const DOMAIN_LIBRARY: Record<string, DomainKnowledge> = {
  nexo_saas: {
    keywords: ['nexo', 'saas', 'gestion', 'proyecto', 'proyectos', 'equipo', 'scrum', 'kanban', 'agil', 'colaboracion', 'productividad', 'jira', 'trello', 'asana'],
    phases: [
      {
        phaseName: 'Core & Tablero Interactivo',
        tasks: [
          {
            title: 'Tablero Kanban drag-and-drop con columnas dinámicas y ordenamiento',
            description: 'Permitir mover tareas entre estados con animaciones fluidas, reordenamiento por posición y persistencia reactiva.',
            priority: 'URGENTE',
            estimatedHours: 8,
            tags: ['Frontend', 'Kanban'],
          },
          {
            title: 'Sistema de presencia de usuarios y cursores colaborativos en vivo',
            description: 'Mostrar avatares de miembros conectados simultáneamente en el proyecto con WebSockets.',
            priority: 'ALTA',
            estimatedHours: 6,
            tags: ['Realtime', 'WebSockets'],
          },
          {
            title: 'Editor de tareas con Markdown enriquecido, adjuntos y checklist',
            description: 'Modal de detalle con checklist interactiva, carga de imágenes y menciones de miembros (@usuario).',
            priority: 'ALTA',
            estimatedHours: 7,
            tags: ['UI', 'Editor'],
          },
          {
            title: 'Filtros combinados por prioridad, etiquetas, miembros y fecha límite',
            description: 'Barra de filtrado dinámico en tiempo real con badges contadores y búsqueda por palabras clave.',
            priority: 'MEDIA',
            estimatedHours: 4,
            tags: ['Frontend', 'Filtros'],
          },
        ],
      },
      {
        phaseName: 'Integraciones & Comunicación',
        tasks: [
          {
            title: 'Módulo de chat contextual de equipo con hilos de respuestas',
            description: 'Canal de mensajería instantánea por proyecto con soporte para respuestas anidadas y reacciones con emojis.',
            priority: 'ALTA',
            estimatedHours: 7,
            tags: ['Chat', 'Realtime'],
          },
          {
            title: 'Sistema de Webhooks para notificaciones automáticas en Slack y Discord',
            description: 'Disparar alertas externas ante creación de tareas, cambios de estado críticos o asignaciones.',
            priority: 'MEDIA',
            estimatedHours: 5,
            tags: ['Integraciones', 'Webhooks'],
          },
          {
            title: 'Centro de notificaciones push en la app y resúmenes por correo',
            description: 'Gestor de alertas en campana superior con selector de leídos y envío de digest diario por email.',
            priority: 'MEDIA',
            estimatedHours: 6,
            tags: ['Notificaciones', 'Email'],
          },
          {
            title: 'Bóveda de archivos compartidos con vista previa y control de versiones',
            description: 'Subida de documentos y diseños con previsualización de PDFs, imágenes y enlace a tareas asociadas.',
            priority: 'MEDIA',
            estimatedHours: 5,
            tags: ['Archivos', 'Almacenamiento'],
          },
        ],
      },
      {
        phaseName: 'Métricas, Reportes & Automatización',
        tasks: [
          {
            title: 'Dashboard de métricas con gráfico Burndown y velocidad de sprint',
            description: 'Visualizar horas estimadas vs trabajadas, distribución de tareas por prioridad y eficiencia del equipo.',
            priority: 'ALTA',
            estimatedHours: 8,
            tags: ['Métricas', 'Analítica'],
          },
          {
            title: 'Exportador de informes ejecutivos en formato PDF y Excel (CSV)',
            description: 'Generación de reportes de avance de proyecto con membrete corporativo y desglose de horas por miembro.',
            priority: 'MEDIA',
            estimatedHours: 4,
            tags: ['Reportes', 'Exportación'],
          },
          {
            title: 'Automatización de reglas de flujo de trabajo (Workflow Triggers)',
            description: 'Configurar acciones automáticas: "Si una tarea se marca Finalizada, notificar al creador y registrar tiempo".',
            priority: 'ALTA',
            estimatedHours: 7,
            tags: ['Automatización', 'Reglas'],
          },
          {
            title: 'Auditoría de seguridad y matriz de permisos por roles (RBAC)',
            description: 'Configuración granular de accesos para Administradores, Desarrolladores, Diseñadores y Clientes (solo lectura).',
            priority: 'URGENTE',
            estimatedHours: 6,
            tags: ['Seguridad', 'RBAC'],
          },
        ],
      },
    ],
  },
  fitness: {
    keywords: ['fit', 'ftness', 'gym', 'gimnasio', 'entrenar', 'entrenamiento', 'rutina', 'musculacion', 'calorias', 'dieta', 'nutricion', 'pesas', 'crossfit', 'ejercicio', 'cardio'],
    phases: [
      {
        phaseName: 'Catálogo & Rutinas',
        tasks: [
          {
            title: 'Catálogo interactivo de ejercicios con videos en bucle y grupos musculares',
            description: 'Biblioteca filtrable por equipamiento (mancuernas, barra, peso corporal), postura correcta y dificultad.',
            priority: 'ALTA',
            estimatedHours: 6,
            tags: ['Frontend', 'Fitness'],
          },
          {
            title: 'Constructor drag-and-drop de rutinas y planes semanales',
            description: 'Planificador de series, repeticiones, cargas (kg/lbs) y RPE/esfuerzo percibido con cálculo de volumen total.',
            priority: 'URGENTE',
            estimatedHours: 8,
            tags: ['Core', 'Lógica'],
          },
          {
            title: 'Temporizador HIIT inteligente con intervalos de descanso y alertas de voz',
            description: 'Cronómetro sonoro configurable para Tabata y series con conteo regresivo en segundo plano.',
            priority: 'MEDIA',
            estimatedHours: 4,
            tags: ['Mobile', 'Audio'],
          },
          {
            title: 'Módulo de registro de peso corporal, pliegues y 1RM estimado',
            description: 'Gráficos comparativos de progreso muscular y cálculo automático de fuerza máxima según fórmulas científicas.',
            priority: 'MEDIA',
            estimatedHours: 5,
            tags: ['Métricas', 'UI'],
          },
        ],
      },
      {
        phaseName: 'Nutrición & Wearables',
        tasks: [
          {
            title: 'Calculadora de macronutrientes y diario de comidas con escáner de código de barras',
            description: 'Desglose de proteínas, carbohidratos y grasas con metas de superávit o déficit calórico.',
            priority: 'ALTA',
            estimatedHours: 8,
            tags: ['Nutrición', 'API'],
          },
          {
            title: 'Sincronización automática con Apple Health y Google Fit',
            description: 'Importación de pasos diarios, frecuencia cardíaca en reposo y calorías activas quemadas.',
            priority: 'ALTA',
            estimatedHours: 7,
            tags: ['Integraciones', 'Salud'],
          },
          {
            title: 'Comunidad de atletas con muro de récords personales (PR) y medallas',
            description: 'Sistema de insignias de logro por constancia, volumen de levantamiento y retos mensuales.',
            priority: 'MEDIA',
            estimatedHours: 5,
            tags: ['Gamificación', 'Social'],
          },
          {
            title: 'Modo Offline con sincronización en segundo plano para entrenar sin conexión',
            description: 'Caché local con IndexedDB para guardar series en el gimnasio y sincronizar al recuperar internet.',
            priority: 'URGENTE',
            estimatedHours: 6,
            tags: ['PWA', 'Offline'],
          },
        ],
      },
    ],
  },
  travel: {
    keywords: ['viaje', 'viajes', 'vuelo', 'vuelos', 'hotel', 'hoteles', 'turismo', 'aerius', 'despegar', 'reserva', 'hospedaje', 'pasajes', 'itinerario', 'aerolinea'],
    phases: [
      {
        phaseName: 'Búsqueda & Reservas',
        tasks: [
          {
            title: 'Buscador y comparador de vuelos y hoteles con tarifas en tiempo real',
            description: 'Filtros por escalas, equipaje incluido, cancelación gratuita y cotización instantánea.',
            priority: 'URGENTE',
            estimatedHours: 8,
            tags: ['Frontend', 'API'],
          },
          {
            title: 'Pasarela de pagos multidivisa con cuotas y emisión de vouchers PDF',
            description: 'Checkout seguro con soporte de tarjetas internacionales, split de pagos y generación de boletos con QR.',
            priority: 'URGENTE',
            estimatedHours: 7,
            tags: ['Pagos', 'Backend'],
          },
          {
            title: 'Gestor interactivo de itinerarios "Mis Viajes" con mapas offline',
            description: 'Cronograma día por día sincronizado con reservas de hoteles, excursiones y vuelos.',
            priority: 'ALTA',
            estimatedHours: 6,
            tags: ['UI', 'Itinerarios'],
          },
          {
            title: 'Sistema de alertas de precio y notificaciones de cambio de puerta de embarque',
            description: 'Servicio de monitoreo continuo de vuelos con envío de avisos por WhatsApp y notificaciones push.',
            priority: 'MEDIA',
            estimatedHours: 5,
            tags: ['Notificaciones', 'Realtime'],
          },
        ],
      },
      {
        phaseName: 'Experiencia & Reseñas',
        tasks: [
          {
            title: 'Sistema de reseñas verificadas con fotos reales y puntuación por categorías',
            description: 'Calificación de ubicación, atención, limpieza y comida con moderación automatizada de spam.',
            priority: 'MEDIA',
            estimatedHours: 5,
            tags: ['Comunidad', 'Reviews'],
          },
          {
            title: 'Módulo de seguro de viaje y asistencia al viajero integrada',
            description: 'Cotización automática de coberturas médicas según país de destino y cantidad de pasajeros.',
            priority: 'ALTA',
            estimatedHours: 6,
            tags: ['Seguros', 'Checkout'],
          },
          {
            title: 'Conversor de divisas y calculadora de propinas en destino',
            description: 'Herramienta de utilidad para el viajero con tasas de cambio actualizadas diariamente.',
            priority: 'BAJA',
            estimatedHours: 3,
            tags: ['Utilidades'],
          },
          {
            title: 'Panel de autogestión de cambios de fecha y solicitudes de reembolso',
            description: 'Flujo automatizado para cancelaciones de acuerdo a las políticas de cada aerolínea u hotel.',
            priority: 'ALTA',
            estimatedHours: 7,
            tags: ['Postventa', 'Backend'],
          },
        ],
      },
    ],
  },
  ecommerce: {
    keywords: ['tienda', 'shop', 'ecommerce', 'e-commerce', 'carrito', 'producto', 'productos', 'venta', 'ventas', 'mercadolibre', 'compras', 'catalogo', 'stock'],
    phases: [
      {
        phaseName: 'Catálogo & Checkout',
        tasks: [
          {
            title: 'Catálogo responsivo de productos con variantes de color, talle y stock dinámico',
            description: 'Filtros multicriterio, ordenamiento por precio/popularidad y galería con zoom HD.',
            priority: 'ALTA',
            estimatedHours: 6,
            tags: ['Frontend', 'Catálogo'],
          },
          {
            title: 'Carrito de compras persistente y Checkout en un solo paso con Stripe / MercadoPago',
            description: 'Formulario optimizado de pago con cupones de descuento y cálculo automático de impuestos.',
            priority: 'URGENTE',
            estimatedHours: 8,
            tags: ['Pagos', 'Checkout'],
          },
          {
            title: 'Cotizador automático de envíos por código postal y generación de etiquetas de despacho',
            description: 'Integración con APIs logísticas para tarifas en tiempo real según peso y volumen.',
            priority: 'MEDIA',
            estimatedHours: 5,
            tags: ['Logística', 'API'],
          },
          {
            title: 'Panel de administración de órdenes de compra y cambios de estado de entrega',
            description: 'Tablero para el vendedor con control de pedidos empaquetados, despachados y entregados.',
            priority: 'ALTA',
            estimatedHours: 6,
            tags: ['Admin', 'Órdenes'],
          },
        ],
      },
    ],
  },
};

/**
 * Motor Generativo de Tareas con Memoria de Fases y Detección Temática
 */
function generateContextualTasks(
  projectName: string,
  projectDesc: string,
  userPrompt: string,
  existingTasks: Array<{ title: string; key?: string }>
): {
  phaseTitle: string;
  tasks: Array<{
    title: string;
    description: string;
    priority: 'ALTA' | 'MEDIA' | 'URGENTE' | 'BAJA';
    estimatedHours: number;
    tags: string[];
  }>;
} {
  const combined = `${projectName} ${projectDesc} ${userPrompt}`.toLowerCase();
  const existingTitles = existingTasks.map((t) => t.title.toLowerCase());

  // 1. Buscar dominio coincidente
  let matchedDomain: DomainKnowledge | null = null;
  for (const key of Object.keys(DOMAIN_LIBRARY)) {
    const dom = DOMAIN_LIBRARY[key];
    if (dom.keywords.some((k) => combined.includes(k))) {
      matchedDomain = dom;
      break;
    }
  }

  // Si no coincide con ninguno específico, usar la base SaaS/Nexo avanzada
  if (!matchedDomain) {
    matchedDomain = DOMAIN_LIBRARY.nexo_saas;
  }

  // 2. Buscar la primera fase que tenga tareas no creadas
  for (const phase of matchedDomain.phases) {
    const remainingTasks = phase.tasks.filter(
      (task) => !existingTitles.some((ex) => ex.includes(task.title.toLowerCase().substring(0, 18)))
    );

    if (remainingTasks.length > 0) {
      return {
        phaseTitle: phase.phaseName,
        tasks: remainingTasks,
      };
    }
  }

  // 3. Si ya se crearon todas las tareas del catálogo, sintetizar tareas dinámicas de fase avanzada
  const taskCount = existingTasks.length;
  return {
    phaseTitle: `Fase Avanzada & Optimización (${projectName})`,
    tasks: [
      {
        title: `Optimización de performance y caching distribuido con Redis en ${projectName}`,
        description: `Implementar capa de caché en memoria para consultas frecuentes y reducir tiempos de respuesta bajo 50ms.`,
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['Performance', 'Backend'],
      },
      {
        title: `Suite integral de pruebas End-to-End (E2E) con Playwright`,
        description: `Automatizar flujos críticos de usuario para evitar regresiones antes de cada despliegue a producción.`,
        priority: 'URGENTE',
        estimatedHours: 7,
        tags: ['QA', 'Testing'],
      },
      {
        title: `Módulo de auditoría de actividad y registro de logs de cumplimiento`,
        description: `Historial inmutable de cambios con timestamps, IP y usuario responsable para trazabilidad total.`,
        priority: 'MEDIA',
        estimatedHours: 5,
        tags: ['Auditoría', 'Seguridad'],
      },
      {
        title: `Automatización de despliegue continuo (CI/CD) con Docker y Kubernetes`,
        description: `Pipeline automatizado de build, validación de TypeScript y deploy sin caída de servicio (Zero-Downtime).`,
        priority: 'ALTA',
        estimatedHours: 8,
        tags: ['DevOps', 'Infra'],
      },
    ],
  };
}

/**
 * Handler POST /api/ai
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, prompt, context } = body;

    const conversationMessages =
      messages && Array.isArray(messages) && messages.length > 0
        ? messages
        : [{ role: 'user', content: prompt || 'Hola' }];

    const { project, tasks, allProjects, currentUser, activePage, activeTab, taskViewMode } = context || {};

    const projectName = project?.name || 'Proyecto';
    const projectDesc = project?.description || '';
    const existingTaskList = Array.isArray(tasks) ? tasks : [];
    const lastUserPrompt = conversationMessages[conversationMessages.length - 1]?.content || '';
    const lastPromptLower = lastUserPrompt.toLowerCase().trim();

    // =========================================================================
    // 1. SALUDOS Y CONVERSACIÓN CASUAL
    // =========================================================================
    if (
      lastPromptLower === 'hola' ||
      lastPromptLower.startsWith('hola ') ||
      ['buenas', 'buen dia', 'que tal', 'hey', 'como estas'].some((g) => lastPromptLower === g)
    ) {
      const firstName = currentUser?.name?.split(' ')[0] || 'Lucas';
      return NextResponse.json({
        reply: `¡Hola **${firstName}**! 👋 ¿Cómo estás? Todo listo para avanzar en **${projectName}**.\n\nTengo acceso a tu tablero Kanban (${existingTaskList.length} tareas cargadas).\n\nPodés pedirme:\n- 🎯 *"Creá tareas para el proyecto"* (analizo la temática y las genero en el tablero sin repetir).\n- 🗑️ *"Borrá todas las tareas"* (para reiniciar el tablero).\n- 🔍 *"Auditá el proyecto"* o *"Generá un Changelog"*.\n\n¿En qué te doy una mano?`,
        actions: [],
      });
    }

    // =========================================================================
    // 2. BORRAR TODAS LAS TAREAS
    // =========================================================================
    if (
      lastPromptLower.includes('borra') ||
      lastPromptLower.includes('borrar') ||
      lastPromptLower.includes('elimina') ||
      lastPromptLower.includes('eliminar') ||
      lastPromptLower.includes('limpiar') ||
      lastPromptLower.includes('limpia')
    ) {
      if (lastPromptLower.includes('tarea') || lastPromptLower.includes('todo') || lastPromptLower.includes('tablero')) {
        return NextResponse.json({
          reply: `🗑️ **Tablero limpiado con éxito.**\n\nHe eliminado las **${existingTaskList.length} tareas** del proyecto **${projectName}**. El tablero quedó completamente limpio.`,
          actions: [{ type: 'delete_task', deleteAll: true }],
        });
      }
    }

    // =========================================================================
    // 3. CREAR TAREAS / AGREGAR MÁS TAREAS (¡Análisis dinámico y no repetitivo!)
    // =========================================================================
    const wantsCreateTasks =
      lastPromptLower.includes('tarea') ||
      lastPromptLower.includes('tareas') ||
      lastPromptLower.includes('crear') ||
      lastPromptLower.includes('creame') ||
      lastPromptLower.includes('crea') ||
      lastPromptLower.includes('agrega') ||
      lastPromptLower.includes('generar') ||
      lastPromptLower.includes('armar') ||
      lastPromptLower.includes('mas');

    if (wantsCreateTasks) {
      // Generar tareas para la siguiente fase no cubierta
      const generated = generateContextualTasks(projectName, projectDesc, lastUserPrompt, existingTaskList);

      const actions = generated.tasks.map((t) => ({
        type: 'create_task',
        title: t.title,
        description: t.description,
        priority: t.priority,
        estimatedHours: t.estimatedHours,
        tags: t.tags,
      }));

      const taskSummaries = generated.tasks
        .map(
          (t, idx) =>
            `${idx + 1}. **${t.title}** (${t.estimatedHours}h, Prioridad: \`${t.priority}\`)\n   *${t.description}*`
        )
        .join('\n\n');

      return NextResponse.json({
        reply: `🚀 **¡He generado e insertado ${generated.tasks.length} nuevas tareas para "${projectName}"!**\n\n📍 **Fase del Proyecto:** \`${generated.phaseTitle}\`\n\n${taskSummaries}\n\nTodas las tareas ya están creadas en tu tablero Kanban en estado \`PENDIENTE\`. Si necesitás más funcionalidades, pedime: *"creá más tareas"*.`,
        actions,
      });
    }

    // =========================================================================
    // 4. AUDITORÍA DE SALUD Y RIESGOS
    // =========================================================================
    if (
      lastPromptLower.includes('auditar') ||
      lastPromptLower.includes('auditoria') ||
      lastPromptLower.includes('riesgo') ||
      lastPromptLower.includes('cuello de botella')
    ) {
      const total = existingTaskList.length;
      const completed = existingTaskList.filter((t: any) => t.status === 'FINALIZADA').length;
      const urgent = existingTaskList.filter((t: any) => t.priority === 'URGENTE').length;
      const totalHours = existingTaskList.reduce((acc: number, t: any) => acc + (t.estimatedHours || 0), 0);

      return NextResponse.json({
        reply: `### 🛡️ Informe de Auditoría y Salud: **${projectName}**\n\n- 📊 **Tareas en el Tablero:** \`${total}\` (${completed} finalizadas)\n- ⚠️ **Tareas con Prioridad Urgente:** \`${urgent}\`\n- ⏱️ **Carga Estimada de Desarrollo:** \`${totalHours} horas\`\n\n**Diagnóstico de Nexor AI:**\n${
          total === 0
            ? 'El tablero se encuentra vacío. Te sugiero pedirme: *"Creá las tareas del proyecto"*.'
            : urgent > 0
            ? `Hay ${urgent} tarea(s) urgente(s) activas que conviene destrabar antes del cierre de sprint.`
            : 'El proyecto se encuentra en un ritmo de trabajo saludable y equilibrado.'
        }`,
        actions: [],
      });
    }

    // =========================================================================
    // 5. CHANGELOG / RELEASE NOTES
    // =========================================================================
    if (
      lastPromptLower.includes('changelog') ||
      lastPromptLower.includes('release') ||
      lastPromptLower.includes('lanzamiento')
    ) {
      const completed = existingTaskList.filter((t: any) => t.status === 'FINALIZADA');

      if (completed.length === 0) {
        return NextResponse.json({
          reply: `Actualmente no hay tareas marcadas como \`FINALIZADA\` en **${projectName}** para compilar el Changelog.\n\nCuando completes tareas en el tablero, pedime el Changelog y redactaré las notas de versión para clientes.`,
          actions: [],
        });
      }

      const list = completed.map((t: any) => `- ✨ **${t.title}** (\`${t.key}\`): Funcionalidad completada e integrada.`).join('\n');

      return NextResponse.json({
        reply: `### 🚀 Notas de Lanzamiento (Changelog v1.0) - **${projectName}**\n\nSe completaron **${completed.length} tareas** en este ciclo:\n\n${list}\n\n*Documento listo para ser compartido con el equipo o clientes.*`,
        actions: [],
      });
    }

    // =========================================================================
    // 6. RESPUESTA CONTEXTUAL POR DEFECTO
    // =========================================================================
    return NextResponse.json({
      reply: `He analizado tu mensaje para **${projectName}**.\n\nActualmente el proyecto cuenta con **${existingTaskList.length} tareas** en el tablero. Podés pedirme:\n- *"Creá las tareas que faltan"*\n- *"Borrá todas las tareas"*\n- *"Auditá los cuellos de botella"*`,
      actions: [],
    });
  } catch (error: any) {
    console.error('Error en /api/ai:', error);
    return NextResponse.json({
      reply: 'Ocurrió un error al procesar la instrucción. Por favor, reintenta tu mensaje.',
      actions: [],
    });
  }
}
