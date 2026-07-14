import type { GenderPreference, ListingSource, Prisma, PropertyStatus, Role, RoomType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getPagination } from "../utils/Pagination";
import { findNearbyPlaces } from "./nearby.service";
import { PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";

type CacheEntry = {
  // Use unknown to avoid allowing arbitrary operations on cached values
  value: unknown;
  timestamp: number;
};
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60000;

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
  source?: ListingSource; // Make source optional to allow override
  manualOwnerName?: string; // For manually listed properties
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

function getLocationCode(location: string) {
  const value = location.toLowerCase();

  if (value.includes("vijay nagar")) return "VN";
  if (value.includes("mp nagar")) return "MP";
  if (value.includes("arera")) return "AR"; 
  if (value.includes("indrapuri")) return "IN";
  if (value.includes("kolar")) return "KO";
  if (value.includes("malka ganj")) return "MG";
  if (value.includes("shakti nagar")) return "SN";
  if (value.includes("roop nagar")) return "RN";
  if (value.includes("kamla nagar")) return "KM";
  if (value.includes("nehru nagar")) return "NN";

  return "OT";
}

function getPreferenceCode(preference: GenderPreference) {
  switch (preference) {
    case "Boys":
      return "B";

    case "Girls":
      return "G";

    default:
      return "N/A";
  }
}  

async function generatePropertyCode(
  location: string,
  preference: GenderPreference
) {
  const area = getLocationCode(location);
  const gender = getPreferenceCode(preference);

  while (true) {
    const random = Math.floor(
      100000 + Math.random() * 900000
    );

    const code = `${area}-${gender}-${random}`;

    const exists = await prisma.property.findFirst({
      where: {
        propertyCode: code,
      },
    });

    if (!exists) {
      return code;
    }
  }
}

export async function createProperty(ownerId: string | null, input: PropertyInput, images: ImageInput[]) {
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

  const propertyCode = await generatePropertyCode(
    input.location,
    input.preference
  );

  // Determine source - use provided value or default based on ownerId
  const sourceToUse = input.source ?? (ownerId === null ? "LISTED" : "ONBOARDED");

  return prisma.property.create({
    data: {
      propertyCode,
      ownerId, // Can be null for LISTED properties
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
      source: sourceToUse,
      manualOwnerName: input.manualOwnerName,
      images: {
        create: images.map((image) => ({ url: image.url, publicId: image.publicId, roomCategory: image.roomCategory }))
      }
    },
    include: propertyInclude
  });
}

const propertyCardSelect = {
  id: true,
  propertyCode: true,
  title: true,
  description: true,

  location: true,

  lat: true,
  lng: true,

  roomType: true,
  preference: true,

  price: true,
  priceSingle: true,
  priceDouble: true,
  priceTriple: true,

  bedsSingle: true,
  bedsDouble: true,
  bedsTriple: true,
  occupiedBeds: true,

  facilities: true,

  nearbyPlaces: true,

  owner: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },

  images: {
    select: {
      url: true,
      roomCategory: true,
    },
    take: 1,
  },
} satisfies Prisma.PropertySelect;

export async function getProperties(query: Record<string, unknown>, viewerRole?: Role) {
  // Check for infinite scroll flag
  const infiniteScroll = query.infiniteScroll === "true";

  let page: number, limit: number, skip: number;
  if (!infiniteScroll) {
    const pagination = getPagination(query);
    page = pagination.page;
    limit = pagination.limit;
    skip = pagination.skip;
  } else {
    // For infinite scroll, we want all results (use a reasonable upper bound)
    page = 1;
    limit = 10000; // Large enough to get all approved properties
    skip = 0;
  }

  const status = query.status as PropertyStatus | undefined;
  const search = String(query.location ?? "").trim();
  const where: Prisma.PropertyWhereInput = {
    status: viewerRole === "admin" ? status : "approved",
    ...(search
      ? {
          OR: [
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
              propertyCode: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    roomType: query.roomType as RoomType | undefined,
    preference: query.preference as GenderPreference | undefined,
  };

  // Include infiniteScroll in cache key to avoid mixing cached results
  const cacheKey = `properties:${JSON.stringify({ status: where.status, search, roomType: where.roomType, preference: where.preference, page, limit, infiniteScroll })}`;
  if (!viewerRole) {
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      return cachedEntry.value;
    }
  }

  const [items, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      select: propertyCardSelect,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  // For infinite scroll, we don't need pagination metadata in the same way
  // But we keep the same structure for compatibility with frontend
  const result = {
    items,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };

 cache.set(cacheKey, { value: result, timestamp: Date.now() });

  return result;
}

export async function getPropertyById(id: string, viewerRole?: Role, internalUserId?: string) {
  const where: Prisma.PropertyWhereInput = { id };

  if (viewerRole === "admin") {
    // No additional conditions for admin
  } else if (internalUserId) {
    // For non-admin, logged-in user: show if approved OR owned by the user
    where.OR = [
      { status: "approved" },
      { ownerId: internalUserId }
    ];
  } else {
    // Not logged in and not admin: only show approved
    where.status = "approved";
  }

  const property = await prisma.property.findFirst({
    where,
    include: propertyInclude
  });

  if (!property) throw new AppError("Property not found", 404);
  return property;
}

export async function updateProperty(id: string, actorId: string, actorRole: Role, input: Partial<PropertyInput>) {
  const property = await prisma.property.findUnique({ where: { id },include: propertyInclude });
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

  // Get student name from user record
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { name: true }
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // Create review - safely cast the data object to bypass strict shape mismatches without explicit 'any'
  const review = await prisma.review.create({
    data: {
      propertyId,
      studentName: student.name,
      ...body,
      isAdminGenerated: false 
    } as unknown as Prisma.ReviewUncheckedCreateInput
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
          propertyCode: true,
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
  type AggregateResult = {
    _avg: {
      cleanliness: number | null;
      food: number | null;
      security: number | null;
      management: number | null;
      location: number | null;
    } | null;
    _count: { id: number } | number | null;
  };

  const agg = (await prisma.review.aggregate({
    where: { propertyId },
    _count: { id: true },
    _avg: {
      cleanliness: true,
      food: true,
      security: true,
      management: true,
      location: true,
    }
  } as unknown as Prisma.ReviewAggregateArgs)) as unknown as AggregateResult;

  // Handle case where no reviews exist
  if (!agg._avg) {
    return {
      overall: null,
      cleanliness: null,
      food: null,
      security: null,
      management: null,
      location: null,
      count: 0
    };
  }

  const avg = agg._avg;
  const fields = [avg.cleanliness, avg.food, avg.security, avg.management, avg.location];
  const defined = fields.filter((v): v is number => v !== null);
  const overall = defined.length > 0 ? defined.reduce((a, b) => a + b, 0) / defined.length : null;

  // Safely extract count without 'any'
  let count = 0;
  if (typeof agg._count === 'object' && agg._count !== null && 'id' in agg._count) {
    count = Number(agg._count.id);
  } else if (typeof agg._count === 'number') {
    count = agg._count;
  }

  return {
    overall: overall ? Math.round(overall * 10) / 10 : null,
    cleanliness: avg.cleanliness ? Math.round(avg.cleanliness * 10) / 10 : null,
    food: avg.food ? Math.round(avg.food * 10) / 10 : null,
    security: avg.security ? Math.round(avg.security * 10) / 10 : null,
    management: avg.management ? Math.round(avg.management * 10) / 10 : null,
    location: avg.location ? Math.round(avg.location * 10) / 10 : null,
    count
  };
}

export async function getPropertyReviews(propertyId: string) {
  return prisma.review.findMany({
    where: { propertyId },
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

export const getFeaturedProperties = async () => {
  return await prisma.property.findMany({
    where: {
      isFeatured: true,
      status: "approved" // Safety check
    },
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      images: true, // Keep the images so the frontend can display the cover photo
    }
  });
};