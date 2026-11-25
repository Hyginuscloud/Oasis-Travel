import fs from 'node:fs';
import path from 'node:path';
import { Auth, getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp } from 'firebase-admin/app';

function resolveProjectId(): string {
  const fromEnv = (process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '').trim();
  if (fromEnv) return fromEnv;
  try {
    const configPath =
      typeof import.meta !== 'undefined' && import.meta.url
        ? new URL('../../firebase-applet-config.json', import.meta.url)
        : path.resolve(process.cwd(), 'firebase-applet-config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw) as { projectId?: string };
    if (parsed?.projectId) return parsed.projectId;
  } catch {
    // Fallback to configured project ID if JSON file is not bundled in serverless trace
  }
  return 'utility-passage-7bvhw';
}

let cachedAuth: Auth | null = null;
try {
  if (!getApps().length) {
    initializeApp({
      projectId: resolveProjectId(),
    });
  }
  cachedAuth = getAuth();
} catch (err) {
  console.warn('Firebase Admin initialization deferred:', err);
}

export const adminAuth = cachedAuth as Auth;
