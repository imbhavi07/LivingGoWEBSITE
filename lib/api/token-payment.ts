import { apiClient } from "@/lib/api/client";

export type TokenPaymentStatus = "pending" | "approved" | "rejected";

export type TokenPayment = {
  id: string;
  amount: number;
  utrNumber: string;
  status: TokenPaymentStatus;
  createdAt: string;
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
  const { data } = await apiClient.get<AdminTokenPayment[]>("/payments/owner-payments");
  return data;
}

// ─── Admin ────────────────────────────────────────────────────────────────
export async function adminGetTokenPayments(status?: string): Promise<AdminTokenPayment[]> {
  const { data } = await apiClient.get<AdminTokenPayment[]>("/payments/admin/token-payments", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function adminModeratePayment(
  paymentId: string,
  action: "approved" | "rejected"
): Promise<AdminTokenPayment> {
  const { data } = await apiClient.patch<AdminTokenPayment>(`/payments/admin/token-payments/${paymentId}`, { action });
  return data;
}