import type { NextFunction, Request, Response } from "express";
declare module "express-serve-static-core" {
    interface Request {
        tenantId?: string;
    }
}
export declare function attachTenant(req: Request, _res: Response, next: NextFunction): void;
