import { PrismaClient } from '../generated/client/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

const getClient = () => {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  });
  return new PrismaClient({ adapter });
};

if (process.env.NODE_ENV === 'production') {
  prismaInstance = getClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = getClient();
  }
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;
