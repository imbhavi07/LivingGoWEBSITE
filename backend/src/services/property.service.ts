import type { GenderPreference, Prisma, PropertyStatus, Role, RoomType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getPagination } from "../utils/pagination";
import { findNearbyPlaces } from "./nearby.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// let cachedProperties: any = null;
// let cacheTimestamp = 0;

type PropertyInput = {
  title: string;
  description: string;
  price: number;
  priceSingle?: number;
  bedsSingle?: number;
  priceDouble?: number;
  bedsDouble?: number;
  priceTriple?: number;
  bedsTriple?: number;
  securityDepositMonths?: string;
  location: string;
  lat?: number;
  lng?: number;
  roomType: RoomType;
  sharedType?: string;
  preference: GenderPreference;
  mealPlan?: string;
  mealTimes?: string[];
  curfewTime?: string;
  noticePeriod?: string;
  rulesStrictness?: string;
  facilities: string[];
  managerContact?: string;
  securityContact?: string;
};

type ImageInput = {
  url: string;
  publicId?: string;
  roomCategory?: string;
};

const propertyInclude = {
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
  },
  panoramas: {
    select: {
      id: true,
      title: true,
      imageUrl: true,
      sortOrder: true
    },
    orderBy: {
      sortOrder: "asc" as const
    }
  }
} satisfies Prisma.PropertyInclude;

export async function createProperty(ownerId: string, input: PropertyInput, images: ImageInput[]) {
  // Calculate nearby places if coordinates provided
  let nearbyPlaces = undefined;
  if (input.lat && input.lng) {
    try {
      nearbyPlaces = await findNearbyPlaces(
        input.lat,
        input.lng,
        input.preference === "Any" ? "Any" : input.preference,
        input.location
      );
    } catch (err) {
      console.error("Nearby places calculation failed:", err);
      // Don't fail property creation if nearby places fails
    }
  }

  const calculatedPrice = Math.min(
    ...[
      input.priceSingle,
      input.priceDouble,
      input.priceTriple,
    ].filter((v): v is number => typeof v === "number" && v > 0)
  );

  return prisma.property.create({
    data: {
      ownerId,
      title: input.title,
      description: input.description,
      price: calculatedPrice,
      priceSingle: input.priceSingle,
      bedsSingle: input.bedsSingle,
      priceDouble: input.priceDouble,
      bedsDouble: input.bedsDouble,
      priceTriple: input.priceTriple,
      bedsTriple: input.bedsTriple,
      securityDepositMonths: input.securityDepositMonths,
      location: input.location,
      lat: input.lat,
      lng: input.lng,
      nearbyPlaces: nearbyPlaces ?? undefined,
      roomType: input.roomType,
      sharedType: input.sharedType,
      preference: input.preference,
      mealPlan: input.mealPlan,
      mealTimes: input.mealTimes ?? [],
      curfewTime: input.curfewTime,
      noticePeriod: input.noticePeriod,
      rulesStrictness: input.rulesStrictness,
      facilities: input.facilities,
      managerContact: input.managerContact,
      securityContact: input.securityContact,
      status: "pending",
      images: {
        create: images.map((image) => ({ url: image.url, publicId: image.publicId, roomCategory: image.roomCategory }))
      }
    },
    include: propertyInclude
  });
}

const propertyCardInclude = {
  images: {
    select: {
      url: true
    },
    take: 1
  }
} satisfies Prisma.PropertyInclude;

export async function getProperties(query: Record<string, unknown>, viewerRole?: Role) {
  const { page, limit, skip } = getPagination(query);
  const status = query.status as PropertyStatus | undefined;
  const where: Prisma.PropertyWhereInput = {
    status: viewerRole === "admin" ? status : "approved",
    location: query.location ? { contains: String(query.location), mode: "insensitive" } : undefined,
    roomType: query.roomType as RoomType | undefined,
    preference: query.preference as GenderPreference | undefined
  };

  // if (
  //   !viewerRole &&
  //   cachedProperties &&
  //   Date.now() - cacheTimestamp < 60000
  // ) {
  //   return cachedProperties;
  // }

  const [items, total] = await prisma.$transaction([
  prisma.property.findMany({
    where,
    include: propertyCardInclude,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit
  }),
  prisma.property.count({ where })
]);

const result = {
  items,
  meta: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  }
};

// if (!viewerRole) {
//   cachedProperties = result;
//   cacheTimestamp = Date.now();
// }

return result;
}

export async function getPropertyById(id: string, viewerRole?: Role) {
  const property = await prisma.property.findFirst({
    where: {
      id,
      ...(viewerRole === "admin" ? {} : { status: "approved" })
    },
    include: propertyInclude
  });

  if (!property) throw new AppError("Property not found", 404);
  return property;
}

export async function updateProperty(id: string, actorId: string, actorRole: Role, input: Partial<PropertyInput>) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError("Property not found", 404);
  if (actorRole !== "admin" && property.ownerId !== actorId) throw new AppError("Forbidden", 403);

  // Recalculate nearby places if coordinates changed
  let nearbyPlaces = undefined;
  if (input.lat && input.lng) {
    try {
      nearbyPlaces = await findNearbyPlaces(
        input.lat,
        input.lng,
        (input.preference ?? property.preference) === "Any" ? "Any" : (input.preference ?? property.preference),
        input.location ?? property.location
      );
    } catch (err) {
      console.error("Nearby places recalculation failed:", err);
    }
  }

  const calculatedPrice = Math.min(
    ...[
      input.priceSingle,
      input.priceDouble,
      input.priceTriple,
    ].filter((v): v is number => typeof v === "number" && v > 0)
  );

  return prisma.property.update({
    where: { id },
    data: {
      ...input,
      price: calculatedPrice,
      ...(nearbyPlaces ? { nearbyPlaces } : {}),
      status: actorRole === "admin" ? property.status : "pending",
      managerContact: input.managerContact,
      securityContact: input.securityContact
    },
    include: propertyInclude
  });
}

export async function deleteProperty(id: string, actorId: string, actorRole: Role) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError("Property not found", 404);
  if (actorRole !== "admin" && property.ownerId !== actorId) throw new AppError("Forbidden", 403);

  await prisma.property.delete({ where: { id } });
}

export async function createReview(
  studentId: string,
  propertyId: string,
  body: {
    cleanliness: number;
    food: number;
    security: number;
    management: number;
    location: number;
    comment?: string;
  }
) {
  // Validate all ratings are 1-5
  const fields = ["cleanliness", "food", "security", "management", "location"] as const;
  for (const field of fields) {
    const val = body[field];
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      throw new AppError(`${field} must be an integer between 1 and 5`, 400);
    }
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404);

  // Upsert: one review per student per property (@@unique constraint)
  const review = await prisma.review.upsert({
    where: { studentId_propertyId: { studentId, propertyId } },
    update: { ...body },
    create: { studentId, propertyId, ...body },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  return review;
}

export async function markResidence(studentId: string, propertyId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404);

  // Calculate total beds
  const totalBeds =
    (property.bedsSingle ?? 0) +
    (property.bedsDouble ?? 0) +
    (property.bedsTriple ?? 0);

  // Check for existing residence (student can only live in one place)
  const existing = await prisma.tenantResidence.findUnique({
    where: { studentId },
  });

  // Guard: already in same property — check before transaction
  if (existing && existing.propertyId === propertyId) {
    throw new AppError("You are already marked as a tenant here", 400);
  }

  await prisma.$transaction(async (tx) => {
    if (existing) {
      // Free up a bed in old property
      await tx.property.update({
        where: { id: existing.propertyId },
        data: { occupiedBeds: { decrement: 1 } },
      });
      // Update residence to new property
      await tx.tenantResidence.update({
        where: { studentId },
        data: { propertyId },
      });
    } else {
      // Check capacity only for new residents
      if (totalBeds > 0 && property.occupiedBeds >= totalBeds) {
        throw new AppError("This property is at full capacity", 400);
      }
      await tx.tenantResidence.create({ data: { studentId, propertyId } });
    }

    // Increment occupiedBeds in new property
    await tx.property.update({
      where: { id: propertyId },
      data: { occupiedBeds: { increment: 1 } },
    });
  });

  // Return updated property snapshot
  const updated = await prisma.property.findUnique({ where: { id: propertyId } });
  return {
    propertyId,
    occupiedBeds: updated!.occupiedBeds,
    totalBeds,
    availableBeds: Math.max(0, totalBeds - updated!.occupiedBeds),
  };
}

export async function getStudentResidence(studentId: string) {
  const residence = await prisma.tenantResidence.findUnique({
    where: { studentId },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          bedsSingle: true,
          bedsDouble: true,
          bedsTriple: true,
          occupiedBeds: true,
        },
      },
    },
  });

  if (!residence) return null;

  const p = residence.property;
  const totalBeds = (p.bedsSingle ?? 0) + (p.bedsDouble ?? 0) + (p.bedsTriple ?? 0);

  return {
    propertyId: p.id,
    propertyTitle: p.title,
    location: p.location,
    occupiedBeds: p.occupiedBeds,
    totalBeds,
    availableBeds: Math.max(0, totalBeds - p.occupiedBeds),
  };
}

export async function getPropertyRating(propertyId: string) {
  const agg = await prisma.review.aggregate({
    where: { propertyId },
    _avg: {
      cleanliness: true,
      food: true,
      security: true,
      management: true,
      location: true,
    },
    _count: { id: true },
  });

  const avg = agg._avg;
  const fields = [avg.cleanliness, avg.food, avg.security, avg.management, avg.location];
  const defined = fields.filter((v) => v !== null) as number[];
  const overall = defined.length > 0 ? defined.reduce((a, b) => a + b, 0) / defined.length : null;

  return {
    overall: overall ? Math.round(overall * 10) / 10 : null,
    cleanliness: avg.cleanliness ? Math.round(avg.cleanliness * 10) / 10 : null,
    food: avg.food ? Math.round(avg.food * 10) / 10 : null,
    security: avg.security ? Math.round(avg.security * 10) / 10 : null,
    management: avg.management ? Math.round(avg.management * 10) / 10 : null,
    location: avg.location ? Math.round(avg.location * 10) / 10 : null,
    count: agg._count.id,
  };
}

export async function getPropertyReviews(propertyId: string) {
  return prisma.review.findMany({
    where: { propertyId },
    include: {
      student: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function togglePropertyStatus(id: string, ownerId: string, isActive: boolean) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError("Property not found", 404);
  if (property.ownerId !== ownerId) throw new AppError("Forbidden", 403);

  return prisma.property.update({
    where: { id },
    data: { status: isActive ? "pending" : "inactive" },
    include: propertyInclude
  });
}

export async function getOwnerProperties(ownerId: string, query: Record<string, unknown>) {
  const { page, limit, skip } = getPagination(query);
  const where: Prisma.PropertyWhereInput = { ownerId };

  const [items, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      include: propertyInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.property.count({ where })
  ]);

  return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

export async function getOwnerStats(ownerId: string) {
  const [totalListings, activeListings, pendingListings] = await prisma.$transaction([
    prisma.property.count({ where: { ownerId } }),
    prisma.property.count({ where: { ownerId, status: "approved" } }),
    prisma.property.count({ where: { ownerId, status: "pending" } })
  ]);

  return { totalListings, activeListings, pendingListings };
}

export async function getApprovedPropertyList() {
  return prisma.property.findMany({
    where: {
      status: "approved",
    },
    include: propertyInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export const getFeaturedProperty = async () => {
  return await prisma.property.findFirst({
    where: {
      isFeatured: true,
      status: "approved" // Safety check
    },
    include: {
      images: true, // Keep the images so the frontend can display the cover photo
    }
  });
};