import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/auth/register
 * Registra un nuevo usuario en la base de datos local (Prisma SQLite).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, nombre, apellido, usuario } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Correo electrónico y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const fullName = `${nombre || ''} ${apellido || ''}`.trim() || cleanEmail.split('@')[0];

    // Verificar si ya existe usuario con este email
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta registrada con este correo electrónico.' },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        email: cleanEmail,
        password: password,
        name: fullName,
        role: 'MEMBER',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar usuario en el servidor' },
      { status: 500 }
    );
  }
}
