import { NextResponse } from 'next/server';

/**
 * Handler POST /api/ai
 * Endpoint Autónomo con Gemini 1.5 Flash, Tool-Calling y Control Total de Proyectos.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, prompt, context, apiKey } = body;

    const conversationMessages =
      messages && Array.isArray(messages) && messages.length > 0
        ? messages
        : [{ role: 'user', content: prompt || 'Hola' }];

    const { project, tasks, allProjects, currentUser, activePage, activeTab, taskViewMode } = context || {};

    const projectName = project?.name || 'Proyecto';
    const projectDesc = project?.description || '';
    const existingTaskList = Array.isArray(tasks) ? tasks : [];
    const membersList = project?.members ? JSON.stringify(project.members.map((m: any) => ({ id: m.userId, name: m.user?.name, role: m.role }))) : '[]';

    const tasksSummary = existingTaskList.length > 0
      ? existingTaskList
          .map(
            (t: any) =>
              `- [${t.key || t.id}] "${t.title}" | Estado: ${t.status} | Prioridad: ${t.priority} | ${t.estimatedHours || 0}h estimadas`
          )
          .join('\n')
      : '(Ninguna tarea registrada actualmente)';

    const projectsSummary = Array.isArray(allProjects) && allProjects.length > 0
      ? allProjects.map((p: any) => `- "${p.name}" (Clave: ${p.key}, ID: ${p.id})`).join('\n')
      : '(Ningún otro proyecto)';

    const systemPrompt = `Sos Nexor-Space AI, un asistente de inteligencia artificial sumamente inteligente, carismático y con control total sobre la plataforma de gestión de proyectos Nexor-Space (equivalente a ChatGPT / Gemini).

## Contexto Actual del Espacio de Trabajo:
- **Usuario:** ${currentUser?.name || 'Lucas'} (${currentUser?.email || ''})
- **Proyecto Activo:** "${projectName}" (Clave: ${project?.key || 'PRJ'})
- **Descripción del Proyecto:** "${projectDesc || 'Sin descripción'}"
- **Tareas Actuales en el Tablero (${existingTaskList.length} tareas):**
${tasksSummary}
- **Miembros del Proyecto:** ${membersList}
- **Todos los Proyectos:**
${projectsSummary}

## Tu Personalidad:
- Hablás en español rioplatense o neutro, de forma amigable, inteligente y conversacional.
- Tenés creatividad ilimitada: generás tareas únicas, detalladas y profundas según lo que el usuario pida (NO generás respuestas genéricas ni repetitivas).
- Si el usuario te pide crear tareas sobre un tema particular (ej: autenticación, pasarela de pagos, base de datos, marketing, testing, etc.), creás tareas 100% enfocadas en esa temática.

## Control Total sobre la Plataforma (Acciones JSON):
Cuando el usuario te pida realizar cambios en el proyecto, DEBES incluir en tu respuesta un bloque de acciones en el array "actions".

Acciones disponibles:
1. **create_task**: Crear tareas en el tablero
   { "type": "create_task", "title": "Título claro", "description": "Descripción técnica detallada", "priority": "ALTA|MEDIA|URGENTE|BAJA", "estimatedHours": 6, "tags": ["Frontend", "API"] }
2. **delete_task**: Borrar tareas
   - Borrar todas: { "type": "delete_task", "deleteAll": true }
   - Borrar una: { "type": "delete_task", "taskId": "id_o_key_de_la_tarea" }
3. **update_task**: Modificar estado, prioridad o campos de una tarea
   { "type": "update_task", "taskId": "key_o_id", "updates": { "status": "FINALIZADA|EN_PROGRESO|EN_REVISION|PENDIENTE", "priority": "URGENTE" } }
4. **add_subtask**: Agregar subtarea / item de checklist
   { "type": "add_subtask", "taskId": "key_o_id", "title": "Texto de la subtarea" }
5. **log_time**: Registrar horas trabajadas
   { "type": "log_time", "taskId": "key_o_id", "hours": 3 }
6. **send_chat**: Enviar mensaje al chat del equipo
   { "type": "send_chat", "message": "Texto del mensaje para el equipo" }
7. **update_project**: Modificar nombre, descripción o clave del proyecto
   { "type": "update_project", "updates": { "name": "Nuevo Nombre", "description": "Nueva descripción", "key": "NUE" } }
8. **create_project**: Crear un nuevo proyecto
   { "type": "create_project", "name": "Nombre", "key": "CLA", "description": "Descripción", "color": "#7C3AED" }
9. **switch_project**: Cambiar de proyecto activo
   { "type": "switch_project", "projectId": "id_o_nombre" }

## Formato de Respuesta OBLIGATORIO:
Responde SIEMPRE en formato JSON estricto con esta estructura:
\`\`\`json
{
  "reply": "Tu respuesta en Markdown explicando lo que hiciste o conversando con el usuario...",
  "actions": [
    // Array con las acciones ejecutadas (vacío [] si solo estás conversando)
  ]
}
\`\`\`
IMPORTANTE:
- Responde ÚNICAMENTE el objeto JSON válido. Sin texto fuera del JSON.`;

    // Intentar Gemini API (utilizando la key provista por el usuario o en .env.local)
    const effectiveGeminiKey = apiKey || process.env.GEMINI_API_KEY;

    if (effectiveGeminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveGeminiKey}`,
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
                temperature: 0.8,
                maxOutputTokens: 4096,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            try {
              const parsed = JSON.parse(rawText);
              return NextResponse.json(parsed);
            } catch (pErr) {
              return NextResponse.json({ reply: rawText, actions: [] });
            }
          }
        } else {
          const errText = await geminiRes.text();
          console.warn('Gemini API returned error status:', geminiRes.status, errText);
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed:', geminiError);
      }
    }

    // =========================================================================
    // FALLBACK INTELIGENTE LOCAL (Si no hay key configurada o falla la red)
    // =========================================================================
    const lastUserPrompt = conversationMessages[conversationMessages.length - 1]?.content || '';
    const promptLower = lastUserPrompt.toLowerCase().trim();

    // 1. Saludo
    if (promptLower === 'hola' || promptLower.startsWith('hola ') || ['buenas', 'que tal', 'hey'].some((g) => promptLower === g)) {
      const firstName = currentUser?.name?.split(' ')[0] || 'Lucas';
      return NextResponse.json({
        reply: `¡Hola **${firstName}**! 👋 ¿Cómo estás? Estoy listo para ayudarte con **${projectName}**.\n\nPuedo crear tareas especializadas, modificar estados, registrar horas, auditar riesgos o conversar sobre cualquier aspecto del proyecto.\n\n*(Tip: Podés vincular tu propia Google Gemini API Key desde el botón ⚙️ en la barra superior para respuestas con IA en vivo).*`,
        actions: [],
      });
    }

    // 2. Borrar todas las tareas
    if (promptLower.includes('borra') || promptLower.includes('elimina') || promptLower.includes('limpia')) {
      if (promptLower.includes('tarea') || promptLower.includes('todo') || promptLower.includes('tablero')) {
        return NextResponse.json({
          reply: `🗑️ **Tablero limpiado.** He eliminado todas las tareas del proyecto **${projectName}**.`,
          actions: [{ type: 'delete_task', deleteAll: true }],
        });
      }
    }

    // 3. Crear tareas dinámicas contextuales
    const isTaskCreation =
      promptLower.includes('tarea') ||
      promptLower.includes('tareas') ||
      promptLower.includes('crear') ||
      promptLower.includes('creame') ||
      promptLower.includes('crea') ||
      promptLower.includes('agrega') ||
      promptLower.includes('generar');

    if (isTaskCreation) {
      // Extraer concepto específico del mensaje si el usuario pidió algo puntual (ej: "creame tareas para la pasarela de pagos")
      let topic = '';
      if (promptLower.includes('pago') || promptLower.includes('checkout') || promptLower.includes('tarjeta')) {
        topic = 'Pasarela de Pagos';
      } else if (promptLower.includes('auth') || promptLower.includes('login') || promptLower.includes('registro') || promptLower.includes('usuario')) {
        topic = 'Autenticación y Usuarios';
      } else if (promptLower.includes('backend') || promptLower.includes('api') || promptLower.includes('base de datos') || promptLower.includes('db')) {
        topic = 'Backend & Persistencia';
      } else if (promptLower.includes('frontend') || promptLower.includes('ui') || promptLower.includes('diseño')) {
        topic = 'Frontend & Interfaz';
      }

      let generatedTasks = [];

      if (topic === 'Pasarela de Pagos') {
        generatedTasks = [
          { title: 'Integración de Checkout con Stripe y MercadoPago', description: 'Configurar procesamiento seguro de tarjetas de crédito y débito con webhooks de confirmación.', priority: 'URGENTE' as const, estimatedHours: 8, tags: ['Pagos', 'Backend'] },
          { title: 'Generación automática de facturas y recibos en PDF', description: 'Plantilla de comprobante fiscal con descarga directa y envío por correo electrónico.', priority: 'ALTA' as const, estimatedHours: 6, tags: ['Facturación', 'PDF'] },
          { title: 'Soporte para cupones de descuento y promociones temporales', description: 'Validación de códigos promocionales, descuentos porcentuales y límites de uso.', priority: 'MEDIA' as const, estimatedHours: 5, tags: ['Marketing', 'Lógica'] },
        ];
      } else if (topic === 'Autenticación y Usuarios') {
        generatedTasks = [
          { title: 'Autenticación OAuth con Google y GitHub', description: 'Permitir inicio de sesión en un clic con proveedores sociales y vinculación de perfiles.', priority: 'URGENTE' as const, estimatedHours: 7, tags: ['Auth', 'Seguridad'] },
          { title: 'Flujo de recuperación de contraseña y verificación por email', description: 'Generación de tokens seguros de un solo uso con vencimiento en 15 minutos.', priority: 'ALTA' as const, estimatedHours: 5, tags: ['Auth', 'Email'] },
          { title: 'Perfil de usuario con edición de avatar y preferencias de notificación', description: 'Vista para actualizar biografía, cambio de clave y temas visuales.', priority: 'MEDIA' as const, estimatedHours: 4, tags: ['UI', 'Perfil'] },
        ];
      } else {
        const count = existingTaskList.length;
        const salt = count + 1;
        generatedTasks = [
          { title: `Desarrollo del módulo principal de ${projectName} (Módulo ${salt})`, description: `Implementar lógica de negocio, validaciones y vistas responsivas para ${projectName}.`, priority: 'ALTA' as const, estimatedHours: 6, tags: ['Core', 'Frontend'] },
          { title: `Optimización de consultas y sincronización reactiva en tiempo real`, description: `Configurar índices de base de datos y suscripciones WebSockets para actualización instantánea.`, priority: 'ALTA' as const, estimatedHours: 7, tags: ['Backend', 'Realtime'] },
          { title: `Pruebas de usabilidad y control de calidad (QA)`, description: `Verificación cruzada de navegadores, testing en dispositivos móviles y reporte de bugs.`, priority: 'MEDIA' as const, estimatedHours: 4, tags: ['QA', 'Testing'] },
        ];
      }

      const actions = generatedTasks.map((t) => ({
        type: 'create_task',
        title: t.title,
        description: t.description,
        priority: t.priority,
        estimatedHours: t.estimatedHours,
        tags: t.tags,
      }));

      const summary = generatedTasks.map((t, idx) => `${idx + 1}. **${t.title}** (${t.estimatedHours}h, Prioridad: \`${t.priority}\`)\n   *${t.description}*`).join('\n\n');

      return NextResponse.json({
        reply: `🚀 **¡He creado ${generatedTasks.length} tareas en tu tablero Kanban para "${projectName}"!**\n\n${summary}\n\nYa están disponibles en estado \`PENDIENTE\`.`,
        actions,
      });
    }

    return NextResponse.json({
      reply: `He recibido tu mensaje para **${projectName}**.\n\nActualmente el proyecto cuenta con **${existingTaskList.length} tareas**. Podés pedirme crear tareas temáticas, mover estados, registrar horas o auditar el proyecto.`,
      actions: [],
    });
  } catch (error: any) {
    console.error('Error in /api/ai:', error);
    return NextResponse.json({
      reply: 'Ocurrió un error al procesar la solicitud. Por favor intenta nuevamente.',
      actions: [],
    });
  }
}
