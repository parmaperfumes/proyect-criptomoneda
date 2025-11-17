/**
 * Cliente Prisma Singleton
 * Previene múltiples instancias en desarrollo (hot reload)
 */

import { PrismaClient } from '@prisma/client';

// Tipo para el cliente global
declare global {
  var prisma: PrismaClient | undefined;
}

// Configuración del cliente Prisma
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

// Usar instancia global en desarrollo para evitar múltiples conexiones
const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;

