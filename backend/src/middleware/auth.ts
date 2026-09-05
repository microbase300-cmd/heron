import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/authService';
import { db } from '../services/db';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Access denied. Bearer token required.' });
    return;
  }

  try {
    const payload = authService.verifyAccessToken(token);
    const user = db.getUserById(payload.userId);

    if (!user || user.status === 'suspended') {
      res.status(403).json({ error: 'Account is deactivated or suspended.' });
      return;
    }

    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired access token.', code: 'TOKEN_EXPIRED' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
    return;
  }
  next();
};

export const requireCompliance = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'compliance')) {
    res.status(403).json({ error: 'Access forbidden. Compliance or Admin privileges required.' });
    return;
  }
  next();
};

export const requireAuth = authenticateToken;
