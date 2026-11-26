import fs from 'node:fs';
import path from 'node:path';
import type { DecodedIdToken } from 'firebase-admin/auth';

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

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
  const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/auth'),
  ]);
  if (!getApps().length) {
    initializeApp({
      projectId: resolveProjectId(),
    });
  }
  return getAuth().verifyIdToken(idToken);
}
