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
  limit = 12
) {
  try {
    const { data } = await apiClient.get<
      PaginatedResponse<ApiProperty>
    >("/properties", {
      params: {
        page,
        limit,
        location: filters?.location,
        roomType: filters?.roomType,
        preference: filters?.preference,
      },
    });

    const properties = data.items.map((p, i) => toProperty(p, i));

    return {
      properties:
        filters?.budget
          ? properties.filter(
              (property) => property.price <= Number(filters.budget)
            )
          : properties,
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

