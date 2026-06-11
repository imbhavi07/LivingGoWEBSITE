import type { RatingData } from "@/components/StarRating";

export type RoomType = "Single" | "Shared";
export type GenderPreference = "Boys" | "Girls" | "Any";

export type Owner = {
  id: string;
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
  availableBeds?: number
  id: string;
  title: string;
  price: number;
  priceSingle?: number;
  priceDouble?: number;
  priceTriple?: number;
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
  images: string[];
  description: string;
  owner: Owner;
  listingIndex?: number;
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
