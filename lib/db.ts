import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché à l'objet `global` en développement pour éviter
// d'épuiser la limite de connexion à votre base de données.
// En savoir plus : https://pris.ly/d/help/next-prisma-client-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

console.log('Initialisation de Prisma, DATABASE_URL:', process.env.DATABASE_URL);

const prismaClientOptions = {
  log: ['query', 'error', 'warn'],
};

export const db = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db; 