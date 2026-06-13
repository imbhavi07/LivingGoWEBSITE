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
  images: string[];
  description: string;
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
