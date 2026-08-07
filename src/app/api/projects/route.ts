import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Handler GET /api/projects
 * Retorna la lista de todos los proyectos registrados con sus miembros y tareas.
 */
export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: { tasks: true, messages: true, attachments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener proyectos' }, { status: 500 });
  }
}

/**
 * Handler POST /api/projects
 * Crea un nuevo proyecto en la base de datos con su clave única.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, key, description, color, creatorId } = body;

    if (!name || !key) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description,
        color: color || '#7C3AED',
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear proyecto' }, { status: 500 });
  }
}
