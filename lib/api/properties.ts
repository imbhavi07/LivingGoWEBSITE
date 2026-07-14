import { apiClient, getApiErrorMessage } from "@/lib/api/client";

import {
  toProperty,
  type ApiProperty,
  type PaginatedResponse,
} from "@/lib/api/types";

import type { PropertyFilters } from "@/types/property";

export async function getProperties(
  filters?: PropertyFilters,
  page = 1,
  limit = 1000000000,
  infiniteScroll = true
) {
  try {
    const params: Record<string, unknown> = {
      ...(filters?.location && { location: filters.location }),
      ...(filters?.roomType && { roomType: filters.roomType }),
      ...(filters?.preference && { preference: filters.preference }),
    };

    // Only add pagination params if not infinite scroll
    if (!infiniteScroll) {
      params.page = page;
      params.limit = limit;
    } else {
      // For infinite scroll, we still need to tell backend to return all
      params.infiniteScroll = "true";
    }

    const { data } = await apiClient.get<
      PaginatedResponse<ApiProperty>
    >("/properties", {
      params,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const properties = data.items.map((p, i) => toProperty(p, i));

    const filteredProperties = filters?.budget
      ? properties.filter(
          (property) => property.price <= Number(filters.budget)
        )
      : properties;

    return {
      properties: filteredProperties,
      meta: data.meta,
    };
  } catch (error) {
    throw new Error(
      `Failed to load properties: ${getApiErrorMessage(
        error,
        "Unknown error"
      )}`
    );
  }
}

export async function getProperty(id: string) {
  try {
    const { data } = await apiClient.get<ApiProperty>(`/properties/${id}`);
    return toProperty(data);
  } catch (error) {
    throw new Error(
      `Failed to load property: ${getApiErrorMessage(
        error,
        "Unknown error"
      )}`
    );
  }
}