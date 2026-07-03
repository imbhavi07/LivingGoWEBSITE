export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: "student" | "owner" | "admin" | "SUPER_ADMIN";
  verificationStatus?: "not_required" | "pending_email_verification" | "pending_approval" | "approved" | "rejected";
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  ownerType: "PG Owner" | "Flat Owner";
  aadhaarNumber: string;
  legalAccepted: true;
  aadhaarFront: File;
  aadhaarBack: File;
};

export type OwnerOtpPayload = {
  email: string;
};

export type OwnerOtpVerifyPayload = {
  email: string;
  otp: string;
};

export type OwnerSignupResponse = {
  message: string;
  user: AuthUser;
};
