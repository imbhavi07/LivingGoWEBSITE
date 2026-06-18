import type { AdminListing, AdminUser } from "@/types/admin";
import type { OwnerApproval } from "@/types/admin";
import type { OwnerProperty } from "@/types/owner";
import type { Property } from "@/types/property";


export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

type ApiImage = {
  id?: string;
  url: string;
  publicId?: string | null;
};

type ApiOwner = {
  id: string;
  name: string;
  email?: string;
  phone?: string | null;
};

export type ApiProperty = {
  occupiedBeds?: number;
  rating?: number;
  reviewCount?: number;
  id: string;
  title: string;
  description: string;
  price: number;
  priceSingle?: number;
  bedsSingle?: number;
  priceDouble?: number;
  bedsDouble?: number;
  priceTriple?: number;
  bedsTriple?: number;
  securityDepositMonths?: string | number | null;
  location: string;
  roomType: Property["roomType"];
  sharedType?: "Double" | "Triple" | "";
  preference: Property["preference"];
  mealPlan?: string;
  mealTimes?: string[];
  curfewTime?: string;
  noticePeriod?: string;
  rulesStrictness?: string;
  facilities: string[];
  status?: string;
  images: ApiImage[];
  owner?: ApiOwner;

  panoramas?: {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  }[];

  nearbyPlaces?: {
    colleges: {
      name: string;
      distance: string;
      distanceMeters: number;
      type: "girls_college" | "coed_college";
    }[];
    metro: {
      name: string;
      distance: string;
      distanceMeters: number;
      type: "metro";
    } | null;
  } | null;

  ownerName?: string;
  createdAt?: string;
  submittedAt?: string;
  listingIndex?: number;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUser["role"];
  status: AdminUser["status"];
  createdAt?: string;
  joinedAt?: string;
  listingsCount?: number;
  _count?: {
    properties?: number;
  };
};

export type ApiOwnerApproval = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerType: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  legalAcceptedAt: string;
  verificationStatus: OwnerApproval["verificationStatus"];
  createdAt: string;
};

export function unwrapItems<T>(data: T[] | PaginatedResponse<T>) {
  return Array.isArray(data) ? data : data.items;
}

export function toProperty(property: ApiProperty, index?: number): Property {
  const fallbackNumber = index !== undefined ? index + 1 : 1;
  const stableNumber = deriveStablePropertyNumber(property.id, fallbackNumber);
  return {
    id: property.id,
    title: `PG ${stableNumber}`,
    description: property.description,
    price: property.price,
    priceSingle: property.priceSingle,
    bedsSingle: property.bedsSingle,      // ← FIX: was missing
    priceDouble: property.priceDouble,
    bedsDouble: property.bedsDouble,      // ← FIX: was missing
    priceTriple: property.priceTriple,
    bedsTriple: property.bedsTriple,      // ← FIX: was missing
    occupiedBeds: property.occupiedBeds,  // ← FIX: was missing
    location: "Location shared after enquiry",
    address: "Address shared after enquiry",
    roomType: property.roomType,
    sharedType: property.sharedType,
    preference: property.preference,
    mealPlan: property.mealPlan,
    mealTimes: property.mealTimes,
    curfewTime: property.curfewTime,
    noticePeriod: property.noticePeriod,
    rulesStrictness: property.rulesStrictness,
    facilities: property.facilities,
    images: property.images.map((image) => image.url),
    owner: {
      id: property.owner?.id ?? "owner",
      name: property.owner?.name ?? property.ownerName ?? "Property owner",
      phone: property.owner?.phone ?? "",
      verified: true,
      responseTime: "Usually replies within a day"
    },
    nearbyPlaces: property.nearbyPlaces ?? null,
    panoramas: property.panoramas ?? [],
    listingIndex: stableNumber
  };
}

export function toOwnerProperty(property: ApiProperty): OwnerProperty {
  return {
    id: property.id,
    title: property.title,
    description: property.description,
    price: property.price,
    priceSingle: property.priceSingle,
    bedsSingle: property.bedsSingle,
    priceDouble: property.priceDouble,
    bedsDouble: property.bedsDouble,
    priceTriple: property.priceTriple,
    bedsTriple: property.bedsTriple,
    securityDepositMonths: property.securityDepositMonths ? String(property.securityDepositMonths) : undefined,
    location: property.location,
    roomType: property.roomType,
    sharedType: property.sharedType,
    preference: property.preference,
    mealPlan: property.mealPlan as OwnerProperty["mealPlan"],
    mealTimes: property.mealTimes,
    curfewTime: property.curfewTime as OwnerProperty["curfewTime"],
    noticePeriod: property.noticePeriod as OwnerProperty["noticePeriod"],
    rulesStrictness: property.rulesStrictness as OwnerProperty["rulesStrictness"],
    facilities: property.facilities,
    images: property.images.map((image) => image.url),
    status:
      property.status === "approved"
        ? "active"
        : property.status === "inactive"
          ? "inactive"
          : property.status === "rejected"
            ? "rejected"
            : "pending",
    createdAt: property.createdAt ?? new Date().toISOString()
  };
}

function deriveStablePropertyNumber(propertyId: string, fallback: number) {
  let total = 0;
  for (let index = 0; index < propertyId.length; index += 1) {
    total += propertyId.charCodeAt(index);
  }
  return (total % 9000) + 1 || fallback;
}

export function toAdminListing(property: ApiProperty): AdminListing {
  return {
  id: property.id,
  title: property.title,
  description: property.description,
  price: property.price,
  location: property.location,
  roomType: property.roomType,
  preference: property.preference,
  facilities: property.facilities,
  images: property.images.map((image) => image.url),

  panoramas: property.panoramas ?? [],

  ownerName:
    property.owner?.name ??
    property.ownerName ??
    "Unknown owner",

  status:
    property.status === "approved" ||
    property.status === "rejected"
      ? property.status
      : "pending",

  submittedAt:
    property.submittedAt ??
    property.createdAt ??
    new Date().toISOString()
};
}

export function toAdminUser(user: ApiUser): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    joinedAt: user.joinedAt ?? user.createdAt ?? new Date().toISOString(),
    listingsCount: user.listingsCount ?? user._count?.properties ?? 0
  };
}

export function toOwnerApproval(approval: ApiOwnerApproval): OwnerApproval {
  return {
    id: approval.id,
    name: approval.name,
    email: approval.email,
    phone: approval.phone,
    ownerType: approval.ownerType,
    aadhaarNumber: approval.aadhaarNumber,
    aadhaarFrontUrl: approval.aadhaarFrontUrl,
    legalAcceptedAt: approval.legalAcceptedAt,
    verificationStatus: approval.verificationStatus,
    createdAt: approval.createdAt
  };
}