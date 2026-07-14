import type { AdminListing, AdminUser, Review } from "@/types/admin";
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
  roomCategory?: string | null;
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
  propertyCode?: string;
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

  lat?: number | null;
  lng?: number | null;

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

export type ApiReview = {
  id: string;
  propertyId: string;
  studentName: string;
  rating: number;
  content: string;
  createdAt: string;
};

export function toProperty(property: ApiProperty, index?: number): Property {
  const fallbackNumber = index !== undefined ? index + 1 : 1;
  const stableNumber = deriveStablePropertyNumber(property.id, fallbackNumber);
  
  return {
    id: property.id,
    propertyCode: property.propertyCode,
    title: property.title,
    description: property.description,
    price: property.price,
    priceSingle: property.priceSingle,
    bedsSingle: property.bedsSingle,
    priceDouble: property.priceDouble,
    bedsDouble: property.bedsDouble,
    priceTriple: property.priceTriple,
    bedsTriple: property.bedsTriple,
    occupiedBeds: property.occupiedBeds,
    
    // THE FIX: Use the actual location from the API for the frontend
    // This allows the frontend to split the string for the locality title
    location: property.location || "North Campus",
    address: "Location shared after enquiry", // This keeps the UI private
    
    roomType: property.roomType,
    sharedType: property.sharedType,
    preference: property.preference,
    mealPlan: property.mealPlan,
    mealTimes: property.mealTimes,
    curfewTime: property.curfewTime,
    noticePeriod: property.noticePeriod,
    rulesStrictness: property.rulesStrictness,
    facilities: property.facilities,
    images: property.images
    ? property.images.map((image) => ({
        url: image.url,
        roomCategory: image.roomCategory ?? "common",
      }))
    : [],
    owner: {
      id: property.owner?.id ?? "owner",
      name: property.owner?.name ?? property.ownerName ?? "Property owner",
      phone: property.owner?.phone ?? "",
      verified: true,
      responseTime: "Usually replies within a day"
    },
    nearbyPlaces: property.nearbyPlaces ?? null,
    panoramas: property.panoramas ?? [],
    listingIndex: stableNumber,
    
    // Ensure these are passed through so distance calculation works!
    // Convert to valid numbers or null to prevent NaN issues in distance calculations
    lat: typeof property.lat === 'number' && !isNaN(property.lat) ? property.lat : null,
    lng: typeof property.lng === 'number' && !isNaN(property.lng) ? property.lng : null,
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
    images: property.images ? property.images.map((image) => image.url) : [],
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
  images: (property.images ?? []).map((image) => ({
  id: image.id ?? "",
  url: image.url ?? "",
  publicId: image.publicId ?? null,
  })),

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

export function toReview(review: ApiReview): Review {
  return {
    id: review.id,
    studentName: review.studentName,
    rating: review.rating,
    content: review.content,
    createdAt: review.createdAt
  };
}

export function unwrapItems<T>(
  data: PaginatedResponse<T> | T[]
): T[] {
  return Array.isArray(data) ? data : data.items;
}

export type VisitStatus = string;

export type ApiVisit = {
  id: string;
  tokenId: string;
  studentId: string;
  propertyId: string;
  visitDate: string; // ISO date string
  timeSlot: string;
  couponCode: string | null;
  leadStatus: VisitStatus;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    email?: string;
    imageUrl?: string;
  };
  property?: {
    id: string;
    title: string;
    propertyCode?: string;
  };
};

export function toVisit(visit: ApiVisit) {
  return {
    id: visit.id,
    tokenId: visit.tokenId,
    studentId: visit.studentId,
    propertyId: visit.propertyId,
    visitDate: visit.visitDate,
    timeSlot: visit.timeSlot,
    couponCode: visit.couponCode,
    leadStatus: visit.leadStatus,
    createdAt: visit.createdAt,
    updatedAt: visit.updatedAt,
    student: visit.student
      ? {
          id: visit.student.id,
          name: visit.student.name,
          email: visit.student.email,
          imageUrl: visit.student.imageUrl,
        }
      : undefined,

    property: visit.property
      ? {
          id: visit.property.id,
          title: visit.property.title,
          propertyCode: visit.property.propertyCode,
        }
      : undefined,
  };
}

export type ApiCoupon = {
  id: string;
  partner?: {
    id?: string;
    name?: string;
  } | null;
  code: string;
  isActive: boolean;
  totalVisits?: number | null;
  totalConvertedBookings?: number | null;
  createdAt: string;
};

export function toAdminCoupon(coupon: ApiCoupon) {
  return {
    id: coupon.id,
    partnerName: coupon.partner?.name ?? "Unknown Partner",
    partnerId: coupon.partner?.id,
    couponCode: coupon.code,
    isActive: coupon.isActive,
    totalVisits: coupon.totalVisits ?? 0,
    totalConvertedBookings: coupon.totalConvertedBookings ?? 0,
    createdAt: coupon.createdAt,
  };
}