import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Handler GET /api/projects
 * Retorna la lista de todos los proyectos registrados con sus miembros y tareas.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    const whereClause: any = {};
    if (id) {
      whereClause.id = id;
    } else if (userId || email) {
      whereClause.members = {
        some: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(email ? [{ user: { email: email.toLowerCase().trim() } }] : []),
          ],
        },
      };
    }

    const projects = await db.project.findMany({
      where: whereClause,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                createdAt: true,
              },
            },
          },
        },
        tasks: {
          include: {
            subtasks: true,
            comments: {
              include: { author: true },
            },
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
 * Crea un nuevo proyecto en la base de datos con su clave única y asigna el miembro creador.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, key, description, color, icon, creatorId, creatorEmail, creatorName } = body;

    if (!name || !key) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Verificar si ya existe un proyecto con esa clave
    const existing = await db.project.findUnique({
      where: { key: key.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Ya existe un proyecto con esa clave' }, { status: 409 });
    }

    // Asegurar que el usuario creador exista en la base de datos si se provee
    let validCreatorId = creatorId;
    const cleanEmail = creatorEmail ? String(creatorEmail).toLowerCase().trim() : '';
    const cleanName = creatorName ? String(creatorName).trim() : '';

    if (validCreatorId) {
      let userExists = await db.user.findUnique({ where: { id: validCreatorId } });
      if (!userExists && cleanEmail) {
        userExists = await db.user.findUnique({ where: { email: cleanEmail } });
        if (userExists) {
          validCreatorId = userExists.id;
        }
      }

      if (!userExists) {
        // Crear usuario con datos reales del creador
        const createdUser = await db.user.create({
          data: {
            id: validCreatorId,
            email: cleanEmail || `${validCreatorId}@nexor-space.app`,
            name: cleanName || 'Usuario Nexor-Space',
            password: 'demo_password',
            role: 'ADMIN',
          },
        });
        validCreatorId = createdUser.id;
      } else if (cleanName && (userExists.name.startsWith('Usuario ') || userExists.name === userExists.email.split('@')[0])) {
        await db.user.update({
          where: { id: userExists.id },
          data: {
            name: cleanName,
            ...(cleanEmail && userExists.email.endsWith('@nexor-space.app') ? { email: cleanEmail } : {}),
          },
        });
      }
    } else if (cleanEmail) {
      let userByEmail = await db.user.findUnique({ where: { email: cleanEmail } });
      if (!userByEmail) {
        userByEmail = await db.user.create({
          data: {
            email: cleanEmail,
            name: cleanName || cleanEmail.split('@')[0],
            password: 'demo_password',
            role: 'ADMIN',
          },
        });
      }
      validCreatorId = userByEmail.id;
    } else {
      const firstUser = await db.user.findFirst();
      if (firstUser) {
        validCreatorId = firstUser.id;
      }
    }

    const project = await db.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description: description || '',
        color: color || '#7C3AED',
        icon: icon || 'FolderKanban',
        members: validCreatorId
          ? {
              create: [
                {
                  userId: validCreatorId,
                  role: 'ADMIN',
                },
              ],
            }
          : undefined,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: { tasks: true, messages: true, attachments: true },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear proyecto' }, { status: 500 });
  }
}

/**
 * Handler PATCH /api/projects
 * Actualiza los datos de un proyecto.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, color, icon, isArchived } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID del proyecto es obligatorio' }, { status: 400 });
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(icon && { icon }),
        ...(isArchived !== undefined && { isArchived }),
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar el proyecto' }, { status: 500 });
  }
}

/**
 * Handler DELETE /api/projects
 * Elimina un proyecto y todas sus relaciones en cascada.
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'El parámetro id es requerido' }, { status: 400 });
    }

    await db.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Proyecto eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar el proyecto' }, { status: 500 });
  }
}
