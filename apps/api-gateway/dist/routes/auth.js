import { Router } from "express";
import { z } from "zod";
import { env } from "../env.js";
import { ensureUserForLogin, issueSessionTokens, revokeRefreshToken, rotateRefreshToken } from "../services/authService.js";
import { getOrCreateTenant } from "../services/tenantService.js";
export const authRouter = Router();
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    tenantSlug: z.string().min(1).optional(),
});
const refreshSchema = z.object({
    refreshToken: z.string().min(32),
});
authRouter.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
        return;
    }
    const tenant = await getOrCreateTenant(parsed.data.tenantSlug ?? env.DEFAULT_TENANT_SLUG, env.DEFAULT_TENANT_NAME);
    const identity = await ensureUserForLogin({
        tenantId: tenant.id,
        email: parsed.data.email,
    });
    const session = await issueSessionTokens({
        userId: identity.userId,
        tenantId: tenant.id,
        subject: parsed.data.email,
        role: identity.role,
    });
    res.json({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        refreshExpiresAt: session.refreshExpiresAt,
        tokenType: "Bearer",
        expiresIn: env.ACCESS_TOKEN_TTL,
        tenantId: tenant.id,
        role: identity.role,
    });
});
authRouter.post("/refresh", async (req, res) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
        return;
    }
    const rotated = await rotateRefreshToken(parsed.data.refreshToken);
    if (!rotated) {
        res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid refresh token" });
        return;
    }
    res.json(rotated);
});
authRouter.post("/logout", async (req, res) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
        return;
    }
    await revokeRefreshToken(parsed.data.refreshToken);
    res.status(204).send();
});
