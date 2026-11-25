import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const supabaseUrl = (
      process.env.SUPABASE_DB_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_URL ||
      ''
    ).trim();
    const supabaseHost = (process.env.SUPABASE_DB_HOST || process.env.POSTGRES_HOST || '').trim();
    const useSupabaseHost = Boolean(supabaseHost);

    global._postgresPool = new Pool(
      supabaseUrl
        ? {
            connectionString: supabaseUrl,
            ssl: { rejectUnauthorized: false },
            max: 5,
            connectionTimeoutMillis: 15000,
          }
        : useSupabaseHost
          ? {
              host: supabaseHost,
              port: Number(process.env.SUPABASE_DB_PORT || '6543'),
              user: (process.env.SUPABASE_DB_USER || process.env.POSTGRES_USER || '').trim(),
              password: process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
              database: (process.env.SUPABASE_DB_NAME || process.env.POSTGRES_DATABASE || 'postgres').trim(),
              ssl: { rejectUnauthorized: false },
              max: 5,
              connectionTimeoutMillis: 15000,
            }
          : {
              host: process.env.SQL_HOST,
              user: process.env.SQL_USER,
              password: process.env.SQL_PASSWORD,
              database: process.env.SQL_DB_NAME,
              max: 10,
              connectionTimeoutMillis: 15000,
            }
    );

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
