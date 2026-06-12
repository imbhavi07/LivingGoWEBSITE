// lib/api/token-payment.ts  (NEW FILE)

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

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

export async function submitTokenPayment(token: string, propertyId: string, utrNumber: string) {
  const res = await fetch(`${API}/payments/properties/${propertyId}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ utrNumber }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Failed to submit payment");
  }
  return res.json() as Promise<TokenPayment>;
}

export async function getMyTokenPayments(token: string): Promise<TokenPayment[]> {
  const res = await fetch(`${API}/payments/my-payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getOwnerTokenPayments(token: string): Promise<AdminTokenPayment[]> {
  const res = await fetch(`${API}/payments/owner-payments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

// Admin
export async function adminGetTokenPayments(token: string, status?: string): Promise<AdminTokenPayment[]> {
  const url = status
    ? `${API}/payments/admin/token-payments?status=${status}`
    : `${API}/payments/admin/token-payments`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  return res.json();
}

export async function adminModeratePayment(
  token: string,
  paymentId: string,
  action: "approved" | "rejected"
): Promise<AdminTokenPayment> {
  const res = await fetch(`${API}/payments/admin/token-payments/${paymentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Failed to update payment");
  }
  return res.json();
}