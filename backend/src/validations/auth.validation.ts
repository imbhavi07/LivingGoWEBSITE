import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().toLowerCase(),
    phone: z.string().min(8).max(20).optional(),
    password: z.string().min(8).max(128),
    role: z.enum(["student", "owner"]).default("student")
  })
});

export const ownerSignupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().toLowerCase(),
    phone: z.string().min(8).max(20),
    password: z.string().min(8).max(128),
    ownerType: z.enum(["PG Owner", "Flat Owner"]),
    aadhaarNumber: z.string().min(12).max(20),
    legalAccepted: z.preprocess((value) => value === true || value === "true", z.literal(true))
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128)
  })
});

export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase()
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    otp: z.string().length(6)
  })
});
