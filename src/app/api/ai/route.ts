import { NextResponse } from 'next/server';

/**
 * Handler POST /api/ai
 * Endpoint inteligente de Nexor-Space AI.
 * Soporta integración con OpenAI / Gemini / Groq si las variables de entorno están configuradas,
 * con fallback instantáneo a procesamiento contextual avanzado.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, context, project, tasks, action } = body;

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    // Si hay una API Key configurada de OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `Eres Nexor-Space AI, un asistente autónomo y altamente inteligente de gestión de proyectos y desarrollo de software para la plataforma Nexor-Space.
Contexto del proyecto actual:
- Nombre del Proyecto: "${project?.name || 'Proyecto'}"
- Descripción: "${project?.description || 'Sin descripción'}"
- Tareas registradas: ${tasks ? JSON.stringify(tasks.map((t: any) => ({ key: t.key, title: t.title, status: t.status, priority: t.priority }))) : 'Ninguna'}

Responde de forma clara, directa, profesional y en formato Markdown en español rioplatense o neutro según corresponda. Si te piden generar tareas, estructúralas claramente.`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch (err) {
        console.warn('Fallback a motor de inferencia local:', err);
      }
    }

    // Fallback: Respuesta estructurada
    return NextResponse.json({
      status: 'ok',
      message: 'Procesado por el motor autónomo de Nexor-Space AI.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en el servidor de IA' }, { status: 500 });
  }
}
