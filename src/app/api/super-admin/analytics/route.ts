import { getSession, requireRole } from "@/lib/auth";
import { jsonOk, unauthorized } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, "SUPER_ADMIN")) return unauthorized();

  const [totalClients, activeClients, lockedClients, totalFeedback, totalScans, totalRatings] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "ACTIVE" } }),
      prisma.client.count({ where: { status: "LOCKED" } }),
      prisma.feedback.count(),
      prisma.qrScan.count(),
      prisma.ratingEvent.count(),
    ]);

  const planBreakdown = await prisma.client.groupBy({
    by: ["plan"],
    _count: { plan: true },
  });

  const recentFeedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      client: { select: { businessName: true } },
      restaurant: { select: { restaurantName: true } },
    },
  });

  return jsonOk({
    totals: {
      clients: totalClients,
      activeClients,
      lockedClients,
      feedback: totalFeedback,
      scans: totalScans,
      ratings: totalRatings,
    },
    planBreakdown,
    recentFeedback,
  });
}
