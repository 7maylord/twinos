const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2]; // 'sqlite' or 'postgres'

if (target !== 'sqlite' && target !== 'postgres') {
  console.error('Usage: node scripts/db-switch.js [sqlite|postgres]');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const dbLibPath = path.join(__dirname, '../lib/db.ts');

let schemaContent = fs.readFileSync(schemaPath, 'utf8');
let dbLibContent = fs.readFileSync(dbLibPath, 'utf8');

if (target === 'postgres') {
  console.log('Switching database configuration to PostgreSQL (Aurora)...');
  
  // Update schema.prisma provider to postgresql
  schemaContent = schemaContent.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  
  // Update lib/db.ts to use standard native client (no sqlite adapter)
  dbLibContent = `import { PrismaClient } from '../generated/client/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

const getClient = () => {
  return new PrismaClient();
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
`;

} else {
  console.log('Switching database configuration to SQLite (Local Dev)...');
  
  // Update schema.prisma provider to sqlite
  schemaContent = schemaContent.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
  
  // Update lib/db.ts to use SQLite adapter-better-sqlite3
  dbLibContent = `import { PrismaClient } from '../generated/client/client';
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
`;
}

fs.writeFileSync(schemaPath, schemaContent);
fs.writeFileSync(dbLibPath, dbLibContent);

console.log('Regenerating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Database switcher successfully completed.');
} catch (err) {
  console.error('Prisma client generation failed.', err);
  process.exit(1);
}
