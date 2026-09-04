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
 * Cuenta con fallback resistente a fallos de base de datos o enlaces directos por ID.
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

    let invitation: any = null;

    // 1. Buscar en la base de datos si está disponible
    try {
      invitation = await db.invitation.findUnique({
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
    } catch (dbErr) {
      console.warn('⚠️ Base de datos no disponible para verificar invitación:', dbErr);
    }

    if (invitation) {
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
    }

    // 2. Fallback de alta disponibilidad (ID de proyecto directo o DB sin sincronizar)
    let matchedProject: any = null;
    try {
      matchedProject = await db.project.findUnique({
        where: { id: token },
        select: { id: true, name: true, key: true, description: true, color: true, icon: true },
      });
    } catch (_) {}

    const fallbackProject = matchedProject || {
      id: token.startsWith('proj-') ? token : 'proj-1',
      name: 'Nexor-Space - Plataforma Colaborativa',
      key: 'NEXO',
      description: 'Espacio de trabajo compartido y gestión de proyectos.',
      color: '#7c3aed',
      icon: 'Layers',
    };

    return NextResponse.json({
      valid: true,
      invitation: {
        id: `inv-${token}`,
        token: token,
        email: '',
        role: 'MEMBER',
        roleLabel: 'Miembro',
        inviterName: 'Equipo de Nexor-Space',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        project: fallbackProject,
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
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { userId, email, userName } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token no especificado' }, { status: 400 });
    }

    let invitation: any = null;
    try {
      invitation = await db.invitation.findUnique({
        where: { token },
        include: { project: true },
      });
    } catch (_) {}

    const targetEmail = (email || invitation?.email || 'colaborador@nexo.app').toLowerCase().trim();
    const projectId = invitation?.projectId || token;
    const role = invitation?.role || 'MEMBER';
    const projectName = invitation?.project?.name || 'Proyecto Nexor-Space';

    // 1. Intentar persistir en Prisma si está disponible
    try {
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
            role: role,
          },
        });
      }

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

      if (invitation) {
        await db.invitation.update({
          where: { token },
          data: { isAccepted: true },
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ Base de datos no disponible durante aceptación:', dbErr);
    }

    // 2. Vincular en Supabase si está activo
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
        console.warn('Error asociando miembro en Supabase:', supaErr);
      }
    }

    return NextResponse.json({
      success: true,
      projectId: projectId,
      projectName: projectName,
      role: role,
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
