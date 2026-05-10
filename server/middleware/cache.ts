import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware.ts'; // to get tenantId if available

// Standard 5 minutes cache
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Cache middleware to store API responses
 * Defaults to 5 minutes inline with optimal response caching
 */
export const cacheMiddleware = (durationSecs: number = 300) => {
  return (req: any, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Build key from URL and query params
    // IMPORTANT: Make sure cache keys are isolated per tenant
    const tenantIdentifier = req.tenantId || req.user?.tenantId?.toString() || 'global';
    const key = `__express__${tenantIdentifier}__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    } else {
      // Intercept the original res.json to save the response to cache
      const originalJson = res.json.bind(res);
      res.json = (body: any): Response => {
        cache.set(key, body, durationSecs);
        return originalJson(body);
      };
      next();
    }
  };
};

export const clearCache = (prefix: string, tenantId?: string) => {
    const keys = cache.keys();
    keys.forEach(key => {
        if (tenantId) {
            if (key.includes(`__${tenantId}__`) && key.includes(prefix)) {
                cache.del(key);
            }
        } else if(key.includes(prefix)) {
            cache.del(key);
        }
    });
};
