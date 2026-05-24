import { getSession, requireRole } from "@/lib/auth";
import { jsonOk, unauthorized } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, "CLIENT") || !session.clientId) return unauthorized();

  const clientId = session.clientId;

  const [scans, ratings, feedbackCount, recentFeedback, restaurants, ratingEvents] =
    await Promise.all([
      prisma.qrScan.count({ where: { clientId } }),
      prisma.ratingEvent.count({ where: { clientId } }),
      prisma.feedback.count({ where: { clientId } }),
      prisma.feedback.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { restaurant: { select: { restaurantName: true } } },
      }),
      prisma.restaurant.findMany({ where: { clientId } }),
      prisma.ratingEvent.findMany({ where: { clientId }, select: { rating: true } }),
    ]);

  const averageRating =
    ratingEvents.length > 0
      ? ratingEvents.reduce((sum, e) => sum + e.rating, 0) / ratingEvents.length
      : 0;

  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: ratingEvents.filter((e) => e.rating === star).length,
  }));

  const lowRatingCount = ratingEvents.filter((e) => e.rating <= 3).length;
  const highRatingCount = ratingEvents.filter((e) => e.rating >= 4).length;

  return jsonOk({
    scans,
    totalRatings: ratings,
    averageRating: Math.round(averageRating * 10) / 10,
    lowRatingCount,
    highRatingCount,
    feedbackCount,
    distribution,
    recentFeedback,
    restaurants,
  });
}
