import { getSession } from "@/lib/auth";
import { jsonOk, unauthorized } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  if (session.role === "SUPER_ADMIN") {
    return jsonOk({ role: session.role, name: session.name, email: session.email });
  }

  const client = await prisma.client.findUnique({
    where: { id: session.clientId },
    select: {
      id: true,
      businessName: true,
      ownerName: true,
      email: true,
      uniqueCode: true,
      plan: true,
      status: true,
    },
  });

  if (!client || client.status === "LOCKED") return unauthorized("Account locked");

  return jsonOk({
    role: session.role,
    name: session.name,
    email: session.email,
    client,
  });
}
