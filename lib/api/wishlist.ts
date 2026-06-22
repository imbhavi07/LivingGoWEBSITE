import { apiClient } from "@/lib/api/client";
import { toProperty, type ApiProperty } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Property } from "@/types/property";

type ApiWishlistItem = {
  id: string;
  propertyId: string;
  property: ApiProperty;
};

export async function getWishlistProperties() {
  const { data } = await apiClient.get<ApiWishlistItem[]>("/wishlist");
  return data.map((item) => toProperty(item.property));
}

export async function addWishlistProperty(propertyId: string) {
  try {
    await apiClient.post(`/wishlist/${propertyId}`);
  } catch (error) {
    throw new Error(`Failed to add property to wishlist: ${getApiErrorMessage(error, "Unknown error")}`);
  }
}

export async function removeWishlistProperty(propertyId: string) {
  try {
    await apiClient.delete(`/wishlist/${propertyId}`);
  } catch (error) {
    throw new Error(`Failed to remove property from wishlist: ${getApiErrorMessage(error, "Unknown error")}`);
  }
}

export function getWishlistIds(properties: Property[]) {
  return properties.map((property) => property.id);
}
