import type { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    tenantId?: string;
  }
}

export function attachTenant(req: Request, _res: Response, next: NextFunction): void {
  req.tenantId = req.auth?.tenantId ?? req.header("x-tenant-id") ?? undefined;
  next();
}
