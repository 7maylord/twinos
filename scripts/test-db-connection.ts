import 'dotenv/config';
import { PrismaClient } from '../generated/client/client';
import path from 'path';

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('❌ Error: DATABASE_URL not found in .env file.');
  process.exit(1);
}

// Extract hostname and database name for clean logs (filtering password)
try {
  const parsed = new URL(url.replace('postgresql://', 'http://'));
  console.log(`Connection Target: host=${parsed.hostname}, port=${parsed.port || '5432'}, db=${parsed.pathname.replace('/', '')}`);
} catch {
  console.log('Connection Target: Custom format database URL.');
}

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: url,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testConnection() {
  console.log('Connecting to database...');
  try {
    // Run a basic raw SQL check
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connection Test: SUCCESS! The database is reachable and authenticated.');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Connection Test: FAILED.');
    console.error('\nError Details:');
    console.error(err.message || err);
    console.error('\nSuggestions:');
    if (err.message?.includes('ETIMEDOUT') || err.message?.includes('connect ECONNREFUSED')) {
      console.error('👉 The database host is unreachable. Please verify your VPC security groups allow incoming TCP traffic on port 5432 from your current IP address.');
    } else if (err.message?.includes('password authentication failed') || err.message?.includes('Authentication failed')) {
      console.error('👉 Invalid username or password. Please verify the credentials in your DATABASE_URL.');
    } else {
      console.error('👉 Verify that the DATABASE_URL points to a running PostgreSQL database, and that the switch command (node scripts/db-switch.js postgres) was run first.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
