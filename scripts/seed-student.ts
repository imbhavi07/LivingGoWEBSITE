import { PrismaClient } from "../backend/node_modules/@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "semwalb3@gmail.com";

  await prisma.user.upsert({
    where: { email },
    update: { role: "student" },
    create: {
      name: "Test Student",
      email,
      passwordHash: "SEED_NO_PASSWORD",
      role: "student"
    }
  });

  console.log("Seeded/updated student user:", email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });