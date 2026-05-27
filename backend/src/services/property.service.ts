import type { GenderPreference, Prisma, PropertyStatus, Role, RoomType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getPagination } from "../utils/pagination";
import { findNearbyPlaces } from "./nearby.service";

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
};

type ImageInput = {
  url: string;
  publicId?: string;
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
  }
};

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

  return prisma.property.create({
    data: {
      ownerId,
      title: input.title,
      description: input.description,
      price: input.price,
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
      status: "pending",
      images: {
        create: images.map((image) => ({ url: image.url, publicId: image.publicId }))
      }
    },
    include: propertyInclude
  });
}

export async function getProperties(query: Record<string, unknown>, viewerRole?: Role) {
  const { page, limit, skip } = getPagination(query);
  const status = query.status as PropertyStatus | undefined;
  const where: Prisma.PropertyWhereInput = {
    status: viewerRole === "admin" ? status : "approved",
    location: query.location ? { contains: String(query.location), mode: "insensitive" } : undefined,
    roomType: query.roomType as RoomType | undefined,
    preference: query.preference as GenderPreference | undefined
  };

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

  return prisma.property.update({
    where: { id },
    data: {
      ...input,
      ...(nearbyPlaces ? { nearbyPlaces } : {}),
      status: actorRole === "admin" ? property.status : "pending"
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
