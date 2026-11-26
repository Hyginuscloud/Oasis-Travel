import crypto from 'node:crypto';

const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

function stripQuotes(val?: string): string {
  const trimmed = (val || '').trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function getSessionSecret(): string {
  const explicit = stripQuotes(process.env.SESSION_SECRET);
  if (explicit) return explicit;

  const deploymentEntropy = [
    process.env.ADMIN_PASSCODE,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_HOST,
    process.env.POSTGRES_HOST,
    process.env.SUPABASE_DB_PASSWORD,
    process.env.POSTGRES_PASSWORD,
    process.env.SQL_PASSWORD,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
    .map((v) => stripQuotes(v))
    .filter(Boolean)
    .join('|');

  if (deploymentEntropy) {
    return crypto
      .createHmac('sha256', 'oasis-dubai-session-key-v1')
      .update(deploymentEntropy)
      .digest('hex');
  }

  return EPHEMERAL_FALLBACK_SECRET;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
    const [, salt, expectedHex] = parts;
    if (!salt || !expectedHex) return false;
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function verifyConstantTimeSecret(candidate: string, expected: string): boolean {
  const a = crypto.createHash('sha256').update(candidate).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export interface AdminTokenPayload {
  sub: string;
  username: string;
  displayName: string;
  role: string;
  source: 'password' | 'env_passcode';
  exp: number;
}

export function signAdminSessionToken(payload: Omit<AdminTokenPayload, 'exp'>, ttlSeconds = 60 * 60 * 12): string {
  const fullPayload: AdminTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(`oasis.${body}`).digest('base64url');
  return `oasis.${body}.${sig}`;
}

export function verifyAdminSessionToken(token: string): AdminTokenPayload | null {
  if (!token || !token.startsWith('oasis.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, body, sig] = parts;
  if (!body || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(`oasis.${body}`)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AdminTokenPayload;
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
