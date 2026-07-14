import { apiClient } from "@/lib/api/client";
import { toAdminListing, toAdminUser, toOwnerApproval, unwrapItems, type ApiOwnerApproval, type ApiProperty, type ApiUser, type PaginatedResponse } from "@/lib/api/types";
import type { AdminStats } from "@/types/admin";
import imageCompression from 'browser-image-compression';

export async function getAdminStats() {
  const { data } = await apiClient.get<AdminStats>("/admin/dashboard/stats");
  return data;
}

export async function getAdminListings(search?: string) {
  const { data } = await apiClient.get<PaginatedResponse<ApiProperty> | ApiProperty[]>("/admin/listings", { params: { search } });
  return unwrapItems(data).map(toAdminListing);
}

export async function getAdminListing(id: string) {
  const { data } = await apiClient.get<ApiProperty>(`/admin/listings/${id}`);
  return toAdminListing(data);
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

export async function getAdminUsers(
  search = "",
  page = 1
) {
  const { data } =
    await apiClient.get<
      PaginatedResponse<ApiUser>
    >("/admin/users", {
      params: {
        search,
        page,
        limit: 120000,
      },
    });

  return {
    users: data.items.map(toAdminUser),
    meta: data.meta,
  };
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

export async function getAdminUserProperties(id: string) {
  const { data } = await apiClient.get(`/admin/users/${id}/properties`);
  return data;
}

export async function updateListing(id: string, payload: Partial<{
  title: string;
  description: string;
  price: number;
  priceSingle: number;
  priceDouble: number;
  priceTriple: number;
  location: string;
  roomType: string;
  preference: string;
  mealPlan: string;
  mealTimes: string[];
  curfewTime: string;
  noticePeriod: string;
  rulesStrictness: string;
  facilities: string[];
}>) {
  const { data } = await apiClient.patch<ApiProperty>(`/admin/listings/${id}`, payload);
  return toAdminListing(data);
}

export async function addPropertyImages(
  propertyId: string,
  files: File[]
) {
  const formData = new FormData();
  
  // Options to keep files safely under the proxy ceiling (~3MB max)
  const options = { maxSizeMB: 3.5, maxWidthOrHeight: 4096, useWebWorker: true };

  // Compress all files concurrently in parallel
  const compressedFiles = await Promise.all(
    files.map(file => imageCompression(file, options))
  );

  compressedFiles.forEach((file) => {
     formData.append("images", file);
  });

  const { data } = await apiClient.post(
    `/admin/listings/${propertyId}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }
  );

  return data;
}

export async function deletePropertyImage(
  propertyId: string,
  imageId: string
) {
  await apiClient.delete(
    `/admin/listings/${propertyId}/images/${imageId}`
  );
}

export async function replacePropertyImage(
  propertyId: string,
  imageId: string,
  file: File
) {
  const formData = new FormData();
  
  const options = { maxSizeMB: 3.5, maxWidthOrHeight: 4096, useWebWorker: true };
  const compressedFile = await imageCompression(file, options);

  formData.append('images', compressedFile); 

  const { data } = await apiClient.put(
    `/admin/listings/${propertyId}/images/${imageId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data;
}

