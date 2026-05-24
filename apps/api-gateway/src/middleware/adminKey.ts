import type { NextFunction, Request, Response } from "express";

function expectedAdminKey(): string {
  return process.env.ADMIN_KEY ?? process.env.NEXT_PUBLIC_ADMIN_KEY ?? "";
}

export function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const expected = expectedAdminKey();
  if (!expected) {
    res.status(503).json({
      error: "ADMIN_KEY_NOT_CONFIGURED",
      message: "Set ADMIN_KEY or NEXT_PUBLIC_ADMIN_KEY in environment",
    });
    return;
  }

  const provided = req.header("x-admin-key");
  if (provided !== expected) {
    res.status(403).json({ error: "FORBIDDEN", message: "Invalid admin key" });
    return;
  }

  next();
}
