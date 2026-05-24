import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateUniqueCode } from "../src/lib/codes";

const prisma = new PrismaClient();

async function main() {
  const superEmail = process.env.SUPER_ADMIN_EMAIL ?? "admin@reviewfunnel.com";
  const superPassword = process.env.SUPER_ADMIN_PASSWORD ?? "Admin@12345";

  await prisma.superAdmin.upsert({
    where: { email: superEmail },
    update: {},
    create: {
      name: "Platform Admin",
      email: superEmail,
      passwordHash: await bcrypt.hash(superPassword, 12),
    },
  });

  const demoEmail = "demo@business.com";
  const existing = await prisma.client.findUnique({ where: { email: demoEmail } });
  if (!existing) {
    const uniqueCode = generateUniqueCode(8);
    const client = await prisma.client.create({
      data: {
        businessName: "Sarovar Royalee",
        ownerName: "Demo Owner",
        email: demoEmail,
        passwordHash: await bcrypt.hash("Demo@12345", 12),
        uniqueCode,
        plan: "STARTER",
        status: "ACTIVE",
      },
    });

    await prisma.restaurant.create({
      data: {
        clientId: client.id,
        restaurantName: "Sarovar Royalee Main",
        googleReviewUrl:
          "https://search.google.com/local/writereview?placeid=ChIJ99ara24lujsRDWlTUaI-h9A",
        uniqueCode: generateUniqueCode(8),
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Super admin: ${superEmail} / ${superPassword}`);
  console.log("Demo client: demo@business.com / Demo@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
