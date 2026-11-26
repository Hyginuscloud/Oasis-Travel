import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

function stripEnvQuotes(val?: string): string {
  const trimmed = (val || '').trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const supabaseUrl =
      stripEnvQuotes(process.env.SUPABASE_DB_URL) ||
      stripEnvQuotes(process.env.POSTGRES_URL) ||
      stripEnvQuotes(process.env.POSTGRES_PRISMA_URL) ||
      stripEnvQuotes(process.env.POSTGRES_URL_NON_POOLING) ||
      stripEnvQuotes(process.env.DATABASE_URL);
    const supabaseHost = stripEnvQuotes(process.env.SUPABASE_DB_HOST || process.env.POSTGRES_HOST);
    const useSupabaseHost = Boolean(supabaseHost);

    global._postgresPool = new Pool(
      supabaseUrl
        ? {
            connectionString: supabaseUrl,
            ssl: { rejectUnauthorized: false },
            max: 5,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 15000,
          }
        : useSupabaseHost
          ? {
              host: supabaseHost,
              port: Number(stripEnvQuotes(process.env.SUPABASE_DB_PORT) || '6543'),
              user: stripEnvQuotes(process.env.SUPABASE_DB_USER || process.env.POSTGRES_USER),
              password: stripEnvQuotes(process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD),
              database: stripEnvQuotes(process.env.SUPABASE_DB_NAME || process.env.POSTGRES_DATABASE) || 'postgres',
              ssl: { rejectUnauthorized: false },
              max: 5,
              idleTimeoutMillis: 10000,
              connectionTimeoutMillis: 15000,
            }
          : {
              host: stripEnvQuotes(process.env.SQL_HOST),
              user: stripEnvQuotes(process.env.SQL_USER),
              password: stripEnvQuotes(process.env.SQL_PASSWORD),
              database: stripEnvQuotes(process.env.SQL_DB_NAME),
              max: 10,
              idleTimeoutMillis: 10000,
              connectionTimeoutMillis: 15000,
            }
    );

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

export const pool = createPool();

export const db = drizzle(pool, { schema });
