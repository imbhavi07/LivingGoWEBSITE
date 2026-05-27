export type RoomType = "Single" | "Shared";
export type GenderPreference = "Boys" | "Girls" | "Any";

export type Owner = {
  id: string;
  name: string;
  phone: string;
  verified: boolean;
  responseTime: string;
};

export type Property = {
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
