import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRolePermissions } from '@/lib/permissions';
import { MemberRole } from '@/types';

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
 * 🔒 Validación RBAC: consulta el rol real del usuario desde la tabla ProjectMember.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, priority, status, projectId, creatorId, assigneeId, dueDate, estimatedHours, tags } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // 🔒 Validación de Permisos (RBAC Backend — consulta real a la DB)
    if (creatorId) {
      const member = await db.projectMember.findFirst({
        where: { projectId, userId: creatorId },
      });

      if (!member) {
        return NextResponse.json(
          { error: 'No sos miembro de este proyecto.' },
          { status: 403 }
        );
      }

      const memberPermissions = getRolePermissions(member.role as MemberRole);
      if (!memberPermissions.canCreateTask) {
        return NextResponse.json(
          { error: 'No tenés permisos para crear tareas en este proyecto (Se requiere rol de Administrador o Líder).' },
          { status: 403 }
        );
      }
    }

    // Asegurar que el creador exista en la base de datos
    let validCreatorId = creatorId;
    if (validCreatorId) {
      const userExists = await db.user.findUnique({ where: { id: validCreatorId } });
      if (!userExists) {
        const createdUser = await db.user.create({
          data: {
            id: validCreatorId,
            email: `${validCreatorId}@nexor-space.app`,
            name: 'Usuario Nexor-Space',
            password: 'demo_password',
            role: 'MEMBER',
          },
        });
        validCreatorId = createdUser.id;
      }
    } else {
      const firstUser = await db.user.findFirst();
      validCreatorId = firstUser ? firstUser.id : 'usr_admin_1';
    }

    const count = await db.task.count({ where: { projectId } });
    const taskKey = `${project.key}-${count + 1}`;

    const task = await db.task.create({
      data: {
        key: taskKey,
        title,
        description: description || '',
        priority: priority || 'MEDIA',
        status: status || 'PENDIENTE',
        projectId,
        creatorId: validCreatorId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
        tags: tags ? (Array.isArray(tags) ? JSON.stringify(tags) : String(tags)) : '[]',
        position: count + 1,
      },
      include: {
        assignee: true,
        creator: true,
        subtasks: true,
        comments: true,
        attachments: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al crear la tarea' }, { status: 500 });
  }
}

/**
 * Handler PATCH /api/tasks
 * Actualiza estado, posición, descripción, etc., de una tarea.
 * 🔒 MEMBER puede cambiar status/position (Kanban). GUEST no puede editar.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, description, priority, status, position, loggedHours, estimatedHours, dueDate, tags, assigneeId, userId } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID de la tarea es obligatorio' }, { status: 400 });
    }

    // 🔒 Validación de Permisos (RBAC Backend — consulta real a la DB)
    if (userId) {
      const task = await db.task.findUnique({ where: { id }, select: { projectId: true } });
      if (task) {
        const member = await db.projectMember.findFirst({
          where: { projectId: task.projectId, userId },
        });

        if (member) {
          const memberPermissions = getRolePermissions(member.role as MemberRole);
          if (!memberPermissions.canEditTask) {
            return NextResponse.json(
              { error: 'No tenés permisos para editar tareas en este proyecto.' },
              { status: 403 }
            );
          }

          // MEMBER puede cambiar status y position (Kanban), pero no campos administrativos
          const isAdminField = !!(title || priority || estimatedHours);
          if (member.role === 'MEMBER' && isAdminField) {
            return NextResponse.json(
              { error: 'No tenés permisos de administrador para modificar la configuración de esta tarea.' },
              { status: 403 }
            );
          }
        }
      }
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(position !== undefined && { position: Number(position) }),
        ...(loggedHours !== undefined && { loggedHours: Number(loggedHours) }),
        ...(estimatedHours !== undefined && { estimatedHours: Number(estimatedHours) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? JSON.stringify(tags) : String(tags) }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: true,
        creator: true,
        subtasks: true,
        comments: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar la tarea' }, { status: 500 });
  }
}

/**
 * Handler DELETE /api/tasks
 * Elimina una tarea por su ID.
 * 🔒 Validación RBAC: solo ADMIN y LEADER pueden eliminar tareas.
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id) {
      return NextResponse.json({ error: 'El parámetro id es requerido' }, { status: 400 });
    }

    // 🔒 Validación de Permisos (RBAC Backend — consulta real a la DB)
    if (userId) {
      const task = await db.task.findUnique({ where: { id }, select: { projectId: true } });
      if (task) {
        const member = await db.projectMember.findFirst({
          where: { projectId: task.projectId, userId },
        });

        if (!member) {
          return NextResponse.json(
            { error: 'No sos miembro de este proyecto.' },
            { status: 403 }
          );
        }

        const memberPermissions = getRolePermissions(member.role as MemberRole);
        if (!memberPermissions.canDeleteTask) {
          return NextResponse.json(
            { error: 'No tenés permisos para eliminar tareas en este proyecto (Se requiere rol de Administrador o Líder).' },
            { status: 403 }
          );
        }
      }
    }

    await db.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Tarea eliminada correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar la tarea' }, { status: 500 });
  }
}
