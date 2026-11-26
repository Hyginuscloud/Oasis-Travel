import type { Request, Response } from 'express';
import app from '../server.ts';

export default function handler(req: Request, res: Response) {
  try {
    return app(req, res);
  } catch (err: unknown) {
    console.error('Unhandled serverless handler error:', err);
    const message = err instanceof Error ? err.message : 'Serverless function invocation failed.';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
}
