import { Router } from "express";
import { z } from "zod";
import { env } from "../env.js";
import { addFeedback, addRatingClick, listFeedback } from "../store/feedbackStore.js";
import { getRestaurantBySlug } from "../store/restaurantStore.js";

export const legacyRouter = Router();

const tenantSlugField = z.string().min(2).max(80).optional();

const incrementSchema = z.object({
  rating: z.number().int().min(1).max(5),
  tenantSlug: tenantSlugField,
});

const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  reason: z.string().min(1),
  comments: z.string().min(1),
  tenantSlug: tenantSlugField,
});

const getFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  tenantSlug: tenantSlugField,
});

async function resolveTenantSlug(slug?: string): Promise<string | null> {
  const tenantSlug = slug ?? env.DEFAULT_TENANT_SLUG;
  const restaurant = await getRestaurantBySlug(tenantSlug);
  return restaurant ? restaurant.slug : null;
}

legacyRouter.post("/incrementRating", async (req, res) => {
  const parsed = incrementSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
    return;
  }

  const tenantSlug = await resolveTenantSlug(parsed.data.tenantSlug);
  if (!tenantSlug) {
    res.status(404).json({ error: "NOT_FOUND", message: "Restaurant not found" });
    return;
  }

  addRatingClick(tenantSlug, parsed.data.rating);
  res.json({ ok: true });
});

legacyRouter.post("/submitFeedback", async (req, res) => {
  const parsed = submitFeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
    return;
  }

  const tenantSlug = await resolveTenantSlug(parsed.data.tenantSlug);
  if (!tenantSlug) {
    res.status(404).json({ error: "NOT_FOUND", message: "Restaurant not found" });
    return;
  }

  const entry = addFeedback(tenantSlug, {
    rating: parsed.data.rating,
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    reason: parsed.data.reason,
    comments: parsed.data.comments,
  });

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

  const tenantSlug = await resolveTenantSlug(parsed.data.tenantSlug);
  if (!tenantSlug) {
    res.status(404).json({ error: "NOT_FOUND", message: "Restaurant not found" });
    return;
  }

  const entries = listFeedback(tenantSlug, parsed.data.rating).map(({ tenantSlug: _slug, ...entry }) => entry);
  res.json({ entries });
});
