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
 * Valida un token de invitación y retorna los detalles del proyecto y rol.
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

    if (!invitation) {
      return NextResponse.json(
        { valid: false, error: 'La invitación no existe o el enlace es inválido.' },
        { status: 404 }
      );
    }

    if (invitation.isAccepted) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Esta invitación ya fue utilizada anteriormente.',
          invitation: {
            email: invitation.email,
            role: invitation.role,
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
          error: 'La invitación ha expirado. Solicitá al equipo que te envíe un nuevo enlace.',
          invitation: {
            email: invitation.email,
            role: invitation.role,
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
 * Acepta la invitación por token y vincula al usuario al proyecto con su rol correspondiente.
 *
 * Body: { userId, email, userName }
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { userId, email, userName } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token no especificado' }, { status: 400 });
    }

    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { project: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
    }

    if (invitation.isAccepted) {
      return NextResponse.json(
        { error: 'Esta invitación ya fue aceptada previamente' },
        { status: 400 }
      );
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Esta invitación ha expirado' },
        { status: 400 }
      );
    }

    const targetEmail = (email || invitation.email).toLowerCase().trim();

    // 1. Obtener o crear usuario en Prisma
    let targetUser: any = null;
    if (userId) {
      targetUser = await db.user.findUnique({ where: { id: userId } });
    }
    if (!targetUser && targetEmail) {
      targetUser = await db.user.findUnique({ where: { email: targetEmail } });
    }
    if (!targetUser) {
      targetUser = await db.user.create({
        data: {
          id: userId || undefined,
          email: targetEmail,
          name: userName || targetEmail.split('@')[0],
          password: '',
          role: invitation.role,
        },
      });
    }

    // 2. Vincular como ProjectMember en Prisma
    await db.projectMember.upsert({
      where: {
        projectId_userId: {
          projectId: invitation.projectId,
          userId: targetUser.id,
        },
      },
      update: {
        role: invitation.role,
      },
      create: {
        projectId: invitation.projectId,
        userId: targetUser.id,
        role: invitation.role,
      },
    });

    // 3. Vincular en Supabase si está disponible
    if (isSupabaseConfigured) {
      try {
        const { data: supaUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', targetEmail)
          .maybeSingle();

        if (supaUser?.id) {
          await supabase.from('proyecto_miembros').upsert({
            proyecto_id: invitation.projectId,
            usuario_id: supaUser.id,
            rol: invitation.role,
            fecha_union: new Date().toISOString(),
          });
        }
      } catch (supaErr) {
        console.warn('Error asociando miembro en Supabase:', supaErr);
      }
    }

    // 4. Marcar invitación como aceptada
    await db.invitation.update({
      where: { token },
      data: { isAccepted: true },
    });

    // 5. Registrar notificación y auditoría
    try {
      await db.notification.create({
        data: {
          userId: targetUser.id,
          title: '¡Te uniste al proyecto!',
          message: `Ya sos parte del proyecto "${invitation.project.name}" como ${ROLE_LABELS[invitation.role] || invitation.role}.`,
          type: 'INFO',
          linkUrl: '/dashboard',
        },
      });

      await db.activityLog.create({
        data: {
          projectId: invitation.projectId,
          userId: targetUser.id,
          action: 'JOIN_PROJECT',
          entityType: 'MEMBER',
          entityId: targetUser.id,
          details: `El usuario ${targetUser.name} (${targetEmail}) se unió mediante invitación con rol ${invitation.role}`,
        },
      });
    } catch (auditErr) {
      console.warn('Error registrando auditoría:', auditErr);
    }

    return NextResponse.json({
      success: true,
      projectId: invitation.projectId,
      projectName: invitation.project.name,
      role: invitation.role,
      message: 'Invitación aceptada con éxito',
    });
  } catch (error: any) {
    console.error('Error al aceptar invitación:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al procesar la aceptación' },
      { status: 500 }
    );
  }
}
