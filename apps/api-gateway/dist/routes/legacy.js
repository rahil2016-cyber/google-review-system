import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { env } from "../env.js";
import { getOrCreateTenant } from "../services/tenantService.js";
export const legacyRouter = Router();
const incrementSchema = z.object({
    rating: z.number().int().min(1).max(5),
});
const submitFeedbackSchema = z.object({
    rating: z.number().int().min(1).max(5),
    name: z.string().min(1),
    phone: z.string().min(6),
    email: z.string().email().optional(),
    reason: z.string().min(1),
    comments: z.string().min(1),
});
const getFeedbackSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
});
legacyRouter.post("/incrementRating", async (req, res) => {
    const parsed = incrementSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
        return;
    }
    const tenant = await getOrCreateTenant(env.DEFAULT_TENANT_SLUG, env.DEFAULT_TENANT_NAME);
    await prisma.activityLog.create({
        data: {
            tenantId: tenant.id,
            activityType: "LEGACY_RATING_CLICK",
            metadata: { rating: parsed.data.rating },
        },
    });
    res.json({ ok: true });
});
legacyRouter.post("/submitFeedback", async (req, res) => {
    const parsed = submitFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
        return;
    }
    const tenant = await getOrCreateTenant(env.DEFAULT_TENANT_SLUG, env.DEFAULT_TENANT_NAME);
    const existingCustomer = await prisma.customer.findFirst({
        where: {
            tenantId: tenant.id,
            phone: parsed.data.phone,
            deletedAt: null,
        },
    });
    const customer = existingCustomer ??
        (await prisma.customer.create({
            data: {
                tenantId: tenant.id,
                firstName: parsed.data.name,
                email: parsed.data.email,
                phone: parsed.data.phone,
                tags: [],
            },
        }));
    const review = await prisma.review.create({
        data: {
            tenantId: tenant.id,
            customerId: customer.id,
            source: "MANUAL",
            rating: parsed.data.rating,
            reviewText: `Reason: ${parsed.data.reason}\nComments: ${parsed.data.comments}`,
            status: "NEW",
        },
    });
    const entry = {
        ...parsed.data,
        timestamp: review.createdAt.toISOString(),
    };
    res.status(201).json({ ok: true, entry });
});
legacyRouter.post("/getFeedback", async (req, res) => {
    const adminKeyHeader = req.header("x-admin-key");
    const expectedAdminKey = process.env.NEXT_PUBLIC_ADMIN_KEY ?? process.env.ADMIN_KEY ?? "";
    if (expectedAdminKey && adminKeyHeader !== expectedAdminKey) {
        res.status(403).json({ error: "FORBIDDEN", message: "Invalid admin key" });
        return;
    }
    const parsed = getFeedbackSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
        return;
    }
    const tenant = await getOrCreateTenant(env.DEFAULT_TENANT_SLUG, env.DEFAULT_TENANT_NAME);
    const ratingFilter = parsed.data.rating;
    const reviews = await prisma.review.findMany({
        where: {
            tenantId: tenant.id,
            rating: ratingFilter ?? { lte: 3 },
        },
        include: {
            customer: true,
        },
        orderBy: { createdAt: "desc" },
        take: 200,
    });
    const entries = reviews.map((review) => {
        const text = review.reviewText ?? "";
        const reasonMatch = text.match(/Reason:\s*(.*)/);
        const commentsMatch = text.match(/Comments:\s*([\s\S]*)$/);
        return {
            rating: review.rating,
            name: review.customer?.firstName ?? "Guest",
            phone: review.customer?.phone ?? "N/A",
            email: review.customer?.email ?? undefined,
            reason: reasonMatch?.[1]?.trim() || "Other",
            comments: commentsMatch?.[1]?.trim() || "",
            timestamp: review.createdAt.toISOString(),
        };
    });
    res.json({ entries });
});
