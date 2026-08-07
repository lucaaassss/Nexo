import { PrismaClient } from '@prisma/client';

/**
 * Cliente de Prisma Singleton
 * Mantiene una única instancia de conexión a la base de datos para evitar exceder
 * el límite de conexiones en entornos de desarrollo y Serverless en Vercel.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
