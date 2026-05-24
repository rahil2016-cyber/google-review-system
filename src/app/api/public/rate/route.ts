import { jsonError, jsonOk } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  uniqueCode: z.string().min(4),
  rating: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid rating data");

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [
        { uniqueCode: parsed.data.uniqueCode },
        { client: { uniqueCode: parsed.data.uniqueCode } },
      ],
      client: { status: "ACTIVE" },
    },
  });

  if (!restaurant) return jsonError("Business not found", 404);

  await prisma.ratingEvent.create({
    data: {
      clientId: restaurant.clientId,
      restaurantId: restaurant.id,
      rating: parsed.data.rating,
    },
  });

  return jsonOk({
    rating: parsed.data.rating,
    redirectToGoogle: parsed.data.rating >= 4,
    googleReviewUrl: restaurant.googleReviewUrl,
    restaurantId: restaurant.id,
    clientId: restaurant.clientId,
  });
}
