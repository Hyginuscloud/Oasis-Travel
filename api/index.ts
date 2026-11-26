import type { Request, Response } from 'express';

let appPromise: Promise<{ default: (req: Request, res: Response) => unknown }> | null = null;

export default async function handler(req: Request, res: Response) {
  try {
    if (!appPromise) {
      appPromise = import('../server.ts');
    }
    const mod = await appPromise;
    const app = mod.default;

    if (res.writableEnded) return;
    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      if (typeof res.once === 'function') {
        res.once('finish', done);
        res.once('close', done);
      }
      try {
        app(req, res);
      } catch (invokeErr) {
        if (!res.headersSent) {
          const msg = invokeErr instanceof Error ? invokeErr.message : 'Request handling error.';
          res.status(500).json({ error: msg });
        }
        done();
      }
      if (typeof res.once !== 'function') {
        done();
      }
    });
  } catch (err: unknown) {
    appPromise = null;
    console.error('Unhandled serverless boot/handler error:', err);
    const message = err instanceof Error ? err.message : 'Serverless function invocation failed.';
    if (!res.headersSent) {
      res.status(500).json({ error: `Serverless startup error: ${message}` });
    }
  }
}
