import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  LEADER: 'Líder',
  MEMBER: 'Miembro',
  GUEST: 'Invitado',
};

/**
 * POST /api/invite
 * Envía una invitación por correo electrónico (vía Resend) y crea una notificación
 * en la bandeja de entrada del usuario invitado (tanto en Supabase como en base de datos local).
 *
 * Body: { email, projectId, projectName, role, inviterName, inviteLink }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, projectId, projectName, role, inviterName, inviteLink } = body;

    if (!email || !projectId || !projectName) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (email, projectId, projectName)' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const roleDisplay = role ? (ROLE_LABELS[role] || role) : 'Miembro';
    const senderName = inviterName || 'Un integrante de Nexo';

    // ──────────────────────────────────────────────────────────────
    // 1. Crear notificación y membresía en Supabase si está disponible
    // ──────────────────────────────────────────────────────────────
    if (isSupabaseConfigured) {
      try {
        const { data: supaUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (supaUser && supaUser.id) {
          // Asociar en proyecto_miembros
          await supabase.from('proyecto_miembros').upsert({
            proyecto_id: projectId,
            usuario_id: supaUser.id,
            rol: role,
            fecha_union: new Date().toISOString(),
          });

          // Notificación en Supabase
          await supabase.from('notificaciones').insert({
            usuario_id: supaUser.id,
            titulo: '¡Fuiste invitado a un proyecto!',
            descripcion: `${senderName} te invitó al proyecto "${projectName}" como ${roleDisplay}.`,
            tipo: 'INVITE',
            leida: false,
            fecha: new Date().toISOString(),
          });
        }
      } catch (supaErr) {
        console.warn('Error sincronizando invitación con Supabase:', supaErr);
      }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Crear notificación en la base de datos Prisma (fallback / local)
    // ──────────────────────────────────────────────────────────────
    try {
      let targetUser = await db.user.findUnique({ where: { email: cleanEmail } });
      if (!targetUser) {
        targetUser = await db.user.create({
          data: {
            email: cleanEmail,
            name: cleanEmail.split('@')[0],
            password: '',
            role: 'MEMBER',
          },
        });
      }

      await db.notification.create({
        data: {
          userId: targetUser.id,
          title: '¡Fuiste invitado a un proyecto!',
          message: `${senderName} te invitó al proyecto "${projectName}" como ${roleDisplay}.`,
          type: 'INVITE',
          linkUrl: inviteLink || `/invite/${projectId}`,
        },
      });
    } catch (dbErr) {
      console.warn('Error guardando notificación en Prisma SQLite:', dbErr);
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Enviar correo electrónico vía Resend
    // ──────────────────────────────────────────────────────────────
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Sin API key → simular envío con delay para demo/desarrollo local
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json({ success: true, simulated: true });
    }

    const htmlTemplate = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6d28d9; margin: 0; font-size: 28px; font-weight: 800;">NEXO</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Gestión de Proyectos</p>
        </div>
        
        <div style="background-color: white; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="margin-top: 0; color: #111827; font-size: 20px;">¡Te han invitado a unirte a un proyecto!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
            Hola,<br><br>
            <strong>${senderName}</strong> te ha invitado a colaborar en el proyecto <strong>"${projectName}"</strong> con el rol de <strong>${roleDisplay}</strong>.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="display: inline-block; background-color: #7c3aed; color: white; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px;">
              Aceptar Invitación
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 0;">
            Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
            <a href="${inviteLink}" style="color: #7c3aed; word-break: break-all;">${inviteLink}</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Nexo. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'Nexo <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: `Invitación al proyecto: ${projectName}`,
          html: htmlTemplate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, data });
      }

      const errData = await res.json().catch(() => ({}));
      console.warn('Resend respondió con advertencia/error:', errData);
    } catch (e) {
      console.warn('Error enviando con Resend API:', e);
    }

    return NextResponse.json({ success: true, simulated: true });
  } catch (error: any) {
    console.error('Error procesando invitación:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
