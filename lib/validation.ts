import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const ownerSignupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(10, "Enter a valid phone number"),
  ownerType: z.enum(["PG Owner", "Flat Owner"]),
  aadhaarNumber: z.string().min(12, "Enter a valid Aadhaar number"),
  legalAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the legal agreements." })
  }),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const ownerPropertySchema = z.object({
  title: z.string().min(4, "Property title is too short"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(1000, "Enter a realistic monthly price"),
  priceSingle: z.coerce.number().min(0).optional(),
  bedsSingle: z.coerce.number().int().min(0).optional(),    // ← FIX: was missing
  priceDouble: z.coerce.number().min(0).optional(),
  bedsDouble: z.coerce.number().int().min(0).optional(),    // ← FIX: was missing
  priceTriple: z.coerce.number().min(0).optional(),
  bedsTriple: z.coerce.number().int().min(0).optional(),    // ← FIX: was missing
  location: z.string().min(3, "Enter a valid location"),
  roomType: z.enum(["Single", "Shared"]),
  sharedType: z.enum(["Double", "Triple", ""]).optional(),
  preference: z.enum(["Boys", "Girls", "Any"]),
  mealPlan: z.enum(["Not Included", "Veg Only", "Veg + Non-Veg", "Snacks Only"]),
  mealTimes: z.array(z.string()).optional(),
  curfewTime: z.enum(["No Curfew", "9 PM", "10 PM", "11 PM", "12 AM"]),
  noticePeriod: z.enum(["15 Days", "1 Month", "2 Months"]),
  rulesStrictness: z.enum(["Strict", "Lenient"]),
  facilities: z.array(z.string()).min(1, "Select at least one facility"),
  images: z.array(z.string().min(1)).min(1, "Upload at least one image"),
  managerContact: z.string().optional(),
  securityContact: z.string().optional()
});

export const filtersSchema = z.object({
  budget: z.string().optional(),
  location: z.string().max(80).optional(),
  roomType: z.enum(["", "Single", "Shared"]).optional(),
  preference: z.enum(["", "Boys", "Girls", "Any"]).optional()
});