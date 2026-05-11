import NodeCache from 'node-cache';
import type { Request, Response, NextFunction } from 'express';

// Standard 5 minutes cache
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Cache middleware to store API responses
 * Defaults to 5 minutes inline with optimal response caching
 */
export const cacheMiddleware = (durationSecs: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Build key from URL and query params
    const key = `__express__${req.originalUrl || req.url}`;
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

export const clearCache = (prefix: string) => {
    const keys = cache.keys();
    keys.forEach(key => {
        if(key.includes(prefix)) {
            cache.del(key);
        }
    });
};
