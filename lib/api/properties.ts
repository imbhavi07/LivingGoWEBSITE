import { apiClient } from "@/lib/api/client";
import { toProperty, unwrapItems, type ApiProperty, type PaginatedResponse } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PropertyFilters } from "@/types/property";

export async function getProperties(filters?: PropertyFilters) {
  try {
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
  } catch (error) {
    throw new Error(`Failed to load properties: ${getApiErrorMessage(error, "Unknown error")}`);
  }
}

export async function getProperty(id: string) {
  try {
    const { data } = await apiClient.get<ApiProperty>(`/properties/${id}`);
    return toProperty(data);
  } catch (error) {
    throw new Error(`Failed to load property: ${getApiErrorMessage(error, "Unknown error")}`);
  }
}