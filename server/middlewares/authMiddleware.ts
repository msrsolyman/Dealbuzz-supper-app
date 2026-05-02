import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any;
  tenantId?: string;
  auditInfo?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

    const user = await (User as any).findById(decoded.id);
    if (!user || user.status === 'inactive') {
      return res.status(401).json({ error: 'Unauthorized: User not found or inactive' });
    }

    req.user = user;
    if (user.tenantId) {
      req.tenantId = user.tenantId.toString();
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
};
