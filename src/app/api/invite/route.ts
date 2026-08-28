import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializar cliente de Resend (la API KEY se tomará del entorno si existe)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    if (!resend) {
      console.warn('RESEND_API_KEY no configurada. Simulando envío de correo.');
      // Simular un retardo para la demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({ success: true, simulated: true });
    }

    // Role format
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrador',
      LEADER: 'Líder',
      MEMBER: 'Miembro',
      GUEST: 'Invitado'
    };
    const roleDisplay = role ? roleLabels[role] || role : 'Miembro';
    const senderName = inviterName || 'Un integrante de Nexo';

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
            <a href="${inviteLink}" style="display: inline-block; background-color: #7c3aed; color: white; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; transition: background-color 0.2s;">
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

    const { data, error } = await resend.emails.send({
      from: 'Nexo <onboarding@resend.dev>', // Usando el dominio por defecto de test de resend
      to: [email],
      subject: `Invitación al proyecto: ${projectName}`,
      html: htmlTemplate,
    });

    if (error) {
      console.error('Error enviando email con Resend:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error procesando invitación:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
