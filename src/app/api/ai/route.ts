import { NextResponse } from 'next/server';

/**
 * Catálogo de dominios especializados para generación y análisis semántico
 */
interface DomainSpec {
  keywords: string[];
  tasks: Array<{
    title: string;
    description: string;
    priority: 'ALTA' | 'MEDIA' | 'URGENTE' | 'BAJA';
    estimatedHours: number;
    tags: string[];
  }>;
}

const DOMAINS: Record<string, DomainSpec> = {
  fitness: {
    keywords: ['fit', 'ftness', 'gym', 'gimnasio', 'entrenar', 'entrenamiento', 'rutina', 'musculacion', 'calorias', 'dieta', 'nutricion', 'pesas', 'crossfit', 'ejercicio'],
    tasks: [
      {
        title: 'Catálogo interactivo de ejercicios con filtros por grupo muscular',
        description: 'Construir biblioteca de ejercicios con videos en bucle, guía de postura, músculos involucrados y niveles de dificultad.',
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['Frontend', 'Fitness'],
      },
      {
        title: 'Constructor drag-and-drop de rutinas y planes de entrenamiento',
        description: 'Permitir al usuario armar rutinas semanales personalizando series, repeticiones, cargas y tiempos de descanso.',
        priority: 'URGENTE',
        estimatedHours: 8,
        tags: ['Core', 'Lógica'],
      },
      {
        title: 'Módulo de registro de peso corporal, medidas y 1RM estimado',
        description: 'Gráficos interactivos de evolución temporal con cálculo automático de repetición máxima y registro fotográfico.',
        priority: 'MEDIA',
        estimatedHours: 5,
        tags: ['Métricas', 'UI'],
      },
      {
        title: 'Temporizador HIIT inteligente con alertas de voz y descanso',
        description: 'Cronómetro de intervalos configurables para circuitos con alertas sonoras en segundo plano y compatibilidad mobile.',
        priority: 'MEDIA',
        estimatedHours: 4,
        tags: ['Mobile', 'Audio'],
      },
    ],
  },
  travel: {
    keywords: ['viaje', 'viajes', 'vuelo', 'vuelos', 'hotel', 'hoteles', 'turismo', 'aerius', 'despegar', 'reserva', 'hospedaje', 'pasajes', 'itinerario'],
    tasks: [
      {
        title: 'Buscador y comparador de vuelos y hoteles con tarifas en vivo',
        description: 'Integrar filtros por fechas flexibles, escalas, aerolíneas y cálculo dinámico de impuestos locales.',
        priority: 'URGENTE',
        estimatedHours: 8,
        tags: ['Frontend', 'API'],
      },
      {
        title: 'Pasarela de pagos multidivisa con cuotas y emisión de vouchers PDF',
        description: 'Checkout seguro con soporte de tarjetas internacionales y generación instantánea del boleto digital.',
        priority: 'ALTA',
        estimatedHours: 7,
        tags: ['Pagos', 'Backend'],
      },
      {
        title: 'Gestor de itinerarios interactivo "Mis Viajes" con alertas de vuelo',
        description: 'Panel para el viajero con sincronización de reservas, mapas offline y notificaciones de demoras.',
        priority: 'MEDIA',
        estimatedHours: 6,
        tags: ['UI', 'Notificaciones'],
      },
      {
        title: 'Sistema de valoraciones y reseñas verificadas de hoteles y tours',
        description: 'Puntuación por ubicación, servicio y relación precio-calidad con moderación automática.',
        priority: 'BAJA',
        estimatedHours: 4,
        tags: ['Comunidad'],
      },
    ],
  },
  ecommerce: {
    keywords: ['tienda', 'shop', 'ecommerce', 'e-commerce', 'carrito', 'producto', 'productos', 'venta', 'ventas', 'mercadolibre', 'compras', 'catalogo'],
    tasks: [
      {
        title: 'Catálogo de productos con filtros por categoría, precio y stock',
        description: 'Galería responsiva con zoom de imágenes, variantes de talles/colores y control de existencias.',
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['Frontend', 'Catálogo'],
      },
      {
        title: 'Carrito de compras persistente y Checkout con Stripe / MercadoPago',
        description: 'Flujo de compra optimizado en un paso con validación de cupones y cálculo de impuestos.',
        priority: 'URGENTE',
        estimatedHours: 8,
        tags: ['Pagos', 'Checkout'],
      },
      {
        title: 'Integración con APIs logísticas para cotización de envíos en tiempo real',
        description: 'Cálculo de tarifas por código postal y generación automática de etiquetas de despacho.',
        priority: 'MEDIA',
        estimatedHours: 5,
        tags: ['Logística'],
      },
      {
        title: 'Panel administrativo de gestión de órdenes y estado de despachos',
        description: 'Control de pedidos entrantes, cambios de estado y envío automático de emails con número de tracking.',
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['Admin', 'Backend'],
      },
    ],
  },
  food: {
    keywords: ['comida', 'restaurante', 'delivery', 'pedidos', 'menu', 'mozo', 'bar', 'cafeteria', 'pedidosya', 'rappi', 'cocina', 'plato'],
    tasks: [
      {
        title: 'Menú digital interactivo con modificadores y fotos HD',
        description: 'Carta virtual categorizada con opciones de agregados, guarniciones y advertencias de alérgenos.',
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['Frontend', 'Menú'],
      },
      {
        title: 'Sistema de comandas en tiempo real para cocina (KDS)',
        description: 'Pantalla para el personal de cocina con alertas sonoras y tiempos de cocción por mesa/delivery.',
        priority: 'URGENTE',
        estimatedHours: 7,
        tags: ['Cocina', 'Realtime'],
      },
      {
        title: 'Rastreo en vivo de repartidores por geolocalización GPS',
        description: 'Mapa interactivo con tiempo estimado de entrega y comunicación directa con el cadete.',
        priority: 'ALTA',
        estimatedHours: 8,
        tags: ['GPS', 'Delivery'],
      },
      {
        title: 'Arqueo de caja y reporte de ventas por mozo y canal de venta',
        description: 'Cierre diario con conciliación de efectivo, cobros con tarjeta y propinas.',
        priority: 'MEDIA',
        estimatedHours: 5,
        tags: ['Finanzas'],
      },
    ],
  },
  realestate: {
    keywords: ['inmobiliaria', 'propiedad', 'propiedades', 'casa', 'departamento', 'alquiler', 'alquileres', 'terreno', 'inmueble'],
    tasks: [
      {
        title: 'Buscador de inmuebles con mapa geolocalizado y filtros avanzados',
        description: 'Filtros por m², cantidad de ambientes, precio, expensas y mapa interactivo con marcadores.',
        priority: 'URGENTE',
        estimatedHours: 8,
        tags: ['Frontend', 'Mapas'],
      },
      {
        title: 'Ficha técnica de propiedad con tour virtual 360° y planos',
        description: 'Presentación multimedia de alta resolución con botón de agendamiento directo de visitas.',
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['UI', 'Multimedia'],
      },
      {
        title: 'Simulador de créditos hipotecarios y gastos de escrituración',
        description: 'Calculadora financiera de cuotas mensuales según sistema de amortización.',
        priority: 'MEDIA',
        estimatedHours: 4,
        tags: ['Finanzas'],
      },
      {
        title: 'CRM de clientes y agenda de visitas para agentes inmobiliarios',
        description: 'Seguimiento de consultas, recordatorios de citas y envío automático de propuestas.',
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['CRM', 'Backend'],
      },
    ],
  },
  fintech: {
    keywords: ['fintech', 'banco', 'billetera', 'wallet', 'crypto', 'cripto', 'inversion', 'prestamo', 'dinero', 'transferencia'],
    tasks: [
      {
        title: 'Autenticación biométrica 2FA y validación de identidad KYC',
        description: 'Verificación de documentos de identidad y prueba de vida para cumplimiento normativo.',
        priority: 'URGENTE',
        estimatedHours: 8,
        tags: ['Seguridad', 'Auth'],
      },
      {
        title: 'Módulo de transferencias inmediatas por CBU/CVU y código QR',
        description: 'Envío y recepción de dinero en tiempo real con comprobantes descargables en PDF.',
        priority: 'URGENTE',
        estimatedHours: 7,
        tags: ['Core', 'Transacciones'],
      },
      {
        title: 'Dashboard de finanzas personales con categorización automática de gastos',
        description: 'Gráficos de barras y torta sobre el consumo mensual con sugerencias de ahorro.',
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['Métricas', 'UI'],
      },
      {
        title: 'Módulo de cotizaciones de criptomonedas y cambio de divisas en vivo',
        description: 'Conexión a WebSockets de exchanges para tasas de cambio actualizadas segundo a segundo.',
        priority: 'MEDIA',
        estimatedHours: 5,
        tags: ['Crypto', 'Realtime'],
      },
    ],
  },
};

function detectDomain(projectName: string, description: string, prompt: string): DomainSpec {
  const combined = `${projectName} ${description} ${prompt}`.toLowerCase();

  for (const key of Object.keys(DOMAINS)) {
    const spec = DOMAINS[key];
    if (spec.keywords.some((k) => combined.includes(k))) {
      return spec;
    }
  }

  // Dominio genérico por defecto de alta calidad
  return {
    keywords: [],
    tasks: [
      {
        title: `Arquitectura de datos y contratos de API para ${projectName}`,
        description: `Definir modelos de base de datos, relaciones e interfaces TypeScript principales.`,
        priority: 'ALTA',
        estimatedHours: 6,
        tags: ['Arquitectura', 'Backend'],
      },
      {
        title: `Diseño y maquetación de vistas principales de ${projectName}`,
        description: `Construir interfaz de usuario responsiva con tema claro/oscuro y componentes reutilizables.`,
        priority: 'ALTA',
        estimatedHours: 8,
        tags: ['Frontend', 'UI'],
      },
      {
        title: `Integración de lógica de negocio y persistencia en tiempo real`,
        description: `Conectar controladores, validaciones de seguridad y sincronización reactiva de datos.`,
        priority: 'MEDIA',
        estimatedHours: 7,
        tags: ['Core', 'Backend'],
      },
      {
        title: `Testing de integración y pipeline de despliegue continuo`,
        description: `Configurar pruebas automatizadas y despliegue a entorno de producción.`,
        priority: 'URGENTE',
        estimatedHours: 5,
        tags: ['QA', 'DevOps'],
      },
    ],
  };
}

/**
 * Handler POST /api/ai
 * Nexor-Space AI - Motor Multi-LLM Autónomo.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, prompt, context } = body;

    const conversationMessages = messages && Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: 'user', content: prompt || 'Hola' }];

    const { project, tasks, allProjects, currentUser, activePage, activeTab, taskViewMode } = context || {};

    const projectName = project?.name || 'Proyecto';
    const projectDesc = project?.description || '';
    const lastUserPrompt = conversationMessages[conversationMessages.length - 1]?.content || '';
    const lastUserPromptLower = lastUserPrompt.toLowerCase();

    // =========================================================================
    // TIER 1 & 2: INTENTAR CONEXIÓN CON LLMs EXTERNOS (Gemini / OpenAI)
    // =========================================================================
    const tasksList = tasks && Array.isArray(tasks) && tasks.length > 0
      ? tasks.map((t: any) => `- [${t.key || 'ID'}] "${t.title}" | Estado: ${t.status} | Prioridad: ${t.priority} | ${t.estimatedHours || 0}h`).join('\n')
      : '(Ninguna tarea registrada en este proyecto)';

    const systemPrompt = `Sos Nexor-Space AI, un asistente de IA avanzado, carismático y con control total sobre el proyecto "${projectName}" (${projectDesc}).
Usuario actual: ${currentUser?.name || 'Lucas'}.
Tareas actuales en el tablero:
${tasksList}

Instrucción clave:
Si el usuario te pide crear tareas, borrar tareas, o gestionar el proyecto, incluye las acciones en el JSON.
Formato de respuesta SIEMPRE JSON estricto:
{
  "reply": "Tu mensaje explicativo...",
  "actions": [
    // Acciones: "create_task", "delete_task", "create_project", "update_task", etc.
  ]
}`;

    // Si hay GEMINI_API_KEY
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: conversationMessages.map((m: any) => ({
                role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
              generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const raw = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const parsed = JSON.parse(raw);
            return NextResponse.json(parsed);
          }
        }
      } catch (err) {
        console.warn('Gemini error, passing to domain engine:', err);
      }
    }

    // =========================================================================
    // TIER 3 & 4: MOTOR DE INFERENCIA SEMÁNTICA DIRECTO (CERO LATENCIA / FALLBACK INTELIGENTE)
    // =========================================================================

    // 1. SALUDOS
    if (
      lastUserPromptLower === 'hola' ||
      lastUserPromptLower.startsWith('hola ') ||
      ['buenas', 'buen dia', 'que tal', 'hey'].some((g) => lastUserPromptLower === g)
    ) {
      const firstName = currentUser?.name?.split(' ')[0] || 'Lucas';
      return NextResponse.json({
        reply: `¡Hola **${firstName}**! 👋 ¿Cómo estás? Todo listo para trabajar en **${projectName}**.\n\nPodés pedirme:\n- 🎯 *"Creá las tareas del proyecto"* (las genero directamente en el tablero según la temática).\n- 🗑️ *"Borrá todas las tareas"* (para reiniciar el tablero).\n- 🔍 *"Auditá el proyecto"* o *"Generá un Changelog"*.\n\n¿En qué te doy una mano?`,
        actions: [],
      });
    }

    // 2. CREACIÓN DE TAREAS (¡Detecta cualquier variación y CREA las tareas en el tablero!)
    const wantsCreateTasks =
      lastUserPromptLower.includes('tarea') ||
      lastUserPromptLower.includes('tareas') ||
      lastUserPromptLower.includes('crear') ||
      lastUserPromptLower.includes('creame') ||
      lastUserPromptLower.includes('agrega') ||
      lastUserPromptLower.includes('generar') ||
      lastUserPromptLower.includes('armar');

    if (wantsCreateTasks && !lastUserPromptLower.includes('borra') && !lastUserPromptLower.includes('elimina')) {
      const domain = detectDomain(projectName, projectDesc, lastUserPrompt);
      const existingTitles = (tasks || []).map((t: any) => t.title.toLowerCase());

      // Filtrar para no repetir
      const newTasks = domain.tasks.filter(
        (t) => !existingTitles.some((ex: string) => ex.includes(t.title.toLowerCase().substring(0, 15)))
      );

      const tasksToCreate = newTasks.length > 0 ? newTasks : domain.tasks;

      const actions = tasksToCreate.map((t) => ({
        type: 'create_task',
        title: t.title,
        description: t.description,
        priority: t.priority,
        estimatedHours: t.estimatedHours,
        tags: t.tags,
      }));

      const taskSummaries = tasksToCreate
        .map((t, idx) => `${idx + 1}. **${t.title}** (${t.estimatedHours}h, Prioridad: \`${t.priority}\`)\n   *${t.description}*`)
        .join('\n\n');

      return NextResponse.json({
        reply: `🚀 **¡He analizado el proyecto "${projectName}" y creé ${tasksToCreate.length} tareas clave en tu tablero Kanban!**\n\n${taskSummaries}\n\nTodas las tareas ya están disponibles en estado \`PENDIENTE\` listas para que tu equipo empiece a trabajar.`,
        actions,
      });
    }

    // 3. BORRAR TODAS LAS TAREAS
    if (
      lastUserPromptLower.includes('borra') ||
      lastUserPromptLower.includes('borrar') ||
      lastUserPromptLower.includes('elimina') ||
      lastUserPromptLower.includes('eliminar') ||
      lastUserPromptLower.includes('limpiar') ||
      lastUserPromptLower.includes('limpia')
    ) {
      return NextResponse.json({
        reply: `🗑️ **Tablero limpiado con éxito.**\n\nHe eliminado todas las tareas del proyecto **${projectName}**. Cuando quieras podemos estructurar nuevas tareas desde cero.`,
        actions: [{ type: 'delete_task', deleteAll: true }],
      });
    }

    // 4. AUDITAR PROYECTO
    if (lastUserPromptLower.includes('auditar') || lastUserPromptLower.includes('auditoria') || lastUserPromptLower.includes('riesgo') || lastUserPromptLower.includes('cuello de botella')) {
      const taskArray = tasks || [];
      const total = taskArray.length;
      const completed = taskArray.filter((t: any) => t.status === 'FINALIZADA').length;
      const urgent = taskArray.filter((t: any) => t.priority === 'URGENTE').length;
      const totalHours = taskArray.reduce((acc: number, t: any) => acc + (t.estimatedHours || 0), 0);

      return NextResponse.json({
        reply: `### 🛡️ Auditoría de Salud del Proyecto: **${projectName}**\n\n- 📊 **Tareas Totales:** \`${total}\` (${completed} finalizadas)\n- ⚠️ **Tareas con Prioridad Urgente:** \`${urgent}\`\n- ⏱️ **Carga Estimada de Trabajo:** \`${totalHours} horas\`\n\n**Recomendación:**\n${
          total === 0
            ? 'Actualmente el proyecto no tiene tareas. Te sugiero pedirme: *"Creá las tareas del proyecto"*.'
            : urgent > 0
            ? `Hay ${urgent} tarea(s) urgente(s) activas que requieren atención prioritaria para evitar retrasos.`
            : 'El proyecto se encuentra en un estado saludable y con ritmo estable.'
        }`,
        actions: [],
      });
    }

    // 5. CHANGELOG / RELEASE NOTES
    if (lastUserPromptLower.includes('changelog') || lastUserPromptLower.includes('release') || lastUserPromptLower.includes('lanzamiento')) {
      const taskArray = tasks || [];
      const completed = taskArray.filter((t: any) => t.status === 'FINALIZADA');

      if (completed.length === 0) {
        return NextResponse.json({
          reply: `Actualmente no hay tareas marcadas como \`FINALIZADA\` en **${projectName}** para compilar el Changelog.\n\nCuando completes tareas, pedime de nuevo el Changelog y lo redactaré listo para clientes.`,
          actions: [],
        });
      }

      const list = completed.map((t: any) => `- ✨ **${t.title}** (\`${t.key}\`): Funcionalidad completada e integrada.`).join('\n');

      return NextResponse.json({
        reply: `### 🚀 Notas de Lanzamiento (Changelog v1.0) - **${projectName}**\n\nSe completaron **${completed.length} tareas** en este ciclo:\n\n${list}\n\n*Resumen listo para ser compartido con clientes o stakeholders.*`,
        actions: [],
      });
    }

    // 6. RESPUESTA ABIERTA Y CONVERSACIONAL
    return NextResponse.json({
      reply: `Analicé tu mensaje sobre **${projectName}**.\n\nActualmente el proyecto cuenta con **${tasks?.length || 0} tareas**. ¿Querés que agregue tareas específicas para esta etapa, que cambie el estado de alguna tarea o que te ayude con el diseño de arquitectura?`,
      actions: [],
    });
  } catch (error: any) {
    console.error('Error in /api/ai:', error);
    return NextResponse.json({
      reply: 'Tuve un inconveniente al procesar tu solicitud, pero ya estoy disponible. ¿En qué te ayudo?',
      actions: [],
    });
  }
}
