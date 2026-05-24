import { Router } from "express";
import { z } from "zod";
import { requireAdminKey } from "../middleware/adminKey.js";
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurantBySlug,
  listRestaurants,
} from "../store/restaurantStore.js";

export const restaurantsRouter = Router();

const createSchema = z.object({
  name: z.string().min(2).max(120),
  googleReviewUrl: z.string().url(),
  slug: z.string().min(2).max(80).optional(),
});

restaurantsRouter.get("/", requireAdminKey, async (_req, res) => {
  const restaurants = await listRestaurants();
  res.json({ restaurants });
});

restaurantsRouter.post("/", requireAdminKey, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
    return;
  }

  const restaurant = await createRestaurant(parsed.data);
  res.status(201).json({ restaurant });
});

restaurantsRouter.get("/:slug", async (req, res) => {
  const restaurant = await getRestaurantBySlug(req.params.slug);
  if (!restaurant) {
    res.status(404).json({ error: "NOT_FOUND", message: "Restaurant not found" });
    return;
  }

  res.json({ restaurant });
});

restaurantsRouter.delete("/:slug", requireAdminKey, async (req, res) => {
  const removed = await deleteRestaurant(req.params.slug);
  if (!removed) {
    res.status(404).json({ error: "NOT_FOUND", message: "Restaurant not found" });
    return;
  }

  res.status(204).send();
});
