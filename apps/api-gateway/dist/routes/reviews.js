import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
export const reviewsRouter = Router();
const createReviewSchema = z.object({
    branchId: z.string().min(1),
    customerId: z.string().optional(),
    rating: z.number().int().min(1).max(5),
    reviewText: z.string().optional(),
    source: z.enum(["GOOGLE", "MANUAL", "QR", "NFC", "WHATSAPP"]).default("MANUAL"),
});
reviewsRouter.get("/", requireAuth, (req, res) => {
    res.json({
        tenantId: req.tenantId,
        items: [],
        total: 0,
    });
});
reviewsRouter.post("/", requireAuth, (req, res) => {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
        return;
    }
    res.status(201).json({
        id: randomUUID(),
        tenantId: req.tenantId,
        ...parsed.data,
        createdAt: new Date().toISOString(),
    });
});
