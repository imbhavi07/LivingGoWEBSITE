import { PrismaClient } from "@prisma/client";

declare const process: { exit(code: number): never };

const prisma = new PrismaClient();

async function main() {
  const email = "semwalb3@gmail.com";

  await prisma.user.upsert({
  where: { email },
  update: { role: "student" },
  create: {
    name: "Test Student",
    email,
    role: "student",
    passwordHash: "dummy_hashed_password_123" // isko baad mein change karna, yeh sirf testing ke liye hai!
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