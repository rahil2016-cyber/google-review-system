import { getSession, requireRole } from "@/lib/auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  businessName: z.string().min(2).optional(),
  ownerName: z.string().min(2).optional(),
  plan: z.enum(["FREE", "STARTER", "PRO", "ENTERPRISE"]).optional(),
  status: z.enum(["ACTIVE", "LOCKED"]).optional(),
  googleReviewUrl: z.string().url().optional(),
  restaurantName: z.string().min(2).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!requireRole(session, "SUPER_ADMIN")) return unauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid update data");

  const client = await prisma.client.findUnique({
    where: { id },
    include: { restaurants: true },
  });
  if (!client) return jsonError("Client not found", 404);

  const updated = await prisma.client.update({
    where: { id },
    data: {
      businessName: parsed.data.businessName,
      ownerName: parsed.data.ownerName,
      plan: parsed.data.plan,
      status: parsed.data.status,
    },
    include: { restaurants: true, _count: { select: { feedback: true } } },
  });

  if (parsed.data.googleReviewUrl || parsed.data.restaurantName) {
    const restaurant = client.restaurants[0];
    if (restaurant) {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          googleReviewUrl: parsed.data.googleReviewUrl,
          restaurantName: parsed.data.restaurantName,
        },
      });
    }
  }

  return jsonOk({ client: { ...updated, passwordHash: undefined } });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!requireRole(session, "SUPER_ADMIN")) return unauthorized();

  const { id } = await params;
  await prisma.client.delete({ where: { id } });
  return jsonOk({ ok: true });
}
