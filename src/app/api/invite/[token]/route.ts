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

      return NextResponse.json({
        valid: true,
        invitation: {
          id: invitation.id,
          token: invitation.token,
          email: invitation.email,
          role: invitation.role,
          roleLabel: ROLE_LABELS[invitation.role] || invitation.role,
          inviterName: invitation.inviterName || 'Un miembro del equipo',
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
          project: invitation.project,
        },
      });
    }

    // 2. Si no es un token de invitación, verificar si es un enlace directo por ID de proyecto
    const matchedProject = await db.project.findUnique({
      where: { id: token },
      select: { id: true, name: true, key: true, description: true, color: true, icon: true },
    });

    if (matchedProject) {
      return NextResponse.json({
        valid: true,
        invitation: {
          id: `direct-${token}`,
          token: token,
          email: '',
          role: 'MEMBER',
          roleLabel: 'Miembro',
          inviterName: 'Equipo de Nexor-Space',
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
    let invitation = await db.invitation.findUnique({
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

    // 5. Crear notificación y log de actividad
    try {
      const roleLabel = ROLE_LABELS[role] || role;
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
    } catch (logErr) {
      console.warn('Advertencia registrando actividad/notificación:', logErr);
    }

    // 6. Sincronizar en Supabase si está disponible
    if (isSupabaseConfigured) {
      try {
        const { data: supaUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', targetEmail)
          .maybeSingle();

        if (supaUser?.id) {
          await supabase.from('proyecto_miembros').upsert({
            proyecto_id: projectId,
            usuario_id: supaUser.id,
            rol: role,
            fecha_union: new Date().toISOString(),
          });
        }
      } catch (supaErr) {
        console.warn('Error sincronizando con Supabase:', supaErr);
      }
    }

    return NextResponse.json({
      success: true,
      projectId: projectId,
      projectName: projectName,
      role: role,
      userId: targetUser.id,
      userEmail: targetUser.email,
      userName: targetUser.name,
      message: `Te uniste a "${projectName}" con rol de ${ROLE_LABELS[role] || role}.`,
    });
  } catch (error: any) {
    console.error('Error al procesar aceptación de invitación:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al procesar la aceptación' },
      { status: 500 }
    );
  }
}
