import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

type AuthClaims = {
  sub: string;
  tenantId: string;
  role: string;
};

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthClaims;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Missing bearer token" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    req.auth = jwt.verify(token, env.JWT_SECRET) as AuthClaims;
    next();
  } catch {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid token" });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "No auth context" });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ error: "FORBIDDEN", message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
