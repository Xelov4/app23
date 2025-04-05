import { PrismaClient } from '@prisma/client';

// PrismaClient est attaché au scope global dans le développement pour éviter
// d'épuiser la connexion de la base de données

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma; 