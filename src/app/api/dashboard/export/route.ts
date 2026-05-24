import { getSession, requireRole } from "@/lib/auth";
import { unauthorized } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, "CLIENT") || !session.clientId) return unauthorized();

  const feedback = await prisma.feedback.findMany({
    where: { clientId: session.clientId },
    orderBy: { createdAt: "desc" },
    include: { restaurant: { select: { restaurantName: true } } },
  });

  const header = "Date,Restaurant,Rating,Name,Phone,Email,Message\n";
  const rows = feedback
    .map((f) => {
      const cols = [
        f.createdAt.toISOString(),
        f.restaurant.restaurantName,
        f.rating,
        f.customerName,
        f.customerPhone ?? "",
        f.customerEmail ?? "",
        (f.feedbackMessage ?? "").replace(/"/g, '""'),
      ];
      return cols.map((c) => `"${c}"`).join(",");
    })
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="feedback-export.csv"`,
    },
  });
}
