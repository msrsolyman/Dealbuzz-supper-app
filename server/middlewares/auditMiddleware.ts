import type {  Response, NextFunction  } from 'express';
import type { AuthRequest } from './authMiddleware.ts';
import AuditLog from '../models/AuditLog.ts';

export const auditLog = (collectionName: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    // Determine action type based on HTTP method
    let action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | null = null;
    if (req.method === 'POST') action = 'CREATE';
    else if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
    else if (req.method === 'DELETE') action = 'DELETE';

    if (req.path.includes('/login')) action = 'LOGIN';

    if (!action) return next();

    // To get old data for UPDATE/DELETE, you would usually fetch it before proceeding.
    // For simplicity, we can capture input data.
    const newData = req.body;

    res.send = function (data) {
      res.send = originalSend;

      let documentId;
      try {
        const parsedResponse = JSON.parse(data as string);
        documentId = parsedResponse._id || parsedResponse.data?._id;
      } catch (e) {
        // Ignore JSON parse errors
      }

      // Log async
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditLog.create({
          tenantId: req.tenantId,
          userId: req.user?._id || 'guest',
          action,
          collectionName,
          documentId,
          newData,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }).catch((err) => console.error('Audit Log Error:', err));
      }

      return res.send(data);
    };

    next();
  };
};
