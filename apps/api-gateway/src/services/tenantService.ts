import { prisma } from "../lib/prisma.js";

export async function getOrCreateTenant(slug: string, name?: string) {
  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) return existing;

  return prisma.tenant.create({
    data: {
      slug,
      name: name ?? slug,
      timezone: "UTC",
      status: "ACTIVE",
    },
  });
}
