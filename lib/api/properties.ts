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

    if (!infiniteScroll) {
      params.page = page;
      params.limit = limit;
    } else {
      params.infiniteScroll = "true";
    }

    const { data } = await apiClient.get<PaginatedResponse<ApiProperty>>("/properties", {
      params,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const properties = data.items.map((p, i) => toProperty(p, i));

    // THE FIX: Bulletproof budget filtering - safe parsing + missing-price fallback
    let filteredProperties = properties;
    if (filters?.budget) {
      const budgetVal = Number(String(filters.budget).replace(/[^0-9]/g, ''));
      if (!isNaN(budgetVal) && budgetVal > 0) {
        filteredProperties = filteredProperties.filter(
          (property) => (property.price ?? Infinity) <= budgetVal
        );
      }
    }

    return {
      properties: filteredProperties,
      meta: data.meta,
    };
  } catch (error) {
    console.error("[getProperties] API fetch failed:", error);
    return {
      properties: [],
      meta: { total: 0, page: 1, limit: 0, totalPages: 0 },
    };
  }
}

export async function getProperty(id: string) {
  try {
    const { data } = await apiClient.get<ApiProperty>(`/properties/${id}`);
    return toProperty(data);
  } catch (error) {
    console.error("[getProperty] API fetch failed:", error);
    return null;
  }
}