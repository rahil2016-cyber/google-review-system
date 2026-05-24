import { getSession, requireRole } from "@/lib/auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-utils";
import { buildPublicRatingUrl, generateUniqueCode } from "@/lib/codes";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  plan: z.enum(["FREE", "STARTER", "PRO", "ENTERPRISE"]).default("FREE"),
  restaurantName: z.string().min(2),
  googleReviewUrl: z.string().url(),
});

export async function GET() {
  const session = await getSession();
  if (!requireRole(session, "SUPER_ADMIN")) return unauthorized();

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      restaurants: true,
      _count: { select: { feedback: true, ratingEvents: true, scans: true } },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return jsonOk({
    clients: clients.map((c) => ({
      ...c,
      passwordHash: undefined,
      publicUrl: c.restaurants[0]
        ? buildPublicRatingUrl(c.restaurants[0].uniqueCode, appUrl)
        : buildPublicRatingUrl(c.uniqueCode, appUrl),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!requireRole(session, "SUPER_ADMIN")) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid data");

  const existing = await prisma.client.findUnique({ where: { email: parsed.data.email } });
  if (existing) return jsonError("Email already registered", 409);

  let clientCode = generateUniqueCode(8);
  while (await prisma.client.findUnique({ where: { uniqueCode: clientCode } })) {
    clientCode = generateUniqueCode(8);
  }

  let restaurantCode = generateUniqueCode(8);
  while (await prisma.restaurant.findUnique({ where: { uniqueCode: restaurantCode } })) {
    restaurantCode = generateUniqueCode(8);
  }

  const client = await prisma.client.create({
    data: {
      businessName: parsed.data.businessName,
      ownerName: parsed.data.ownerName,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      uniqueCode: clientCode,
      plan: parsed.data.plan,
      restaurants: {
        create: {
          restaurantName: parsed.data.restaurantName,
          googleReviewUrl: parsed.data.googleReviewUrl,
          uniqueCode: restaurantCode,
        },
      },
    },
    include: { restaurants: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  return jsonOk(
    {
      client: {
        ...client,
        passwordHash: undefined,
        publicUrl: buildPublicRatingUrl(client.restaurants[0]!.uniqueCode, appUrl),
      },
    },
    201,
  );
}
