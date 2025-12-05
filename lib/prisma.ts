// lib/prisma.ts

import { PrismaClient } from '../generated/prisma/client';
// Import the native PostgreSQL driver and the Prisma Adapter
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Setup the Adapter
// The connection string is read from your environment variables
const connectionString = process.env.PRISMA_DATABASE_URL;

if (!connectionString) {
  throw new Error('PRISMA_DATABASE_URL environment variable is not set.');
}

// Initialize the native driver pool
const pool = new Pool({ connectionString });

// Initialize the Prisma adapter with the pool
const adapter = new PrismaPg(pool);

// 2. Define the Global Prisma Client
// This is done to preserve the instance during hot-reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 3. Implement the Singleton Logic
// In production, create a single instance. In development, reuse the global instance.
const prisma = global.prisma || new PrismaClient({ adapter });

// In development, store the instance globally
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// 4. Export the single, shared instance
export default prisma;
