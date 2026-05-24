import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid email or password");

  const { email, password } = parsed.data;

  const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });
  if (superAdmin && (await verifyPassword(password, superAdmin.passwordHash))) {
    const token = await createSessionToken({
      sub: superAdmin.id,
      role: "SUPER_ADMIN",
      email: superAdmin.email,
      name: superAdmin.name,
    });
    await setSessionCookie(token);
    return jsonOk({ role: "SUPER_ADMIN", name: superAdmin.name, email: superAdmin.email });
  }

  const client = await prisma.client.findUnique({ where: { email } });
  if (!client) return jsonError("Invalid credentials", 401);
  if (client.status === "LOCKED") return jsonError("Account locked. Contact support.", 403);
  if (!(await verifyPassword(password, client.passwordHash))) {
    return jsonError("Invalid credentials", 401);
  }

  const token = await createSessionToken({
    sub: client.id,
    role: "CLIENT",
    email: client.email,
    name: client.ownerName,
    clientId: client.id,
  });
  await setSessionCookie(token);
  return jsonOk({
    role: "CLIENT",
    name: client.ownerName,
    email: client.email,
    clientId: client.id,
    businessName: client.businessName,
  });
}
