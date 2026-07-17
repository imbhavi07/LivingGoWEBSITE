  import type { GenderPreference, RoomType } from "@/types/property";

export type AdminListingStatus = "pending" | "approved" | "rejected";
export type AdminUserStatus = "active" | "suspended";
export type AdminUserRole = "student" | "owner" | "admin";
export type OwnerApprovalStatus = "pending_approval" | "approved" | "rejected";

export type AdminStats = {
  totalUsers: number;
  totalProperties: number;
  pendingApprovals: number;
  approvedListings: number;
  pendingOwnerApprovals?: number;
};

export type AdminListing = {
  id: string;
  title: string;
  ownerName: string;
  price: number;
  location: string;
  roomType: RoomType;
  preference: GenderPreference;
  facilities: string[];
  images: {
  id: string;
  url: string;
  publicId?: string | null;
}[];
  panoramas?: {
    id: string;
    title: string;
    imageUrl: string;
    sortOrder: number;
  }[];
  description: string;
  // Additional fields for property editing
  priceSingle?: number;
  bedsSingle?: number;
  priceDouble?: number;
  bedsDouble?: number;
  priceTriple?: number;
  bedsTriple?: number;
  securityDepositMonths?: string | number;
  mealPlan?: string;
  mealTimes?: string[];
  curfewTime?: string;
  noticePeriod?: string;
  rulesStrictness?: string;
  managerContact?: string;
  securityContact?: string;
  lat?: number | null;
  lng?: number | null;
  status: AdminListingStatus;
  submittedAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedAt: string;
  listingsCount: number;
};

export type OwnerApproval = {
  id: string;
  name: string;
  email: string;
  phone: string;
  ownerType: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  legalAcceptedAt: string;
  verificationStatus: OwnerApprovalStatus;
  createdAt: string;
};

export type Review = {
  id: string;
  studentName: string;
  rating: number;
  content: string;
  createdAt: string;
};
