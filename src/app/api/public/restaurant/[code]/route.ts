import { jsonError, jsonOk } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ code: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { code } = await params;

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [{ uniqueCode: code }, { client: { uniqueCode: code } }],
      client: { status: "ACTIVE" },
    },
    include: {
      client: { select: { businessName: true, status: true } },
    },
  });

  if (!restaurant || restaurant.client.status !== "ACTIVE") {
    return jsonError("Business not found", 404);
  }

  await prisma.qrScan.create({
    data: { clientId: restaurant.clientId, restaurantId: restaurant.id },
  });

  return jsonOk({
    restaurant: {
      id: restaurant.id,
      name: restaurant.restaurantName,
      googleReviewUrl: restaurant.googleReviewUrl,
      uniqueCode: restaurant.uniqueCode,
      businessName: restaurant.client.businessName,
    },
  });
}
