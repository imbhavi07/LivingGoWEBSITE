import { apiClient } from "@/lib/api/client";
import { toProperty, unwrapItems, type ApiProperty, type PaginatedResponse } from "@/lib/api/types";
import type { PropertyFilters } from "@/types/property";

export async function getProperties(filters?: PropertyFilters) {
  const { data } = await apiClient.get<PaginatedResponse<ApiProperty> | ApiProperty[]>("/properties", {
    params: {
      location: filters?.location,
      roomType: filters?.roomType || undefined,
      preference: filters?.preference || undefined
    }
  });
  const properties = unwrapItems(data).map((p, i) => toProperty(p, i));
  return filters?.budget
    ? properties.filter((property) => property.price <= Number(filters.budget))
    : properties;
}

export async function getProperty(id: string) {
  const { data } = await apiClient.get<ApiProperty>(`/properties/${id}`);
  return toProperty(data);
}