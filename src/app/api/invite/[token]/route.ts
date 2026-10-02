import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  LEADER: 'Líder',
  MEMBER: 'Miembro',
  GUEST: 'Invitado',
};

interface RouteContext {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/invite/[token]
 * Valida un token de invitación y retorna los detalles del proyecto y rol asignado.
 */
export async function GET(req: Request, context: RouteContext) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token de invitación no provisto' },
        { status: 400 }
      );
    }

    // 1. Buscar la invitación por token en Prisma
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            description: true,
            color: true,
            icon: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    role: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (invitation) {
      if (invitation.isAccepted) {
        return NextResponse.json(
          {
            valid: false,
            isAccepted: true,
            error: 'Esta invitación ya fue utilizada anteriormente.',
            invitation: {
              email: invitation.email,
              role: invitation.role,
              roleLabel: ROLE_LABELS[invitation.role] || invitation.role,
              isAccepted: true,
              project: invitation.project,
            },
          },
          { status: 410 }
        );
      }

      const now = new Date();
      if (new Date(invitation.expiresAt) < now) {
        return NextResponse.json(
          {
            valid: false,
            isExpired: true,
            error: 'La invitación ha expirado. Solicitá al equipo que te envíe un nuevo enlace.',
            invitation: {
              email: invitation.email,
              role: invitation.role,
              roleLabel: ROLE_LABELS[invitation.role] || invitation.role,
              expiresAt: invitation.expiresAt,
              project: invitation.project,
            },
          },
          { status: 410 }
        );
      }

      let resolvedInviter = invitation.inviterName;
      if (!resolvedInviter && invitation.project?.members) {
        const adminMember = invitation.project.members.find((m: any) => m.role === 'ADMIN');
        resolvedInviter = adminMember?.user?.name || adminMember?.user?.email || 'Un integrante del equipo';
      }

      return NextResponse.json({
        valid: true,
        invitation: {
          id: invitation.id,
          token: invitation.token,
          email: invitation.email,
          role: invitation.role,
          roleLabel: ROLE_LABELS[invitation.role] || invitation.role,
          inviterName: resolvedInviter || 'Un miembro del equipo',
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
          project: invitation.project,
        },
      });
    }

    // 2. Si no es un token de invitación, verificar si es un enlace directo por ID de proyecto
    const matchedProject = await db.project.findUnique({
      where: { id: token },
      select: {
        id: true,
        name: true,
        key: true,
        description: true,
        color: true,
        icon: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (matchedProject) {
      const adminMember = matchedProject.members?.find((m: any) => m.role === 'ADMIN');
      const inviter = adminMember?.user?.name || 'Equipo de Nexor-Space';

      return NextResponse.json({
        valid: true,
        invitation: {
          id: `direct-${token}`,
          token: token,
          email: '',
          role: 'MEMBER',
          roleLabel: 'Miembro',
          inviterName: inviter,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          project: matchedProject,
        },
      });
    }

    // 3. Token no encontrado y no es ID de proyecto válido
    return NextResponse.json(
      {
        valid: false,
        error: 'El enlace de invitación no es válido o ha sido cancelado.',
      },
      { status: 404 }
    );

  } catch (error: any) {
    console.error('Error validando token de invitación:', error);
    return NextResponse.json(
      { valid: false, error: 'Error interno al verificar la invitación' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invite/[token]
 * Acepta la invitación y vincula al usuario al proyecto con el rol EXACTO asignado por el admin.
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { userId, email, userName } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token no especificado' }, { status: 400 });
    }

    // 1. Buscar invitación
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { project: true },
    });

    let projectId = '';
    let role = 'MEMBER';
    let projectName = 'Proyecto Nexor-Space';

    if (invitation) {
      if (invitation.isAccepted) {
        return NextResponse.json(
          { error: 'Esta invitación ya fue utilizada anteriormente.' },
          { status: 410 }
        );
      }

      if (new Date(invitation.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'La invitación ha expirado. Solicitá un nuevo enlace.' },
          { status: 410 }
        );
      }

      projectId = invitation.projectId;
      role = invitation.role;
      projectName = invitation.project?.name || projectName;
    } else {
      // Verificar si es un enlace directo por ID de proyecto
      const directProject = await db.project.findUnique({ where: { id: token } });
      if (!directProject) {
        return NextResponse.json(
          { error: 'Invitación o proyecto no encontrado.' },
          { status: 404 }
        );
      }
      projectId = directProject.id;
      role = 'MEMBER';
      projectName = directProject.name;
    }

    const targetEmail = (email || invitation?.email || '').toLowerCase().trim();
    if (!targetEmail) {
      return NextResponse.json(
        { error: 'Debe especificar el correo del usuario que acepta la invitación.' },
        { status: 400 }
      );
    }

    // 2. Buscar o crear el usuario en Prisma
    let targetUser = userId ? await db.user.findUnique({ where: { id: userId } }) : null;
    if (!targetUser) {
      targetUser = await db.user.findUnique({ where: { email: targetEmail } });
    }

    if (!targetUser) {
      targetUser = await db.user.create({
        data: {
          id: userId || undefined,
          email: targetEmail,
          name: userName || targetEmail.split('@')[0],
          password: 'auth_session_user',
          role: role,
        },
      });
    } else if (userName && (targetUser.name === targetEmail.split('@')[0] || targetUser.name.startsWith('Usuario '))) {
      targetUser = await db.user.update({
        where: { id: targetUser.id },
        data: { name: userName },
      });
    }

    // 3. Vincular al usuario como miembro del proyecto con el rol asignado
    await db.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: targetUser.id,
        },
      },
      update: { role: role },
      create: {
        projectId: projectId,
        userId: targetUser.id,
        role: role,
      },
    });

    // 4. Marcar invitación como aceptada (un solo uso)
    if (invitation) {
      await db.invitation.update({
        where: { token },
        data: { isAccepted: true },
      });
    }

    // 5. Crear notificación para el nuevo miembro y notificar a los admins del proyecto
    const roleLabel = ROLE_LABELS[role] || role;
    try {
      await db.notification.create({
        data: {
          userId: targetUser.id,
          title: '¡Bienvenido al proyecto!',
          message: `Te uniste al proyecto "${projectName}" como ${roleLabel}.`,
          type: 'INVITE',
          linkUrl: '/dashboard',
        },
      });

      await db.activityLog.create({
        data: {
          projectId,
          userId: targetUser.id,
          action: 'JOIN_PROJECT',
          entityType: 'MEMBER',
          entityId: targetUser.id,
          details: `${targetUser.name} (${targetUser.email}) se unió al equipo como ${roleLabel}.`,
        },
      });

      // Notificar a los administradores del proyecto que el nuevo miembro se unió
      const projectAdmins = await db.projectMember.findMany({
        where: {
          projectId,
          role: 'ADMIN',
          userId: { not: targetUser.id },
        },
      });

      for (const admin of projectAdmins) {
        await db.notification.create({
          data: {
            userId: admin.userId,
            title: '¡Nuevo integrante en el equipo!',
            message: `${targetUser.name} (${targetUser.email}) aceptó tu invitación y se sumó al proyecto "${projectName}".`,
            type: 'INVITE',
            linkUrl: '/dashboard',
          },
        });
      }
    } catch (logErr) {
      console.warn('Advertencia registrando actividad/notificación:', logErr);
    }

    // 6. Sincronizar en Supabase si está disponible
    if (isSupabaseConfigured) {
      try {
        let supaUserId = userId;
        const { data: supaUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', targetEmail)
          .maybeSingle();

        if (supaUser?.id) {
          supaUserId = supaUser.id;
        } else if (!supaUserId) {
          const { data: newUser } = await supabase
            .from('usuarios')
            .upsert({
              email: targetEmail,
              nombre: userName || targetEmail.split('@')[0],
              estado: 'activo',
            })
            .select('id')
            .maybeSingle();
          if (newUser?.id) supaUserId = newUser.id;
        }

        if (supaUserId) {
          await supabase.from('proyecto_miembros').upsert({
            proyecto_id: projectId,
            usuario_id: supaUserId,
            rol: role,
            fecha_union: new Date().toISOString(),
          });

          // Notificación en Supabase para el creador del proyecto
          const { data: projectRow } = await supabase
            .from('proyectos')
            .select('creador_id')
            .eq('id', projectId)
            .maybeSingle();

          if (projectRow?.creador_id && projectRow.creador_id !== supaUserId) {
            await supabase.from('notificaciones').insert({
              usuario_id: projectRow.creador_id,
              titulo: '¡Nuevo integrante en el equipo!',
              descripcion: `${targetUser.name} (${targetEmail}) aceptó tu invitación al proyecto "${projectName}".`,
              tipo: 'INVITE',
              leida: false,
              fecha: new Date().toISOString(),
            });
          }
        }
      } catch (supaErr) {
        console.warn('Error sincronizando con Supabase:', supaErr);
      }
    }

    // 7. Retornar el proyecto completo actualizado con todos sus miembros para sincronización inmediata
    const updatedProject = await db.project.findUnique({
      where: { id: projectId },
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
      },
    });

    return NextResponse.json({
      success: true,
      projectId: projectId,
      projectName: projectName,
      role: role,
      userId: targetUser.id,
      userEmail: targetUser.email,
      userName: targetUser.name,
      project: updatedProject,
      message: `Te uniste a "${projectName}" con rol de ${roleLabel}.`,
    });
  } catch (error: any) {
    console.error('Error al procesar aceptación de invitación:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al procesar la aceptación' },
      { status: 500 }
    );
  }
}
