import type { NextFunction, Request, Response } from "express";
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
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
export declare function requireRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
export {};
