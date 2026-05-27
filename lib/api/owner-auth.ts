import { apiClient } from "@/lib/api/client";
import type { AuthResponse, LoginPayload, OwnerOtpPayload, OwnerOtpVerifyPayload, OwnerSignupResponse, SignupPayload } from "@/types/auth";

export async function ownerLogin(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>("/owner/auth/login", payload);
  return { ...data, user: { ...data.user, role: data.user.role ?? "owner" } };
}

export async function ownerSignup(payload: SignupPayload) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("password", payload.password);
  formData.append("ownerType", payload.ownerType);
  formData.append("aadhaarNumber", payload.aadhaarNumber);
  formData.append("legalAccepted", String(payload.legalAccepted));
  formData.append("images", payload.aadhaarFront);
  formData.append("images", payload.aadhaarBack);

  const { data } = await apiClient.post<OwnerSignupResponse>("/owner/auth/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function sendOwnerOtp(payload: OwnerOtpPayload) {
  const { data } = await apiClient.post<{ message: string }>("/owner/auth/send-otp", payload);
  return data;
}

export async function verifyOwnerOtp(payload: OwnerOtpVerifyPayload) {
  const { data } = await apiClient.post<{ message: string }>("/owner/auth/verify-otp", payload);
  return data;
}
