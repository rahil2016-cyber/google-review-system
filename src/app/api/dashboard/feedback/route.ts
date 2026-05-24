import { getSession, requireRole } from "@/lib/auth";
import { jsonOk, unauthorized } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getSession();
  if (!requireRole(session, "CLIENT") || !session.clientId) return unauthorized();

  const { searchParams } = new URL(request.url);
  const rating = searchParams.get("rating");

  const feedback = await prisma.feedback.findMany({
    where: {
      clientId: session.clientId,
      ...(rating ? { rating: Number(rating) } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { restaurant: { select: { restaurantName: true } } },
  });

  return jsonOk({ feedback });
}
