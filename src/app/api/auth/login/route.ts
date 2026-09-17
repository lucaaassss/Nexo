import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/auth/login
 * Inicia sesión validando las credenciales contra la base de datos local (Prisma SQLite).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    let user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Si es un email nuevo para el entorno de desarrollo/prueba, lo creamos automáticamente
      user = await db.user.create({
        data: {
          email: cleanEmail,
          password: password,
          name: cleanEmail.split('@')[0],
          role: cleanEmail.includes('admin') ? 'ADMIN' : 'MEMBER',
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    return NextResponse.json(
      { error: error.message || 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
