import type { RatingData } from "@/components/StarRating";

export type RoomType = "Single" | "Shared";
export type GenderPreference = "Boys" | "Girls" | "Any";

export type Owner = {
  id: string;
propertyCode?: string;
  name: string;
  phone: string;
  verified: boolean;
  responseTime: string;
};

type Review = {
  id: string;
  cleanliness: number; food: number; security: number;
  management: number; location: number; 
  comment?: string | null;
  createdAt: string;
  student: { id: string; name: string };
};

// Add to your Property type:


export type Property = {
  rating?: RatingData;
  reviews?: Review[];
  reviewCount?: number;
  occupiedBeds?: number;
  availableBeds?: number;
  // ← NEW: bed counts per room type (used for "Lock Property" availability)
  bedsSingle?: number | null;
  bedsDouble?: number | null;
  bedsTriple?: number | null;
  id: string;
  propertyCode?: string;
  title: string;
  price: number;
  priceSingle?: number;
  priceDouble?: number;
  priceTriple?: number;
  securityDepositMonths?: number | null;
  managerContact?: string;
  securityContact?: string;
  status?: string;
  location: string;
  address: string;
  roomType: RoomType;
  sharedType?: "Double" | "Triple" | "";
  preference: GenderPreference;
  mealPlan?: string;
  mealTimes?: string[];
  curfewTime?: string;
  noticePeriod?: string;
  rulesStrictness?: string;
  facilities: string[];
  images:{ url: string; roomCategory?: string; }[];
  description: string;
  owner: Owner;
  listingIndex?: number;
  panoramas?: {
  id: string;
  title: string;
  imageUrl: string;
  sortOrder: number;
  }[];

  lat?: number | null;
  lng?: number | null;

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
};

export type PropertyFilters = {
  budget?: string;
  location?: string;
  roomType?: RoomType | "";
  preference?: GenderPreference | "";
};