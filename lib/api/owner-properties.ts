import { apiClient } from "@/lib/api/client";
import { toOwnerProperty, unwrapItems, type ApiProperty, type PaginatedResponse } from "@/lib/api/types";
import type { OwnerPropertyPayload, OwnerStats } from "@/types/owner";

export async function getOwnerStats() {
  const { data } = await apiClient.get<OwnerStats>("/owner/dashboard/stats");
  return data;
}

export async function getOwnerProperties() {
  const { data } = await apiClient.get<PaginatedResponse<ApiProperty> | ApiProperty[]>("/owner/properties");
  return unwrapItems(data).map(toOwnerProperty);
}

export async function getOwnerProperty(id: string) {
  const { data } = await apiClient.get<PaginatedResponse<ApiProperty> | ApiProperty[]>("/owner/properties");
  return unwrapItems(data).map(toOwnerProperty).find((property) => property.id === id) ?? null;
}

export async function createOwnerProperty(payload: OwnerPropertyPayload, token: string) {
  const formData = toPropertyFormData(payload);
<<<<<<< HEAD
  const { data } = await apiClient.post<ApiProperty>("/owner/properties", formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`
    }
  });
=======
  const { data } = await apiClient.post<ApiProperty>("/owner/properties", formData);
>>>>>>> 23ce3c3 (Fix Bugs 4.8.6 (property upload))
  return toOwnerProperty(data);
}

export async function updateOwnerProperty(id: string, payload: OwnerPropertyPayload, token: string) {
  const { data } = await apiClient.put<ApiProperty>(`/owner/properties/${id}`, {
    title: payload.title,
    description: payload.description,
    price: payload.price,
    priceSingle: payload.priceSingle,
    bedsSingle: payload.bedsSingle,
    priceDouble: payload.priceDouble,
    bedsDouble: payload.bedsDouble,
    priceTriple: payload.priceTriple,
    bedsTriple: payload.bedsTriple,
    securityDepositMonths: payload.securityDepositMonths ? String(payload.securityDepositMonths) : undefined,
    location: payload.location,
    lat: payload.lat,
    lng: payload.lng,
    roomType: payload.roomType,
    sharedType: payload.sharedType,
    preference: payload.preference,
    mealPlan: payload.mealPlan,
    mealTimes: payload.mealTimes,
    curfewTime: payload.curfewTime,
    noticePeriod: payload.noticePeriod,
    rulesStrictness: payload.rulesStrictness,
    facilities: payload.facilities
  }, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return toOwnerProperty(data);
}

export async function deleteOwnerProperty(id: string) {
  await apiClient.delete(`/owner/properties/${id}`);
}

export async function toggleOwnerPropertyStatus(id: string, isActive: boolean) {
  const { data } = await apiClient.patch<ApiProperty>(`/owner/properties/${id}/status`, {
    isActive
  });
  return toOwnerProperty(data);
}

function toPropertyFormData(payload: OwnerPropertyPayload) {
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

  payload.imageFiles?.forEach((file) => {
    formData.append("images", file);
  });

  return formData;
}