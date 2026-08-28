import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/notifications?userId=...&email=...
 * Retorna las notificaciones del usuario consultado por su ID o correo electrónico.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json({ error: 'Se requiere userId o email' }, { status: 400 });
    }

    const userIds: string[] = [];
    if (userId && userId !== 'undefined' && userId !== 'null') {
      userIds.push(userId);
    }

    if (email && email !== 'undefined' && email !== 'null') {
      const users = await db.user.findMany({
        where: { email: { equals: email.toLowerCase().trim() } },
        select: { id: true },
      });
      users.forEach((u) => {
        if (!userIds.includes(u.id)) userIds.push(u.id);
      });
    }

    if (userIds.length === 0) {
      return NextResponse.json([]);
    }

    const notifications = await db.notification.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error obteniendo notificaciones:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

/**
 * POST /api/notifications
 * Crea una notificación para un usuario destinatario.
 *
 * Body: { userId?, email?, title, message, type, linkUrl? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, title, message, type = 'SYSTEM', linkUrl } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Faltan title y message' }, { status: 400 });
    }

    let targetUserId = userId;

    if (!targetUserId && email) {
      const cleanEmail = email.toLowerCase().trim();
      let user = await db.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await db.user.create({
          data: {
            email: cleanEmail,
            name: cleanEmail.split('@')[0],
            password: '',
            role: 'MEMBER',
          },
        });
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'No se pudo determinar el usuario destinatario' }, { status: 400 });
    }

    const notification = await db.notification.create({
      data: {
        userId: targetUserId,
        title,
        message,
        type,
        ...(linkUrl ? { linkUrl } : {}),
      },
    });

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error: any) {
    console.error('Error creando notificación:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications
 * Marca como leídas las notificaciones de un usuario.
 * Body: { userId?, email? }
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    if (!userId && !email) {
      return NextResponse.json({ error: 'Se requiere userId o email' }, { status: 400 });
    }

    const userIds: string[] = [];
    if (userId) userIds.push(userId);

    if (email) {
      const users = await db.user.findMany({
        where: { email: { equals: email.toLowerCase().trim() } },
        select: { id: true },
      });
      users.forEach((u) => {
        if (!userIds.includes(u.id)) userIds.push(u.id);
      });
    }

    if (userIds.length > 0) {
      await db.notification.updateMany({
        where: { userId: { in: userIds }, read: false },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marcando notificaciones como leídas:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications?id=... (o ?userId=... / ?email=...)
 * Elimina una notificación específica por su ID o todas las de un usuario.
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (id) {
      await db.notification.deleteMany({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Notificación eliminada' });
    }

    if (userId || email) {
      const userIds: string[] = [];
      if (userId) userIds.push(userId);

      if (email) {
        const users = await db.user.findMany({
          where: { email: { equals: email.toLowerCase().trim() } },
          select: { id: true },
        });
        users.forEach((u) => {
          if (!userIds.includes(u.id)) userIds.push(u.id);
        });
      }

      if (userIds.length > 0) {
        await db.notification.deleteMany({
          where: { userId: { in: userIds } },
        });
      }

      return NextResponse.json({ success: true, message: 'Notificaciones eliminadas' });
    }

    return NextResponse.json({ error: 'Se requiere id, userId o email' }, { status: 400 });
  } catch (error: any) {
    console.error('Error eliminando notificaciones:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
