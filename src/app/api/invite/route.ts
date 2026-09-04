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
 * POST /api/invite
 * Genera un token único de 7 días, persiste la invitación en la base de datos
 * y envía el correo real con Resend.
 *
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
    const roleKey = (role && ROLE_LABELS[role]) ? role : 'MEMBER';
    const roleDisplay = ROLE_LABELS[roleKey] || 'Miembro';
    const roleDesc = ROLE_DESCRIPTIONS[roleKey] || 'Colaboración en el proyecto';
    const senderName = inviterName || 'Un integrante de tu equipo';

    // Construir URL base desde los headers de la petición (siempre funciona)
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

    // Resolver nombre del proyecto (usar el enviado si la DB falla)
    let resolvedProjectName = projectName || 'Proyecto de Nexor-Space';

    // ── Base de datos (todo opcional — si falla, el email igual se envía) ──
    try {
      // Buscar nombre real del proyecto
      const project = await db.project.findUnique({ where: { id: projectId } });
      if (project?.name) resolvedProjectName = project.name;

      // Persistir invitación con token
      await db.invitation.create({
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

      // Notificación para el usuario si ya existe
      const existingUser = await db.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        await db.notification.create({
          data: {
            userId: existingUser.id,
            title: '¡Fuiste invitado a un proyecto!',
            message: `${senderName} te invitó al proyecto "${resolvedProjectName}" como ${roleDisplay}.`,
            type: 'INVITE',
            linkUrl: `/invite/${token}`,
          },
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ Base de datos no disponible, continuando solo con envío de email:', dbErr);
    }

    // ── Supabase (opcional) ──
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


    // 7. Plantilla HTML con Identidad Visual Nexor-Space (Dark Theme + Violet Accent)
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
                
                <!-- Encabezado con Logo -->
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

                <!-- Cuerpo del Correo -->
                <tr>
                  <td style="padding: 36px 36px 28px 36px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                      ¡Te invitaron a colaborar!
                    </h2>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
                      <strong style="color: #ffffff;">${senderName}</strong> te ha invitado a sumarte al proyecto <strong style="color: #a78bfa;">${resolvedProjectName}</strong> en Nexor-Space.
                    </p>

                    <!-- Tarjeta de Detalles del Rol -->
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

                    <!-- Botón de Aceptación -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                      <tr>
                        <td align="center">
                          <a href="${inviteLink}" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 14px; text-align: center; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4); border: 1px solid rgba(255,255,255,0.1);">
                            Aceptar Invitación y Unirme &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Enlace directo en texto plano -->
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a; text-align: center;">
                      Si el botón no funciona, copiá este enlace en tu navegador:<br>
                      <a href="${inviteLink}" style="color: #a78bfa; text-decoration: underline; word-break: break-all; font-size: 11px;">
                        ${inviteLink}
                      </a>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
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

    // 8. Envío de Correo vía Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailSender = process.env.EMAIL_FROM || 'Nexor-Space <onboarding@resend.dev>';

    let emailSent = false;
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
        if (resendRes.ok) {
          emailSent = true;
          resendResponse = resData;
        } else {
          console.warn('Resend API aviso/limite:', resData);
          resendResponse = resData;
          emailSent = false;
        }
      } catch (errResend: any) {
        console.error('Error al conectar con Resend API:', errResend);
        emailSent = false;
      }
    } else {
      console.info('ℹ️ RESEND_API_KEY no detectada. Invitación generada localmente.');
      await new Promise((r) => setTimeout(r, 400));
      emailSent = false;
    }

    return NextResponse.json({
      success: true,
      token,
      inviteLink,
      expiresAt: expiresAt.toISOString(),
      role: roleKey,
      emailSent,
      resendResponse,
      message: emailSent
        ? `Invitación enviada por email a ${cleanEmail}`
        : `Invitación creada. Copiá el enlace directo para enviárselo a ${cleanEmail}.`,
    });
  } catch (error: any) {
    console.error('Error procesando invitación:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al procesar la invitación' },
      { status: 500 }
    );
  }

}
