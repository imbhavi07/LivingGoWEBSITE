import { type Prisma, RoomType, GenderPreference, PropertyStatus, UserStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getPagination } from "../utils/Pagination";

const adminPropertyInclude = {
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true
    }
  },
  images: {
    select: {
      id: true,
      url: true,
      publicId: true
    }
  }
};

export async function getAdminStats() {
  const [totalUsers, totalProperties, pendingApprovals, approvedListings, pendingOwnerApprovals] = await prisma.$transaction([
    prisma.user.count(),
    prisma.property.count(),
    prisma.property.count({ where: { status: "pending" } }),
    prisma.property.count({ where: { status: "approved" } }),
    prisma.user.count({ where: { role: "owner", verificationStatus: "pending_approval" } })
  ]);

  return { totalUsers, totalProperties, pendingApprovals, approvedListings, pendingOwnerApprovals };
}

export async function getSubmittedProperties(query: Record<string, unknown>) {
  const { page, limit, skip } = getPagination(query);
  const search = query.search ? String(query.search) : undefined;
  const status = (query.status as PropertyStatus | undefined) ?? "pending";
  const where: Prisma.PropertyWhereInput = {
    status,
    OR: search
      ? [
          { title: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
          { owner: { name: { contains: search, mode: "insensitive" } } },
          { owner: { email: { contains: search, mode: "insensitive" } } }
        ]
      : undefined
  };

  const [items, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      include: adminPropertyInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.property.count({ where })
  ]);

  return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

export async function moderateProperty(id: string, status: Extract<PropertyStatus, "approved" | "rejected">) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError("Property not found", 404);

  return prisma.property.update({
    where: { id },
    data: { status },
    include: adminPropertyInclude
  });
}

export async function removeListing(id: string) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError("Property not found", 404);
  await prisma.property.delete({ where: { id } });
}

export async function getUsers(query: Record<string, unknown>) {
  const { page, limit, skip } = getPagination(query);
  const search = query.search ? String(query.search) : undefined;
  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ]
      }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { properties: true, wishlist: true } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "admin") throw new AppError("Admin accounts cannot be suspended through this endpoint", 400);

  return prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });
}

export async function deleteSpamUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "admin") throw new AppError("Admin accounts cannot be deleted through this endpoint", 400);

  await prisma.user.delete({ where: { id } });
}
export async function updateListingByAdmin(id: string, input: Record<string, unknown>) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError("Property not found", 404);
 
  return prisma.property.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: String(input.title) }),
      ...(input.description !== undefined && { description: String(input.description) }),
      ...(input.price !== undefined && { price: Number(input.price) }),
      ...(input.priceSingle !== undefined && { priceSingle: Number(input.priceSingle) }),
      ...(input.priceDouble !== undefined && { priceDouble: Number(input.priceDouble) }),
      ...(input.priceTriple !== undefined && { priceTriple: Number(input.priceTriple) }),
      ...(input.location !== undefined && { location: String(input.location) }),
      ...(input.roomType !== undefined && { roomType: input.roomType as RoomType }),
      ...(input.preference !== undefined && { preference: input.preference as GenderPreference }),
      ...(input.mealPlan !== undefined && { mealPlan: String(input.mealPlan) }),  
      ...(input.mealTimes !== undefined && { mealTimes: input.mealTimes as string[] }),
      ...(input.curfewTime !== undefined && { curfewTime: String(input.curfewTime) }),
      ...(input.noticePeriod !== undefined && { noticePeriod: String(input.noticePeriod) }),
      ...(input.rulesStrictness !== undefined && { rulesStrictness: String(input.rulesStrictness) }),
      ...(input.facilities !== undefined && { facilities: input.facilities as string[] }),
    },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true } },
      images: { select: { id: true, url: true, publicId: true } },
    },
  });
}

export async function getUserProperties(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const properties = await prisma.property.findMany({
    where: { ownerId: userId },
    include: adminPropertyInclude,
    orderBy: { createdAt: "desc" },
  });

  return {
    user,
    properties,
  };
}

export async function addImagesToProperty(
  propertyId: string,
  images: { url: string; publicId?: string }[]
) {
  return prisma.property.update({
    where: { id: propertyId },
    data: {
      images: {
        create: images,
      },
    },
    include: {
      images: true,
    },
  });
}

export async function deletePropertyImage(
  imageId: string
) {
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId }
  });

  if (!image) {
    throw new AppError("Image not found", 404);
  }

  return prisma.propertyImage.delete({
    where: { id: imageId }
  });
}

export async function getAllProperties(query: Record<string, unknown>) {
  const search = query.search ? String(query.search) : "";

  return prisma.property.findMany({
    where: search
      ? {
          OR: [
            {
              propertyCode: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              location: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              owner: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {},
    include: {
      owner: true,
      images: true,

      _count: {
        select: {
          tenants: true,
          reviews: true,
          wishlistedBy: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPropertyManagement(id: string) {
  return prisma.property.findUnique({
    where: { id },

    include: {
      owner: true,

      images: true,

      panoramas: true,

      reviews: {
        include: {
          student: true,  
        },
      },

      wishlistedBy: true,

      tenants: {
        include: {
          student: true,
        },
      },

      tokenPayments: {
        include: {
          student: true,
        },
      },
    },
  });
}

export async function replacePropertyImage(
  imageId: string,
  url: string,
  publicId?: string
) {
  return prisma.propertyImage.update({
    where: { id: imageId },
    data: {
      url,
      publicId,
    },
  });
}