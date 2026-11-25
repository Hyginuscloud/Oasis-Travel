import { NextFunction, Request, Response } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { verifyAdminSessionToken } from '../lib/passwordAuth.ts';
import {
  ensureSeeded,
  findDashboardUserByUsername,
  isAuthorizedAdminEmail,
  upsertUserProfile,
} from '../db/repository.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dashboardAccount?: {
    username: string;
    displayName: string;
    role: string;
    source: 'password' | 'env_passcode';
  };
  adminRole?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split('Bearer ')[1];

  // 1. Check signed Oasis Admin/Manager session token first
  if (token.startsWith('oasis.')) {
    const payload = verifyAdminSessionToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired administrator session. Please sign in again.' });
    }
    try {
      if (payload.source === 'password') {
        await ensureSeeded();
        const dbUser = await findDashboardUserByUsername(payload.username);
        if (!dbUser || !dbUser.isActive) {
          return res.status(403).json({ error: 'Your dashboard access has been suspended or revoked.' });
        }
        req.dashboardAccount = {
          username: dbUser.username,
          displayName: dbUser.displayName,
          role: dbUser.role,
          source: 'password',
        };
      } else {
        req.dashboardAccount = {
          username: payload.username,
          displayName: payload.displayName,
          role: payload.role,
          source: 'env_passcode',
        };
      }
      return next();
    } catch (err) {
      console.error('Error verifying dashboard session:', err);
      return res.status(500).json({ error: 'Unable to validate administrator session.' });
    }
  }

  // 2. Fallback to Firebase ID Token (Google Sign-In)
  if (!adminAuth) {
    return res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    if (decodedToken.email) {
      await ensureSeeded();
      await upsertUserProfile(decodedToken.uid, decodedToken.email, decodedToken.name || null);
    }
    return next();
  } catch (error) {
    console.error('Error verifying authentication token:', error);
    return res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.dashboardAccount) {
      req.adminRole = req.dashboardAccount.role;
      return next();
    }

    const email = req.user?.email;
    if (!email) {
      return res.status(403).json({ error: 'Administrator verification required.' });
    }
    const check = await isAuthorizedAdminEmail(email);
    if (!check.authorized) {
      return res.status(403).json({
        error: 'Access denied. Your account is not authorised for Oasis administration.',
      });
    }
    req.adminRole = check.role;
    return next();
  } catch (error) {
    console.error('Admin verification failed:', error);
    return res.status(500).json({ error: 'Failed to verify administrator permissions.' });
  }
};
