import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

export async function getWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          images: { select: { id: true, url: true } },
          owner: { select: { id: true, name: true, phone: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function addToWishlist(userId: string, propertyId: string) {
  const property = await prisma.property.findFirst({ where: { id: propertyId, status: "approved" } });
  if (!property) throw new AppError("Property not found", 404);

  return prisma.wishlist.upsert({
    where: { userId_propertyId: { userId, propertyId } },
    update: {},
    create: { userId, propertyId }
  });
}

export async function removeFromWishlist(userId: string, propertyId: string) {
  await prisma.wishlist.deleteMany({ where: { userId, propertyId } });
}
