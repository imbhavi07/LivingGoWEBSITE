import { apiClient } from "@/lib/api/client";

export type TokenPaymentStatus = "pending" | "approved" | "rejected";

export type TokenPayment = {
  id: string;
  amount: number;
  utrNumber: string;
  status: TokenPaymentStatus;
  visitOtp?: string | null;
  visitVerified: boolean;
  rentSettled: boolean;
  moveInRequested: boolean;
  createdAt: string;
  appliedCode?: string | null;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    images?: { url: string }[];
    owner?: { name: string; phone?: string | null };
  };
};

export type AdminTokenPayment = TokenPayment & {
  student: { id: string; name: string; email: string; phone?: string | null };
  property: TokenPayment["property"] & {
    owner: { id: string; name: string; phone?: string | null };
  };
};

// ─── Student ──────────────────────────────────────────────────────────────
export async function submitTokenPayment(propertyId: string, utrNumber: string) {
  const { data } = await apiClient.post<TokenPayment>(`/payments/properties/${propertyId}/token`, { utrNumber });
  return data;
}

export async function getMyTokenPayments(): Promise<TokenPayment[]> {
  const { data } = await apiClient.get<TokenPayment[]>("/payments/my-payments");
  return data;
}

// ─── Owner ────────────────────────────────────────────────────────────────
export async function getOwnerTokenPayments(): Promise<AdminTokenPayment[]> {
  try {
    const response = await fetch('/api/owner/payments');

    if (!response.ok) {
      console.warn(`Owner payments fetch failed with status: ${response.status}`);
      return []; // Return empty array safely
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Failed to fetch owner token payments:", error);
    return []; // Safe fallback
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────
export async function adminGetTokenPayments(status?: string): Promise<AdminTokenPayment[]> {
  const { data } = await apiClient.get<AdminTokenPayment[]>("/token-payments/admin/token-payments", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function adminModeratePayment(
  paymentId: string,
  action: "approved" | "rejected"
): Promise<AdminTokenPayment> {
  const { data } = await apiClient.patch<AdminTokenPayment>(`/token-payments/admin/token-payments/${paymentId}`, { action });
  return data;
}

export async function requestMoveIn(paymentId: string) {
  const { data } = await apiClient.post(
    `/payments/request-movein/${paymentId}`
  );

  return data;
}

export async function getOwnerPendingVisits(): Promise<TokenPayment[]> {
  try {
    const response = await fetch('/api/owner/pending-visits');

    if (!response.ok) {
      console.warn(`Owner pending visits fetch failed with status: ${response.status}`);
      return []; // Return empty array safely
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Failed to fetch owner pending visits:", error);
    return []; // Safe fallback
  }
}

export async function verifyVisitOtp(paymentId: string, otp: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/owner/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, otp }),
    });

    if (!response.ok) {
      console.warn(`Verify OTP failed with status: ${response.status}`);
      return { success: false };
    }

    const data = await response.json();
    return { success: !!data.success };
  } catch (error) {
    console.warn("Failed to verify visit OTP:", error);
    return { success: false };
  }
}

export async function approveMoveIn(id: string): Promise<{ success: boolean } | null> {
  try {
    const response = await fetch('/api/owner/approve-movein', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      console.warn(`Approve move-in failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return { success: !!data.success };
  } catch (error) {
    console.warn("Failed to approve move-in:", error);
    return null;
  }
}

export async function getOwnerTenants() {
  try {
    const response = await fetch("/api/owner/tenants");

    if (!response.ok) {
      console.warn(`Owner tenants fetch failed with status: ${response.status}`);
      return []; // Safe fallback to empty array
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Failed to fetch owner tenants:", error); // Changed to warn
    return []; // Safe fallback so React never crashes
  }
}