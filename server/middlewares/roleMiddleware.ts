import type {  Response, NextFunction  } from 'express';
import type { AuthRequest } from './authMiddleware.ts';

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.role === 'super_admin' || req.user.role === 'dev') {
      return next(); // Overrides usually
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
