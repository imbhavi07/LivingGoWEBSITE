import type { GenderPreference, RoomType } from "@/types/property";

export type OwnerListingStatus = "active" | "inactive" | "pending" | "rejected";

export type OwnerProperty = {
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
  securityDepositMonths?: string | number;
  location: string;
  lat?: number;
  lng?: number;
  roomType: RoomType;
  sharedType?: "Double" | "Triple" | "";
  preference: GenderPreference;
  mealPlan?: "Not Included" | "Veg Only" | "Veg + Non-Veg" | "Snacks Only";
  mealTimes?: string[];
  curfewTime?: "No Curfew" | "9 PM" | "10 PM" | "11 PM" | "12 AM";
  noticePeriod?: "15 Days" | "1 Month" | "2 Months";
  rulesStrictness?: "Strict" | "Lenient";
  facilities: string[];
  images: string[];
  status: OwnerListingStatus;
  createdAt: string;
};

export type OwnerPropertyPayload = Omit<OwnerProperty, "id" | "status" | "createdAt"> & {
  isActive?: boolean;
  imageFiles?: File[];
  lat?: number;
  lng?: number;
};

export type OwnerStats = {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
};
