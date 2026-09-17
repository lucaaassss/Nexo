import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  LEADER: 'Líder',
  MEMBER: 'Miembro',
  GUEST: 'Invitado',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: 'Acceso total y configuración del proyecto.',
  LEADER: 'Gestión de tareas, prioridades y equipo.',
  MEMBER: 'Crear, actualizar y comentar tareas asignadas.',
  GUEST: 'Solo lectura de tareas y participación en chat.',
};

/**
 * GET /api/invite?projectId=...
 * Obtiene las invitaciones del proyecto (activas, pendientes y aceptadas).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'El parámetro projectId es obligatorio' },
        { status: 400 }
      );
    }

    const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protoHeader = req.headers.get('x-forwarded-proto') || 'https';
    const origin = req.headers.get('origin');
    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      origin ||
      (hostHeader ? `${protoHeader}://${hostHeader}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
    const cleanAppUrl = appBaseUrl.replace(/\/$/, '');

    const invitations = await db.invitation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: { id: true, name: true, key: true, color: true },
        },
      },
    });

    const now = new Date();
    const formatted = invitations.map((inv) => ({
      id: inv.id,
      token: inv.token,
      email: inv.email,
      role: inv.role,
      roleLabel: ROLE_LABELS[inv.role] || inv.role,
      inviterName: inv.inviterName,
      isAccepted: inv.isAccepted,
      expiresAt: inv.expiresAt.toISOString(),
      isExpired: !inv.isAccepted && new Date(inv.expiresAt) < now,
      createdAt: inv.createdAt.toISOString(),
      inviteLink: `${cleanAppUrl}/invite/${inv.token}`,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error al obtener invitaciones:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener invitaciones' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invite?id=...
 * Cancela/elimina una invitación pendiente por su ID.
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { error: 'El parámetro id de la invitación es obligatorio' },
        { status: 400 }
      );
    }

    const existing = await db.invitation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      );
    }

    await db.invitation.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Invitación cancelada correctamente',
    });
  } catch (error: any) {
    console.error('Error al cancelar invitación:', error);
    return NextResponse.json(
      { error: error.message || 'Error al cancelar la invitación' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invite
 * Genera o renueva una invitación de 7 días, valida duplicados y envía el correo con Resend.
 * Body: { email, projectId, projectName, role, inviterName }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, projectId, projectName, role, inviterName } = body;

    if (!email || !projectId) {
      return NextResponse.json(
        { error: 'Faltan parámetros obligatorios (email, projectId)' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'El formato del correo electrónico no es válido.' },
        { status: 400 }
      );
    }

    const roleKey = (role && ROLE_LABELS[role]) ? role : 'MEMBER';
    const roleDisplay = ROLE_LABELS[roleKey] || 'Miembro';
    const roleDesc = ROLE_DESCRIPTIONS[roleKey] || 'Colaboración en el proyecto';
    const senderName = inviterName || 'Un integrante de tu equipo';

    // 1. Verificar si el usuario ya es miembro activo de este proyecto
    try {
      const existingUser = await db.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        const existingMember = await db.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: existingUser.id,
            },
          },
        });
        if (existingMember) {
          return NextResponse.json(
            { error: `El usuario ${cleanEmail} ya es miembro de este proyecto.` },
            { status: 400 }
          );
        }
      }
    } catch (checkErr) {
      console.warn('Advertencia verificando membresía existente:', checkErr);
    }

    // Construir URL base
    const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protoHeader = req.headers.get('x-forwarded-proto') || 'https';
    const origin = req.headers.get('origin');
    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      origin ||
      (hostHeader ? `${protoHeader}://${hostHeader}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

    const cleanAppUrl = appBaseUrl.replace(/\/$/, '');

    // Generar Token Criptográfico Seguro y Expiración (7 Días)
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const inviteLink = `${cleanAppUrl}/invite/${token}`;

    let resolvedProjectName = projectName || 'Proyecto de Nexor-Space';

    // 2. Persistir en la base de datos (actualizar si ya había una invitación pendiente para este mail)
    let invitationRecord: any = null;
    try {
      const project = await db.project.findUnique({ where: { id: projectId } });
      if (project?.name) resolvedProjectName = project.name;

      const existingPending = await db.invitation.findFirst({
        where: {
          projectId,
          email: cleanEmail,
          isAccepted: false,
        },
      });

      if (existingPending) {
        // Renovar invitación existente evitando duplicados en la tabla
        invitationRecord = await db.invitation.update({
          where: { id: existingPending.id },
          data: {
            token,
            role: roleKey,
            inviterName: senderName,
            expiresAt,
            createdAt: new Date(),
          },
        });
      } else {
        invitationRecord = await db.invitation.create({
          data: {
            token,
            email: cleanEmail,
            role: roleKey,
            projectId,
            inviterName: senderName,
            isAccepted: false,
            expiresAt,
          },
        });
      }

      // Notificación si el usuario ya tiene cuenta registrada
      const registeredUser = await db.user.findUnique({ where: { email: cleanEmail } });
      if (registeredUser) {
        await db.notification.create({
          data: {
            userId: registeredUser.id,
            title: '¡Fuiste invitado a un proyecto!',
            message: `${senderName} te invitó al proyecto "${resolvedProjectName}" como ${roleDisplay}.`,
            type: 'INVITE',
            linkUrl: `/invite/${token}`,
          },
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ Error gestionando invitación en BD:', dbErr);
    }

    // Supabase (sincronización opcional)
    if (isSupabaseConfigured) {
      try {
        const { data: supaUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (supaUser?.id) {
          await supabase.from('notificaciones').insert({
            usuario_id: supaUser.id,
            titulo: '¡Fuiste invitado a un proyecto!',
            descripcion: `${senderName} te invitó al proyecto "${resolvedProjectName}" como ${roleDisplay}.`,
            tipo: 'INVITE',
            leida: false,
            fecha: new Date().toISOString(),
          });
        }
      } catch (supaErr) {
        console.warn('Error sincronizando notificación en Supabase:', supaErr);
      }
    }

    // 3. Plantilla HTML Responsiva con Dark Theme
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitación a ${resolvedProjectName}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                <tr>
                  <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid #27272a;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); width: 44px; height: 44px; border-radius: 14px; line-height: 44px; text-align: center; font-size: 22px; font-weight: bold; color: #ffffff; margin-bottom: 12px; box-shadow: 0 8px 16px rgba(124, 58, 237, 0.35);">
                      N
                    </div>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      NEXOR-SPACE
                    </h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Gestión & Colaboración de Proyectos
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px 36px 28px 36px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                      ¡Te invitaron a colaborar!
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
                      <strong style="color: #ffffff;">${senderName}</strong> te ha invitado a sumarte al proyecto <strong style="color: #a78bfa;">${resolvedProjectName}</strong> en Nexor-Space.
                    </p>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 16px; margin-bottom: 28px; padding: 18px 20px;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; font-weight: 700; margin-bottom: 4px;">
                            Rol Asignado
                          </div>
                          <div style="font-size: 16px; font-weight: 700; color: #c084fc; margin-bottom: 4px;">
                            ${roleDisplay}
                          </div>
                          <div style="font-size: 12px; color: #a1a1aa; line-height: 1.4;">
                            ${roleDesc}
                          </div>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                      <tr>
                        <td align="center">
                          <a href="${inviteLink}" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 14px; text-align: center; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); border: 1px solid rgba(255,255,255,0.1);">
                            Aceptar Invitación y Unirme &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a; text-align: center;">
                      Si el botón no funciona, copiá este enlace en tu navegador:<br>
                      <a href="${inviteLink}" style="color: #a78bfa; text-decoration: underline; word-break: break-all; font-size: 11px;">
                        ${inviteLink}
                      </a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 36px 32px 36px; border-top: 1px solid #27272a; text-align: center; background-color: #121215;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #71717a;">
                      Esta invitación tiene una validez de <strong>7 días</strong>.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #52525b;">
                      &copy; ${new Date().getFullYear()} Nexor-Space Platform. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 4. Envío con Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailSender = process.env.EMAIL_FROM || 'Nexor-Space <onboarding@resend.dev>';

    let emailSent = false;
    let emailWarning: string | null = null;
    let emailStatus: 'sent' | 'failed' | 'not_configured' = 'not_configured';
    let resendResponse: any = null;

    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: emailSender,
            to: [cleanEmail],
            subject: `Invitación al proyecto: ${resolvedProjectName}`,
            html: emailHtml,
          }),
        });

        const resData = await resendRes.json().catch(() => ({}));
        resendResponse = resData;

        if (resendRes.ok) {
          emailSent = true;
          emailStatus = 'sent';
        } else {
          emailSent = false;
          emailStatus = 'failed';
          const errMsg = resData?.message || resData?.error || 'Error al conectar con Resend';

          if (typeof errMsg === 'string' && errMsg.includes('You can only send testing emails')) {
            emailWarning =
              'Tu cuenta de Resend está en modo sandbox (onboarding@resend.dev) y solo permite enviar correos a tu dirección registrada en Resend. Para enviar a cualquier email, verificá un dominio en resend.com/domains. Podés usar el enlace copiable generado para compartirlo manualmente.';
          } else {
            emailWarning = `Resend rechazó el envío (${errMsg}). Podés usar el enlace copiable directo como alternativa.`;
          }
        }
      } catch (errResend: any) {
        console.error('Error al conectar con Resend API:', errResend);
        emailSent = false;
        emailStatus = 'failed';
        emailWarning = `Fallo de conexión con Resend (${errResend.message || 'error de red'}). Podés compartir el enlace copiable directo.`;
      }
    } else {
      emailSent = false;
      emailStatus = 'not_configured';
      emailWarning =
        'El servicio de correo no está activo (falta configurar RESEND_API_KEY). Podés copiar y enviar el enlace de invitación directo.';
    }

    return NextResponse.json({
      success: true,
      token,
      inviteLink,
      invitationId: invitationRecord?.id,
      expiresAt: expiresAt.toISOString(),
      role: roleKey,
      emailSent,
      emailStatus,
      emailWarning,
      resendResponse,
      message: emailSent
        ? `Invitación enviada por correo electrónico a ${cleanEmail}.`
        : `Invitación generada con éxito. Copiá el enlace directo para compartírselo a ${cleanEmail}.`,
    });
  } catch (error: any) {
    console.error('Error procesando invitación:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al procesar la invitación' },
      { status: 500 }
    );
  }
}
