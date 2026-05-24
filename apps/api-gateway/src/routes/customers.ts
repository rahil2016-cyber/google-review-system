import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";

export const customersRouter = Router();

const createCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  branchId: z.string().optional(),
});

customersRouter.get("/", requireAuth, (req, res) => {
  res.json({
    tenantId: req.tenantId,
    items: [],
    total: 0,
  });
});

customersRouter.post("/", requireAuth, (req, res) => {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
    return;
  }

  res.status(201).json({
    id: `cus_${Date.now()}`,
    tenantId: req.tenantId,
    ...parsed.data,
  });
});
