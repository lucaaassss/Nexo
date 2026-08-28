import { NextResponse } from 'next/server';

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

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Simular un retardo para la demo
      await new Promise(resolve => setTimeout(resolve, 800));
      return NextResponse.json({ success: true, simulated: true });
    }

    try {
      // Intentar envío dinámico con Resend si está disponible
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'Nexo <onboarding@resend.dev>',
          to: [email],
          subject: `Invitación al proyecto: ${projectName}`,
          html: `<div style="font-family: sans-serif; padding: 20px;"><h2>Invitación a ${projectName}</h2><p>Te han invitado con el rol de ${role}.</p><a href="${inviteLink}">Aceptar Invitación</a></div>`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, data });
      }
    } catch (e) {
      console.warn('Error enviando con Resend API:', e);
    }

    return NextResponse.json({ success: true, simulated: true });
  } catch (error: any) {
    console.error('Error procesando invitación:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
