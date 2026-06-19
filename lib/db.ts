import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

const getClient = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }
  const pool = new Pool({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  const adapter = new PrismaPg(pool);
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
