import { NextResponse } from 'next/server';

/**
 * Handler POST /api/ai
 * Nexor-Space AI - Motor Multi-LLM Autónomo (Gemini, OpenAI, Public LLM y Action Engine).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, prompt, context } = body;

    // Normalizar mensajes
    const conversationMessages = messages && Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: 'user', content: prompt || 'Hola' }];

    const { project, tasks, allProjects, currentUser, activePage, activeTab, taskViewMode } = context || {};

    const tasksList = tasks && Array.isArray(tasks) && tasks.length > 0
      ? tasks.map((t: any) => `- [${t.key || 'ID'}] "${t.title}" | Estado: ${t.status} | Prioridad: ${t.priority} | ${t.estimatedHours || 0}h estimadas`).join('\n')
      : '(Ninguna tarea registrada en este proyecto)';

    const projectsList = allProjects && Array.isArray(allProjects) && allProjects.length > 0
      ? allProjects.map((p: any) => `- "${p.name}" (Clave: ${p.key}) - ${p.description || 'Sin descripción'}`).join('\n')
      : '(Ningún proyecto registrado)';

    const systemPrompt = `Sos Nexor-Space AI, un asistente de inteligencia artificial avanzado, carismático, autónomo y con control total sobre la plataforma de proyectos Nexor-Space (como ChatGPT o Gemini).

## Tu Personalidad:
- Hablás en español rioplatense/latinoamericano fluido, amigable, inteligente y conversacional.
- Si el usuario dice "hola", "cómo estás", o hace una charla casual, respondés de forma natural y cálida, como un compañero de equipo genial, sin plantillas robóticas.
- Sos experto en desarrollo de software, diseño de producto, gestión ágil (Scrum/Kanban), arquitectura de sistemas y productividad.
- Tenés control total para ejecutar órdenes en la plataforma cuando el usuario te lo pida.

## Contexto Actual:
- **Usuario:** ${currentUser?.name || 'Lucas'} (${currentUser?.email || 'usuario@nexor.app'})
- **Página actual:** ${activePage || 'dashboard'} (${activeTab || 'tasks'} - ${taskViewMode || 'kanban'})
- **Proyecto Activo:** ${project ? `"${project.name}" (Clave: ${project.key}) — ${project.description || 'Sin descripción'}` : 'Ningún proyecto activo'}
- **Tareas Actuales en el Proyecto Activo (${tasks?.length || 0} tareas):**
${tasksList}
- **Todos los Proyectos Disponibles:**
${projectsList}

## Acciones que podés ejecutar (JSON):
Si el usuario te pide una acción concreta (crear tareas, borrar tareas, cambiar proyectos, renombrar, etc.), debes incluir en tu respuesta un bloque de acciones.

Responde SIEMPRE en formato JSON estricto con esta estructura:
\`\`\`json
{
  "reply": "Tu mensaje explicativo o respuesta conversacional en Markdown...",
  "actions": [
    // Array de acciones opcionales (vacío [] si es solo conversación):
    // 1. Crear tarea: { "type": "create_task", "title": "...", "description": "...", "priority": "ALTA", "estimatedHours": 5, "tags": ["Frontend"] }
    // 2. Borrar todas las tareas: { "type": "delete_task", "deleteAll": true }
    // 3. Borrar una tarea: { "type": "delete_task", "taskId": "key_o_id" }
    // 4. Cambiar estado: { "type": "update_task", "taskId": "key_o_id", "updates": { "status": "FINALIZADA" } }
    // 5. Crear proyecto: { "type": "create_project", "name": "...", "key": "...", "description": "..." }
    // 6. Cambiar de proyecto: { "type": "switch_project", "projectId": "nombre_o_id" }
    // 7. Actualizar proyecto: { "type": "update_project", "updates": { "name": "...", "description": "..." } }
    // 8. Sugerir tareas interactivas (para importar con 1 clic): { "type": "suggest_tasks", "tasks": [ { "title": "...", "description": "...", "priority": "ALTA", "estimatedHours": 6 } ] }
  ]
}
\`\`\`
IMPORTANTE:
- Si el usuario te pide crear tareas para un proyecto nuevo o existente, crea tareas ESPECÍFICAS y profundas según el dominio (Fitness, Viajes, E-commerce, Inmobiliaria, etc.), ¡NUNCA las mismas 4 genéricas!
- Si te piden "borrá todas las tareas" -> usa \`{"type": "delete_task", "deleteAll": true}\`.
- Si te dicen "hola" -> solo saluda amistosamente con \`"actions": []\`.
- Responde ÚNICAMENTE el JSON válido.`;

    const openAiFormatMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationMessages.map((m: any) => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content,
      })),
    ];

    // TIER 1: Google Gemini API (si hay GEMINI_API_KEY)
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
          const rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json(parsed);
          }
        }
      } catch (gErr) {
        console.warn('Gemini API call failed, falling back to public LLM:', gErr);
      }
    }

    // TIER 2: OpenAI API (si hay OPENAI_API_KEY)
    if (process.env.OPENAI_API_KEY) {
      try {
        const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: openAiFormatMessages,
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (oaiRes.ok) {
          const oData = await oaiRes.json();
          const raw = oData?.choices?.[0]?.message?.content;
          if (raw) {
            return NextResponse.json(JSON.parse(raw));
          }
        }
      } catch (oErr) {
        console.warn('OpenAI API call failed, falling back to public LLM:', oErr);
      }
    }

    // TIER 3: Free Public High-Speed LLM (Pollinations AI GPT-4o / Qwen) - NO API KEY NEEDED
    try {
      const publicRes = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: openAiFormatMessages,
          jsonMode: true,
          temperature: 0.7,
        }),
      });

      if (publicRes.ok) {
        const pData = await publicRes.json();
        const contentStr = pData?.choices?.[0]?.message?.content;
        if (contentStr) {
          try {
            const jsonStart = contentStr.indexOf('{');
            const jsonEnd = contentStr.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const cleanJson = JSON.parse(contentStr.substring(jsonStart, jsonEnd + 1));
              return NextResponse.json(cleanJson);
            }
          } catch (e) {
            return NextResponse.json({ reply: contentStr, actions: [] });
          }
        }
      }
    } catch (pubErr) {
      console.warn('Public LLM failed, using intelligent autonomous fallback:', pubErr);
    }

    // TIER 4: Motor de fallback local inteligente y natural
    const lastUserPrompt = conversationMessages[conversationMessages.length - 1]?.content?.toLowerCase() || '';

    // Saludo
    if (['hola', 'buenas', 'buen dia', 'que tal', 'hey', 'como andas'].some((g) => lastUserPrompt.includes(g))) {
      const userFirstName = currentUser?.name?.split(' ')[0] || 'Lucas';
      return NextResponse.json({
        reply: `¡Hola **${userFirstName}**! 👋 ¿Cómo estás? Todo listo para ayudarte con **${project?.name || 'tus proyectos'}**.\n\n¿En qué te puedo dar una mano hoy? Podés pedirme crear tareas, auditar el proyecto, armar un changelog o lo que necesites.`,
        actions: [],
      });
    }

    // Borrado de tareas
    if (lastUserPrompt.includes('borra') || lastUserPrompt.includes('elimina') || lastUserPrompt.includes('limpia')) {
      if (lastUserPrompt.includes('todas') || lastUserPrompt.includes('todo')) {
        return NextResponse.json({
          reply: `🗑️ ¡Listo! He eliminado todas las tareas del proyecto **${project?.name || 'activo'}**. El tablero quedó limpio.`,
          actions: [{ type: 'delete_task', deleteAll: true }],
        });
      }
    }

    return NextResponse.json({
      reply: `Entendido. Estoy procesando tu solicitud para **${project?.name || 'tu espacio'}**. ¿Querés que agregue tareas especializadas o ejecute algún cambio en el tablero?`,
      actions: [],
    });
  } catch (error: any) {
    console.error('Error in /api/ai:', error);
    return NextResponse.json({
      reply: 'Tuve un pequeño problema de conexión, pero ya estoy listo de nuevo. ¿Qué necesitabas hacer?',
      actions: [],
    });
  }
}
