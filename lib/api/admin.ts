import { apiClient } from "@/lib/api/client";
import { toAdminListing, toAdminUser, toOwnerApproval, unwrapItems, type ApiOwnerApproval, type ApiProperty, type ApiUser, type ApiReview, type PaginatedResponse } from "@/lib/api/types";
import type { AdminStats } from "@/types/admin";

export async function getAdminStats() {
  const { data } = await apiClient.get<AdminStats>("/admin/dashboard/stats");
  return data;
}

export async function createProperty(
  data: FormData
) {
  const { data: responseData } = await apiClient.post<ApiProperty>(
    "/admin/properties",
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }
  );
  return toAdminListing(responseData);
}

export async function getAdminListings(search?: string) {
  const { data } = await apiClient.get<PaginatedResponse<ApiProperty> | ApiProperty[]>("/admin/properties", { params: { search } });
  return unwrapItems(data).map(toAdminListing);
}

export async function getAdminListing(id: string) {
  const { data } = await apiClient.get<ApiProperty>(`/admin/properties/${id}`);
  return toAdminListing(data);
}

export async function approveListing(id: string) {
  const { data } = await apiClient.patch<ApiProperty>(`/admin/properties/${id}/approve`);
  return toAdminListing(data);
}

export async function rejectListing(id: string) {
  const { data } = await apiClient.patch<ApiProperty>(`/admin/properties/${id}/reject`);
  return toAdminListing(data);
}

export async function deleteListing(id: string) {
  await apiClient.delete(`/admin/properties/${id}`);
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
  const { data } = await apiClient.patch<ApiProperty>(`/admin/properties/${id}`, payload);
  return toAdminListing(data);
}

export async function updateListingWithFormData(id: string, data: FormData) {
  const { data: responseData } = await apiClient.patch<ApiProperty>(
    `/admin/properties/${id}`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }
  );
  return toAdminListing(responseData);
}

export async function addPropertyImages(
  propertyId: string,
  files: File[]
) {
  const formData = new FormData();

  const imageCompression = (
    await import("browser-image-compression")
  ).default;

  const options = {
    maxSizeMB: 3.5,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
  };

  const uploadFiles: File[] = [];

  for (const file of files) {
    const isHeic =
      file.type.includes("heic") ||
      file.type.includes("heif") ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (isHeic) {
      uploadFiles.push(file);
    } else {
      try {
        const compressed = await imageCompression(file, options);
        uploadFiles.push(compressed);
      } catch (err) {
        console.warn(
          "Compression failed. Uploading original file:",
          file.name,
          err
        );

        uploadFiles.push(file);
      }
    }
  }

  uploadFiles.forEach((file) => {
    formData.append("images", file);
  });

  const { data } = await apiClient.post(
    `/admin/properties/${propertyId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function deletePropertyImage(
  propertyId: string,
  imageId: string
) {
  await apiClient.delete(
    `/admin/properties/${propertyId}/images/${imageId}`
  );
}

export async function replacePropertyImage(
  propertyId: string,
  imageId: string,
  file: File
) {
  const formData = new FormData();

  const imageCompression = (
    await import("browser-image-compression")
  ).default;

  const options = {
    maxSizeMB: 3.5,
    maxWidthOrHeight: 4096,
    useWebWorker: true,
  };

  const isHeic =
    file.type.includes("heic") ||
    file.type.includes("heif") ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (isHeic) {
    formData.append("images", file);
  } else {
    try {
      const compressed = await imageCompression(file, options);
      formData.append("images", compressed);
    } catch (err) {
      console.warn(
        "Compression failed. Uploading original file:",
        file.name,
        err
      );

      formData.append("images", file);
    }
  }

  const { data } = await apiClient.put(
    `/admin/properties/${propertyId}/images/${imageId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}


export async function createAdminReview(
  propertyId: string,
  data: {
    studentName: string;
    rating: number;
    content: string;
  }
) {
  const { data: responseData } = await apiClient.post<ApiReview>(
    `/admin/properties/${propertyId}/reviews`,
    data
  );

  return responseData;
}

