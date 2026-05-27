import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@LivingGo.com";
  const passwordHash = await bcrypt.hash("Admin@12345", 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: "admin", status: "active", passwordHash },
    create: {
      name: "LivingGo Admin",
      email,
      passwordHash,
      role: "admin"
    }
  });

  console.log("Seeded admin user:", email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
