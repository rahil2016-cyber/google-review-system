import { jsonError, jsonOk } from "@/lib/api-utils";
import { sendLowRatingAlerts } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  uniqueCode: z.string().min(4),
  rating: z.number().int().min(1).max(3),
  customerName: z.string().min(1),
  customerPhone: z.string().min(6),
  customerEmail: z.string().email().optional().or(z.literal("")),
  feedbackMessage: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid feedback");

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [
        { uniqueCode: parsed.data.uniqueCode },
        { client: { uniqueCode: parsed.data.uniqueCode } },
      ],
      client: { status: "ACTIVE" },
    },
    include: { client: true },
  });

  if (!restaurant) return jsonError("Business not found", 404);

  const feedback = await prisma.feedback.create({
    data: {
      clientId: restaurant.clientId,
      restaurantId: restaurant.id,
      rating: parsed.data.rating,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      feedbackMessage: parsed.data.feedbackMessage,
    },
  });

  await sendLowRatingAlerts({
    businessName: restaurant.client.businessName,
    restaurantName: restaurant.restaurantName,
    rating: parsed.data.rating,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    customerEmail: parsed.data.customerEmail,
    feedbackMessage: parsed.data.feedbackMessage,
  });

  return jsonOk({ ok: true, id: feedback.id }, 201);
}
