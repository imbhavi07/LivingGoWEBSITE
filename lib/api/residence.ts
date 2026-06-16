import { apiClient } from "@/lib/api/client";

export type ResidenceInfo = {
  propertyId: string;
  propertyTitle: string;
  location: string;
  occupiedBeds: number;
  totalBeds: number;
  availableBeds: number;
} | null;

export type PropertyListItem = {
  id: string;
  title: string;
  location: string;
};

export async function getStudentResidence(): Promise<ResidenceInfo> {
  try {
    const { data } = await apiClient.get<ResidenceInfo>("/user/residence");
    return data;
  } catch {
    return null;
  }
}

export async function getApprovedPropertyList(): Promise<PropertyListItem[]> {
  try {
    const { data } = await apiClient.get<PropertyListItem[]>("/properties/list");
    return data;
  } catch {
    return [];
  }
}

export async function markResidence(propertyId: string) {
  const { data } = await apiClient.post(`/properties/${propertyId}/residence`, {});
  return data;
}

export async function submitReview(
  propertyId: string,
  body: {
    cleanliness: number;
    food: number;
    security: number;
    management: number;
    location: number;
    comment?: string;
  }
) {
  const { data } = await apiClient.post(`/properties/${propertyId}/review`, body);
  return data;
}