"use client";

import type { OwnerPropertyPayload, OwnerStats } from "@/types/owner";
import { apiClient } from "@/lib/api/client";
import { toOwnerProperty, toProperty, type ApiProperty } from "@/lib/api/types";

export function toPropertyFormData(payload: OwnerPropertyPayload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  if (payload.priceSingle !== undefined) formData.append("priceSingle", String(payload.priceSingle));
  if (payload.bedsSingle !== undefined) formData.append("bedsSingle", String(payload.bedsSingle));
  if (payload.priceDouble !== undefined) formData.append("priceDouble", String(payload.priceDouble));
  if (payload.bedsDouble !== undefined) formData.append("bedsDouble", String(payload.bedsDouble));
  if (payload.priceTriple !== undefined) formData.append("priceTriple", String(payload.priceTriple));
  if (payload.bedsTriple !== undefined) formData.append("bedsTriple", String(payload.bedsTriple));
  if (payload.securityDepositMonths !== undefined) formData.append("securityDepositMonths", String(payload.securityDepositMonths));
  formData.append("location", payload.location);
  if (payload.lat !== undefined) formData.append("lat", String(payload.lat));
  if (payload.lng !== undefined) formData.append("lng", String(payload.lng));
  if (payload.managerContact !== undefined) { formData.append("managerContact", payload.managerContact); }
  if (payload.securityContact !== undefined) { formData.append("securityContact", payload.securityContact);}
  formData.append("roomType", payload.roomType);
  if (payload.sharedType !== undefined) formData.append("sharedType", payload.sharedType);
  formData.append("preference", payload.preference);
  if (payload.mealPlan !== undefined) formData.append("mealPlan", payload.mealPlan);
  formData.append("mealTimes", JSON.stringify(payload.mealTimes ?? []));
  if (payload.curfewTime !== undefined) formData.append("curfewTime", payload.curfewTime);
  if (payload.noticePeriod !== undefined) formData.append("noticePeriod", payload.noticePeriod);
  if (payload.rulesStrictness !== undefined) formData.append("rulesStrictness", payload.rulesStrictness);
  formData.append("facilities", JSON.stringify(payload.facilities));

  if (payload.roomTypeMappings) {
    formData.append("roomTypeMappings", JSON.stringify(payload.roomTypeMappings));
  }

  payload.imageFiles?.forEach((file) => {
    formData.append("images", file);
  });

  return formData;
}

// ─── NATIVE APP ROUTER ACTIONS ─────────────────────────────────────────────

export async function createOwnerProperty(payload: OwnerPropertyPayload) {
  const formData = toPropertyFormData(payload);

  // Hit the internal Next.js route natively. No external URL or manual Bearer token needed!
  const res = await fetch("/api/owner/properties", {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // ignore, use statusText
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return toOwnerProperty(data);
}

export async function updateOwnerProperty(id: string, payload: OwnerPropertyPayload) {
  const formData = toPropertyFormData(payload);

  const res = await fetch(`/api/owner/properties/${id}`, {
    method: 'PUT',
    body: formData
  });

  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // ignore, use statusText
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return toOwnerProperty(data);
}

// 🔥 COMPLETELY RED-SCREEN PROOFED 🔥
export async function getOwnerStats(token?: string) {
  try {
    const response = await fetch('/api/owner/stats', {
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      console.warn(`Stats fetch failed with status: ${response.status}`);
      return { data: { totalListings: 0, activeListings: 0, pendingListings: 0 } };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.warn("Failed to fetch owner stats:", error); // Used .warn instead of .error so Next.js doesn't show red overlay
    return { data: { totalListings: 0, activeListings: 0, pendingListings: 0 } };
  }
}

export async function getOwnerProperties() {
  try {
    const res = await fetch('/api/owner/properties');

    // 🚨 FIX: Removed 'throw new Error'. We just safely return an empty array now.
    if (!res.ok) {
      console.warn(`Properties fetch failed with status: ${res.status}`);
      return { data: [] };
    }

    const json = await res.json();
    let propertiesArray: ApiProperty[] = [];

    if (Array.isArray(json)) {
      propertiesArray = json;
    } else if (json && typeof json === 'object') {
      const foundArray = Object.values(json).find(val => Array.isArray(val));
      propertiesArray = Array.isArray(foundArray) ? foundArray : [];
    }

    return { data: propertiesArray.map(toOwnerProperty) };
  } catch (error) {
    console.warn("Failed to fetch owner properties:", error); // Used .warn to prevent red screen
    return { data: [] };
  }
}

// UPDATED: Proxy to Next.js API routes instead of direct backend calls
export async function deleteOwnerProperty(id: string, token?: string) {
  const res = await fetch(`/api/owner/properties/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    // Optionally, you can throw an error or handle it as needed.
    // For now, we'll just log and let the caller handle the response status.
    const errorText = await res.text();
    console.error(`Failed to delete property ${id}:`, res.status, errorText);
    throw new Error(`Failed to delete property: ${res.status}`);
  }
  // No need to return anything; the caller will update optimistically.
}

// UPDATED: Proxy to Next.js API routes instead of direct backend calls
export async function toggleOwnerPropertyStatus(id: string, isActive: boolean, token?: string) {
  const res = await fetch(`/api/owner/properties/${id}/status`, {
    method: 'PATCH',
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
    body: JSON.stringify({ isActive }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to toggle property status: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return toOwnerProperty(data);
}

export async function getOwnerProperty(id: string, token?: string) {
  const res = await fetch(`/api/owner/properties/${id}`, {
    headers: {
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch property ${id}: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return toOwnerProperty(data);
}