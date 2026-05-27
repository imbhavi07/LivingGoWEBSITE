import { apiClient, isAuthApiError } from "@/lib/api/client";
import { toAdminListing, toAdminUser, toOwnerApproval, unwrapItems, type ApiOwnerApproval, type ApiProperty, type ApiUser, type PaginatedResponse } from "@/lib/api/types";
import { mockAdminListings, mockAdminUsers } from "@/lib/mock-data";
import type {AdminStats} from "@/types/admin";

export async function getAdminStats() {
  try {
    const { data } = await apiClient.get<AdminStats>("/admin/dashboard/stats");
    return data;
  } catch (error) {
    if (isAuthApiError(error)) throw error;
    return {
      totalUsers: mockAdminUsers.length,
      totalProperties: mockAdminListings.length,
      pendingApprovals: mockAdminListings.filter((listing) => listing.status === "pending").length,
      approvedListings: mockAdminListings.filter((listing) => listing.status === "approved").length,
      pendingOwnerApprovals: 0
    };
  }
}

export async function getAdminListings(search?: string) {
  try {
    const { data } = await apiClient.get<PaginatedResponse<ApiProperty> | ApiProperty[]>("/admin/listings", { params: { search } });
    return unwrapItems(data).map(toAdminListing);
  } catch (error) {
    if (isAuthApiError(error)) throw error;
    const query = search?.toLowerCase().trim();
    if (!query) return mockAdminListings;
    return mockAdminListings.filter((listing) =>
      [listing.title, listing.ownerName, listing.location, listing.status].some((value) => value.toLowerCase().includes(query))
    );
  }
}

export async function getAdminListing(id: string) {
  try {
    const { data } = await apiClient.get<ApiProperty>(`/admin/listings/${id}`);
    return toAdminListing(data);
  } catch (error) {
    if (isAuthApiError(error)) throw error;
    return mockAdminListings.find((listing) => listing.id === id) ?? null;
  }
}

export async function approveListing(id: string) {
  const { data } = await apiClient.patch<ApiProperty>(`/admin/listings/${id}/approve`);
  return toAdminListing(data);
}

export async function rejectListing(id: string) {
  const { data } = await apiClient.patch<ApiProperty>(`/admin/listings/${id}/reject`);
  return toAdminListing(data);
}

export async function deleteListing(id: string) {
  await apiClient.delete(`/admin/listings/${id}`);
}

export async function getAdminUsers(search?: string) {
  try {
    const { data } = await apiClient.get<PaginatedResponse<ApiUser> | ApiUser[]>("/admin/users", { params: { search } });
    return unwrapItems(data).map(toAdminUser);
  } catch (error) {
    if (isAuthApiError(error)) throw error;
    const query = search?.toLowerCase().trim();
    if (!query) return mockAdminUsers;
    return mockAdminUsers.filter((user) =>
      [user.name, user.email, user.role, user.status].some((value) => value.toLowerCase().includes(query))
    );
  }
}

export async function suspendUser(id: string) {
  await apiClient.patch(`/admin/users/${id}/suspend`);
}

export async function deleteUser(id: string) {
  await apiClient.delete(`/admin/users/${id}`);
}

export async function getOwnerApprovals() {
  const { data } = await apiClient.get<ApiOwnerApproval[]>("/admin/approvals");
  return data.map(toOwnerApproval);
}

export async function getOwnerApproval(id: string) {
  const { data } = await apiClient.get<ApiOwnerApproval>(`/admin/approvals/${id}`);
  return toOwnerApproval(data);
}

export async function approveOwner(id: string) {
  const { data } = await apiClient.patch<ApiOwnerApproval>(`/admin/approvals/${id}/approve`);
  return toOwnerApproval(data);
}

export async function rejectOwner(id: string) {
  const { data } = await apiClient.patch<ApiOwnerApproval>(`/admin/approvals/${id}/reject`);
  return toOwnerApproval(data);
}
