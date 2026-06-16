import type { OwnerPropertyPayload, OwnerStats } from "@/types/owner";
import { apiClient } from "@/lib/api/client";
import { toOwnerProperty, toProperty, type ApiProperty } from "@/lib/api/types";

export async function toPropertyFormData(payload: OwnerPropertyPayload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  if (payload.priceSingle !== undefined) formData.append("priceSingle", String(payload.priceSingle));
  if (payload.bedsSingle !== undefined) formData.append("bedsSingle", String(payload.bedsSingle));
  if (payload.priceDouble !== undefined) formData.append("priceDouble", String(payload.priceDouble));
  if (payload.bedsDouble !== undefined) formData.append("bedsDouble", String(payload.bedsDouble));
  if (payload.priceTriple !== undefined) formData.append("priceTriple", String(payload.priceTriple));
  if (payload.bedsTriple !== undefined) formData.append("bedsTriple", String(payload.bedsTriple));
  if (payload.securityDepositMonths !== undefined) formData.append("securityDepositMonths", String(payload.securityDepositMonths));
  formData.append("location", payload.location);
  if (payload.lat !== undefined) formData.append("lat", String(payload.lat));
  if (payload.lng !== undefined) formData.append("lng", String(payload.lng));
  formData.append("roomType", payload.roomType);
  if (payload.sharedType !== undefined) formData.append("sharedType", payload.sharedType);
  formData.append("preference", payload.preference);
  if (payload.mealPlan !== undefined) formData.append("mealPlan", payload.mealPlan);
  formData.append("mealTimes", JSON.stringify(payload.mealTimes ?? []));
  if (payload.curfewTime !== undefined) formData.append("curfewTime", payload.curfewTime);
  if (payload.noticePeriod !== undefined) formData.append("noticePeriod", payload.noticePeriod);
  if (payload.rulesStrictness !== undefined) formData.append("rulesStrictness", payload.rulesStrictness);
  formData.append("facilities", JSON.stringify(payload.facilities));

  // NEW: Handle room-type mappings
  if (payload.roomTypeMappings) {
    formData.append("roomTypeMappings", JSON.stringify(payload.roomTypeMappings));
  }

  payload.imageFiles?.forEach((file) => {
    formData.append("images", file);
  });

  return formData;
}

export async function updateOwnerProperty(id: string, payload: OwnerPropertyPayload, token?: string) {
  const formData = toPropertyFormData(payload);
  const { data } = await apiClient.put<ApiProperty>(`/owner/properties/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`
    },
  });
  return toProperty(data);
}

export async function createOwnerProperty(payload: OwnerPropertyPayload, token?: string) {
  const formData = toPropertyFormData(payload);
  const { data } = await apiClient.post<ApiProperty>(`/owner/properties`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`
    },
  });
  return toProperty(data);
}

export async function getOwnerStats(token?: string) {
  const { data } = await apiClient.get<OwnerStats>(`/owner/dashboard/stats`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });
  return data;
}

export async function getOwnerProperties(token?: string) {
  const { data } = await apiClient.get<ApiProperty[]>(`/owner/properties`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });
  return data.map(toOwnerProperty);
}

export async function deleteOwnerProperty(id: string, token?: string) {
  await apiClient.delete(`/owner/properties/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });
}

export async function toggleOwnerPropertyStatus(id: string, isActive: boolean, token?: string) {
  const { data } = await apiClient.patch<ApiProperty>(`/owner/properties/${id}/status`, { isActive }, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return toOwnerProperty(data);
}

export async function getOwnerProperty(id: string, token?: string) {
  const { data } = await apiClient.get<ApiProperty>(`/owner/properties/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
  });
  return toOwnerProperty(data);
}