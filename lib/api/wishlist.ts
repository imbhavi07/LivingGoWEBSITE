import { apiClient } from "@/lib/api/client";
import { toProperty, type ApiProperty } from "@/lib/api/types";
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
  await apiClient.post(`/wishlist/${propertyId}`);
}

export async function removeWishlistProperty(propertyId: string) {
  await apiClient.delete(`/wishlist/${propertyId}`);
}

export function getWishlistIds(properties: Property[]) {
  return properties.map((property) => property.id);
}
