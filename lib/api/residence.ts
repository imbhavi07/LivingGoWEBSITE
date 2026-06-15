// lib/api/residence.ts  (NEW FILE)

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

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

export async function getStudentResidence(token: string): Promise<ResidenceInfo> {
  const res = await fetch(`${API}/user/residence`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getApprovedPropertyList(): Promise<PropertyListItem[]> {
  const res = await fetch(`${API}/properties/list`);
  if (!res.ok) return [];
  return res.json();
}

export async function markResidence(token: string, propertyId: string) {
  const res = await fetch(`${API}/properties/${propertyId}/residence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to update residence");
  }
  return res.json();
}

export async function submitReview(
  token: string,
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
  const res = await fetch(`${API}/properties/${propertyId}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to submit review");
  }
  return res.json();
}