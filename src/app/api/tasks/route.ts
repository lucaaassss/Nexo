import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Handler GET /api/tasks
 * Consulta tareas de un proyecto específico.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'El parámetro projectId es requerido' }, { status: 400 });
    }

    const tasks = await db.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
        creator: true,
        subtasks: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener tareas' }, { status: 500 });
  }
}

/**
 * Handler POST /api/tasks
 * Crea una nueva tarea asignando clave secuencial.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, priority, status, projectId, creatorId, assigneeId, dueDate, estimatedHours, tags } = body;

    if (!title || !projectId || !creatorId) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const count = await db.task.count({ where: { projectId } });
    const taskKey = `${project.key}-${count + 1}`;

    const task = await db.task.create({
      data: {
        key: taskKey,
        title,
        description,
        priority: priority || 'MEDIA',
        status: status || 'PENDIENTE',
        projectId,
        creatorId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours || 0,
        tags: tags ? JSON.stringify(tags) : '[]',
        position: count + 1,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear la tarea' }, { status: 500 });
  }
}
