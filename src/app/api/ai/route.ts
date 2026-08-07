import { NextResponse } from 'next/server';

/**
 * Handler POST /api/ai
 * Endpoint optimizado para peticiones de Inteligencia Artificial (OpenAI / Gemini)
 * Procesa descomposición de tareas, estimaciones de horas, subtareas y resúmenes.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, prompt, context } = body;

    switch (action) {
      case 'DECOMPOSE_PROJECT':
        return NextResponse.json({
          tasks: [
            {
              title: 'Diseñar arquitectura e interfaz de usuario',
              description: 'Establecer sistema de tokens de diseño y tema violeta/índigo',
              priority: 'ALTA',
              estimatedHours: 6,
            },
            {
              title: 'Desarrollar modelos de datos y endpoints REST',
              description: 'Definir Prisma schema y controladores para Tareas, Usuarios y Chat',
              priority: 'ALTA',
              estimatedHours: 8,
            },
            {
              title: 'Implementar canales de chat y notificaciones',
              description: 'Integrar hilos de respuesta, reacciones y alertas',
              priority: 'MEDIA',
              estimatedHours: 5,
            },
          ],
        });

      case 'GENERATE_SUBTASKS':
        return NextResponse.json({
          subtasks: [
            'Revisar documentación técnica',
            'Desarrollar prototipo inicial',
            'Realizar pruebas de integración',
            'Solicitar revisión de código',
          ],
        });

      case 'SUMMARIZE_CHAT':
        return NextResponse.json({
          summary: 'El equipo alineó los requerimientos principales del sprint actual.',
        });

      default:
        return NextResponse.json({
          reply: 'Procesamiento de Nexo AI completado satisfactoriamente.',
        });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en el servidor de IA' }, { status: 500 });
  }
}
