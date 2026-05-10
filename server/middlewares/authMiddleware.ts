import type {  Request, Response, NextFunction  } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.ts";

export interface AuthRequest extends Request {
  user?: any;
  tenantId?: string;
  auditInfo?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if it's a public GET route
    const isPublicGet = req.method === 'GET' && (
      req.path.startsWith('/products') || 
      req.path.startsWith('/services') || 
      req.path.startsWith('/offers')
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (isPublicGet) {
        // Find default tenant for public routes if needed
        import('../models/Tenant.ts').then(({ default: Tenant }) => {
          Tenant.findOne().then((tenant: any) => {
            if (tenant) req.tenantId = tenant._id.toString();
            next();
          }).catch(() => next());
        });
        return;
      }
      return res
        .status(401)
        .json({ error: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supers3cr3tdealbuzzkey99",
      ) as any;
    } catch (err) {
      // try fallback if token was signed before .env was created
      decoded = jwt.verify(token, "fallback_secret") as any;
    }

    const user = await (User as any).findById(decoded.id);
    if (!user || user.status === "inactive") {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not found or inactive" });
    }

    req.user = user;
    if (user.tenantId) {
      req.tenantId = user.tenantId.toString();
    }
    next();
  } catch (error: any) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res
        .status(401)
        .json({
          error: "Unauthorized: Token expired or invalid",
          details: error.message,
        });
    }

    console.error("Authentication error:", error);
    return res
      .status(500)
      .json({
        error:
          "Database connection failed. Please check MONGODB_URI in settings, ensure you replaced <password> with your actual database password.",
        details: error.message,
      });
  }
};
