import { apiClient, isAuthApiError } from "@/lib/api/client";
import { toProperty, unwrapItems, type ApiProperty, type PaginatedResponse } from "@/lib/api/types";
import { mockProperties } from "@/lib/mock-data";
import type {PropertyFilters } from "@/types/property";

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
    return filters?.budget ? properties.filter((property) => property.price <= Number(filters.budget)) : properties;
  } catch (error) {
    if (isAuthApiError(error)) throw error;
    return filterMockProperties(filters);
  }
}

export async function getProperty(id: string) {
  try {
    const { data } = await apiClient.get<ApiProperty>(`/properties/${id}`);
    return toProperty(data);
  } catch (error) {
    if (isAuthApiError(error)) throw error;
    return mockProperties.find((property) => property.id === id) ?? null;
  }
}

function filterMockProperties(filters?: PropertyFilters) {
  if (!filters) return mockProperties;

  return mockProperties.filter((property) => {
    const maxBudget = filters.budget ? Number(filters.budget) : Number.POSITIVE_INFINITY;
    const matchesBudget = property.price <= maxBudget;
    const matchesLocation = filters.location
      ? property.location.toLowerCase().includes(filters.location.toLowerCase())
      : true;
    const matchesRoom = filters.roomType ? property.roomType === filters.roomType : true;
    const matchesPreference = filters.preference ? property.preference === filters.preference : true;

    return matchesBudget && matchesLocation && matchesRoom && matchesPreference;
  });
}
