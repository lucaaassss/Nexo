import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  LEADER: 'Líder',
  MEMBER: 'Miembro',
  GUEST: 'Invitado',
};

/**
 * POST /api/invite/resend
 * Renueva el token y la fecha de expiración de una invitación pendiente y reintenta el envío de correo.
 * Body: { id: string } o { token: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, token } = body;

    if (!id && !token) {
      return NextResponse.json(
        { error: 'Debe proporcionar el id o token de la invitación a reenviar' },
        { status: 400 }
      );
    }

    const invitation = await db.invitation.findFirst({
      where: id ? { id } : { token },
      include: { project: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      );
    }

    if (invitation.isAccepted) {
      return NextResponse.json(
        { error: 'Esta invitación ya fue aceptada previamente por el usuario' },
        { status: 400 }
      );
    }

    // Renovar token y expiración
    const newToken = crypto.randomBytes(24).toString('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const updated = await db.invitation.update({
      where: { id: invitation.id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
        createdAt: new Date(),
      },
    });

    // Construir URL base
    const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protoHeader = req.headers.get('x-forwarded-proto') || 'https';
    const origin = req.headers.get('origin');
    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      origin ||
      (hostHeader ? `${protoHeader}://${hostHeader}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
    const cleanAppUrl = appBaseUrl.replace(/\/$/, '');
    const inviteLink = `${cleanAppUrl}/invite/${newToken}`;

    // Intentar reenvío por correo con Resend si está disponible
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailSender = process.env.EMAIL_FROM || 'Nexor-Space <onboarding@resend.dev>';
    let emailSent = false;
    let emailWarning: string | null = null;
    let emailStatus: 'sent' | 'failed' | 'not_configured' = 'not_configured';

    if (resendApiKey) {
      try {
        const projectName = invitation.project?.name || 'Proyecto Nexor-Space';
        const roleDisplay = ROLE_LABELS[invitation.role] || invitation.role;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: emailSender,
            to: [invitation.email],
            subject: `[Reenvío] Invitación al proyecto: ${projectName}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09090b; color: #f4f4f5; padding: 32px; border-radius: 16px;">
                <h2 style="color: #a78bfa;">Invitación renovada al proyecto ${projectName}</h2>
                <p>Se ha generado un nuevo enlace para unirte con rol <strong>${roleDisplay}</strong>:</p>
                <div style="margin: 24px 0;">
                  <a href="${inviteLink}" style="background: #7c3aed; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold;">
                    Aceptar Invitación &rarr;
                  </a>
                </div>
                <p style="font-size: 12px; color: #71717a;">Enlace directo: ${inviteLink}</p>
              </div>
            `,
          }),
        });

        const resData = await resendRes.json().catch(() => ({}));
        if (resendRes.ok) {
          emailSent = true;
          emailStatus = 'sent';
        } else {
          emailSent = false;
          emailStatus = 'failed';
          const errMsg = resData?.message || resData?.error || 'Error al conectar con Resend';
          if (typeof errMsg === 'string' && errMsg.includes('You can only send testing emails')) {
            emailWarning =
              'Tu cuenta de Resend está en modo sandbox (onboarding@resend.dev). Solo podés enviar al correo registrado en Resend. Copiá el enlace directo para compartirlo manualmente.';
          } else {
            emailWarning = `Resend rechazó el reenvío (${errMsg}). Usá el enlace directo copiable.`;
          }
        }
      } catch (errResend: any) {
        emailSent = false;
        emailStatus = 'failed';
        emailWarning = `Error de conexión con Resend: ${errResend.message}`;
      }
    } else {
      emailSent = false;
      emailStatus = 'not_configured';
      emailWarning = 'RESEND_API_KEY no configurada. Se generó un nuevo enlace copiable.';
    }

    return NextResponse.json({
      success: true,
      id: updated.id,
      token: updated.token,
      inviteLink,
      expiresAt: updated.expiresAt.toISOString(),
      role: updated.role,
      emailSent,
      emailStatus,
      emailWarning,
      message: emailSent
        ? `Invitación reenviada por correo a ${invitation.email}`
        : `Invitación renovada. Copiá el nuevo enlace directo para compartirlo con ${invitation.email}.`,
    });
  } catch (error: any) {
    console.error('Error al reenviar invitación:', error);
    return NextResponse.json(
      { error: error.message || 'Error al reenviar la invitación' },
      { status: 500 }
    );
  }
}
