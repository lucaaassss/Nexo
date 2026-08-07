import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Handler GET /api/chat
 * Obtiene el historial de mensajes de chat de un proyecto.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'El parámetro projectId es requerido' }, { status: 400 });
    }

    const messages = await db.chatMessage.findMany({
      where: { projectId },
      include: {
        sender: true,
        reactions: { include: { user: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en el chat' }, { status: 500 });
  }
}

/**
 * Handler POST /api/chat
 * Registra un nuevo mensaje en el canal del proyecto.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, senderId, content, parentId } = body;

    if (!projectId || !senderId || !content) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const message = await db.chatMessage.create({
      data: {
        projectId,
        senderId,
        content,
        parentId: parentId || null,
      },
      include: {
        sender: true,
        reactions: true,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al enviar mensaje' }, { status: 500 });
  }
}
