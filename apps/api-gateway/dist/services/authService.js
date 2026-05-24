import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../env.js";
function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
function resolveRole(email) {
    if (email.includes("owner") || email.includes("admin"))
        return "BUSINESS_ADMIN";
    return "STAFF";
}
export async function ensureUserForLogin(input) {
    const existing = await prisma.user.findUnique({
        where: {
            tenantId_email: {
                tenantId: input.tenantId,
                email: input.email,
            },
        },
        include: {
            userRoles: {
                include: {
                    role: true,
                },
                take: 1,
            },
        },
    });
    if (existing) {
        const role = existing.userRoles[0]?.role.name ?? resolveRole(input.email);
        return { userId: existing.id, role };
    }
    const created = await prisma.user.create({
        data: {
            tenantId: input.tenantId,
            email: input.email,
            fullName: input.email.split("@")[0] || "User",
            status: "ACTIVE",
        },
    });
    return { userId: created.id, role: resolveRole(input.email) };
}
export async function issueSessionTokens(input) {
    const accessToken = jwt.sign({ sub: input.subject, tenantId: input.tenantId, role: input.role, uid: input.userId }, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
    const refreshTokenPlain = randomBytes(48).toString("hex");
    const refreshTokenHash = hashToken(refreshTokenPlain);
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
        data: {
            userId: input.userId,
            tokenHash: refreshTokenHash,
            expiresAt,
        },
    });
    return {
        accessToken,
        refreshToken: refreshTokenPlain,
        refreshExpiresAt: expiresAt.toISOString(),
    };
}
export async function rotateRefreshToken(refreshToken) {
    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });
    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
        return null;
    }
    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
    });
    const role = resolveRole(tokenRecord.user.email);
    const next = await issueSessionTokens({
        userId: tokenRecord.user.id,
        tenantId: tokenRecord.user.tenantId,
        subject: tokenRecord.user.email,
        role,
    });
    return {
        ...next,
        tokenType: "Bearer",
        expiresIn: env.ACCESS_TOKEN_TTL,
    };
}
export async function revokeRefreshToken(refreshToken) {
    const tokenHash = hashToken(refreshToken);
    const tokenRecord = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!tokenRecord)
        return;
    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
    });
}
