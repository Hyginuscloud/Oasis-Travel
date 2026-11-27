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

function safeDecodeUriPart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractSupabaseProjectRef(): string {
  const apiUrl = stripEnvQuotes(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const match = apiUrl.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match ? match[1] : '';
}

export interface ParsedPostgresUri {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  hasPlaceholder: boolean;
  hasWrappedBrackets: boolean;
  missingPoolerTenantRef: boolean;
}

export function parsePostgresUriToPoolConfig(rawUrl: string): ParsedPostgresUri | null {
  const cleanedUrl = stripEnvQuotes(rawUrl).replace(/[\r\n]+/g, '').trim();
  const schemeMatch = cleanedUrl.match(/^postgres(?:ql)?:\/\/([\s\S]+)$/i);
  if (!schemeMatch) {
    return null;
  }

  const rest = schemeMatch[1];
  const authorityMatch = rest.match(
    /^([\s\S]+)@([a-zA-Z0-9.-]+|\[[a-fA-F0-9:]+\])(?::(\d+))?(?:\/([^?]*))?(?:\?([\s\S]*))?$/
  );
  if (!authorityMatch) {
    return null;
  }

  const [, authPart, rawHost, rawPort, rawDatabase] = authorityMatch;
  const colonIdx = authPart.indexOf(':');
  const rawUser = colonIdx >= 0 ? authPart.slice(0, colonIdx) : authPart;
  const rawPassword = colonIdx >= 0 ? authPart.slice(colonIdx + 1) : '';

  const host = rawHost.replace(/^\[|\]$/g, '');
  let user = safeDecodeUriPart(rawUser);
  let password = safeDecodeUriPart(rawPassword);

  const hasPlaceholder = /\[YOUR[-_]?PASSWORD\]/i.test(rawPassword) || /\[YOUR[-_]?PASSWORD\]/i.test(password);
  const hasWrappedBrackets =
    !hasPlaceholder && password.length > 2 && password.startsWith('[') && password.endsWith(']');

  if (hasPlaceholder) {
    const fallbackPw = stripEnvQuotes(process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD);
    if (fallbackPw) {
      password = fallbackPw;
    }
  }

  const projectRef = extractSupabaseProjectRef();
  const isPoolerHost = /\.pooler\.supabase\.com$/i.test(host);
  let missingPoolerTenantRef = false;
  if (isPoolerHost && user === 'postgres') {
    if (projectRef) {
      user = `postgres.${projectRef}`;
    } else {
      missingPoolerTenantRef = true;
    }
  }

  const parsedPort = rawPort ? Number(rawPort) : 5432;
  const database = rawDatabase ? safeDecodeUriPart(rawDatabase) || 'postgres' : 'postgres';

  return {
    host,
    port: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5432,
    user,
    password,
    database,
    hasPlaceholder,
    hasWrappedBrackets,
    missingPoolerTenantRef,
  };
}

function selectActiveDatabaseUrl(): string {
  const candidates = [
    stripEnvQuotes(process.env.SUPABASE_DB_URL),
    stripEnvQuotes(process.env.POSTGRES_URL),
    stripEnvQuotes(process.env.POSTGRES_PRISMA_URL),
    stripEnvQuotes(process.env.DATABASE_URL),
    stripEnvQuotes(process.env.POSTGRES_URL_NON_POOLING),
  ].filter(Boolean);

  const validCandidates = candidates.filter((u) => !/\[YOUR[-_]?PASSWORD\]/i.test(u));
  const poolSource = validCandidates.length > 0 ? validCandidates : candidates;

  return (
    poolSource.find((u) => /\.pooler\.supabase\.com/i.test(u)) ||
    poolSource.find((u) => !/@db\.[a-z0-9]+\.supabase\.co/i.test(u)) ||
    poolSource[0] ||
    ''
  );
}

export function getDbConfigDiagnosticHint(): string | null {
  const activeUrl = selectActiveDatabaseUrl();
  if (!activeUrl) return null;
  const parsed = parsePostgresUriToPoolConfig(activeUrl);
  if (!parsed) return null;
  if (parsed.hasPlaceholder) {
    return 'SUPABASE_DB_URL still contains the [YOUR-PASSWORD] placeholder. Replace [YOUR-PASSWORD] (without square brackets) with your real Supabase database password.';
  }
  if (parsed.hasWrappedBrackets) {
    return 'SUPABASE_DB_URL password appears wrapped in [ ] brackets — remove the square brackets around the password.';
  }
  if (parsed.missingPoolerTenantRef) {
    return 'Supabase Pooler URI username must be postgres.<PROJECT_REF> (for example postgres.ppizjqcqjadxbacnyeth) instead of plain postgres.';
  }
  return null;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const supabaseUrl = selectActiveDatabaseUrl();
    const parsedUri = supabaseUrl ? parsePostgresUriToPoolConfig(supabaseUrl) : null;
    const supabaseHost = stripEnvQuotes(process.env.SUPABASE_DB_HOST || process.env.POSTGRES_HOST);
    const useSupabaseHost = Boolean(supabaseHost);

    global._postgresPool = new Pool(
      parsedUri
        ? {
            host: parsedUri.host,
            port: parsedUri.port,
            user: parsedUri.user,
            password: parsedUri.password,
            database: parsedUri.database,
            ssl: { rejectUnauthorized: false },
            max: 5,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 15000,
          }
        : supabaseUrl
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
