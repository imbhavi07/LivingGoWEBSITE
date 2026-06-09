import { z } from "zod";

export const propertyIdSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

export const listPropertiesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    location: z.string().optional(),
    roomType: z.enum(["Single", "Shared"]).optional(),
    preference: z.enum(["Boys", "Girls", "Any"]).optional(),
    status: z.enum(["pending", "approved", "rejected", "inactive"]).optional()
  })
});

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(4).max(120),
    description: z.string().min(20).max(3000),
    price: z.coerce.number().int().positive(),
    priceSingle: z.coerce.number().int().nonnegative().optional(),
    bedsSingle: z.coerce.number().int().positive().optional(),
    priceDouble: z.coerce.number().int().nonnegative().optional(),
    bedsDouble: z.coerce.number().int().positive().optional(),
    priceTriple: z.coerce.number().int().nonnegative().optional(),
    bedsTriple: z.coerce.number().int().positive().optional(),
    securityDepositMonths: z.string().optional(),
    location: z.string().min(2).max(120),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    roomType: z.enum(["Single", "Shared"]),
    sharedType: z.enum(["Double", "Triple", ""]).optional(),
    preference: z.enum(["Boys", "Girls", "Any"]),
    mealPlan: z.string().optional(),
    mealTimes: z.union([z.array(z.string()), z.string()]).optional().transform((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      try {
        const parsed = JSON.parse(value) as unknown;
        return Array.isArray(parsed) ? parsed.map(String) : [value];
      } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
      }
    }),
    curfewTime: z.string().optional(),
    noticePeriod: z.string().optional(),
    rulesStrictness: z.string().optional(),
    facilities: z.union([z.array(z.string()), z.string()]).transform((value) => {
      if (Array.isArray(value)) return value;
      try {
        const parsed = JSON.parse(value) as unknown;
        return Array.isArray(parsed) ? parsed.map(String) : [value];
      } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
      }
    })
  })
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    title: z.string().min(4).max(120).optional(),
    description: z.string().min(20).max(3000).optional(),
    price: z.coerce.number().int().positive().optional(),
    priceSingle: z.coerce.number().int().nonnegative().optional(),
    bedsSingle: z.coerce.number().int().positive().optional(),
    priceDouble: z.coerce.number().int().nonnegative().optional(),
    bedsDouble: z.coerce.number().int().positive().optional(),
    priceTriple: z.coerce.number().int().nonnegative().optional(),
    bedsTriple: z.coerce.number().int().positive().optional(),
    securityDepositMonths: z.string().optional(),
    location: z.string().min(2).max(120).optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    roomType: z.enum(["Single", "Shared"]).optional(),
    sharedType: z.enum(["Double", "Triple", ""]).optional(),
    preference: z.enum(["Boys", "Girls", "Any"]).optional(),
    mealPlan: z.string().optional(),
    mealTimes: z.union([z.array(z.string()), z.string()]).optional().transform((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      try {
        const parsed = JSON.parse(value) as unknown;
        return Array.isArray(parsed) ? parsed.map(String) : [value];
      } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
      }
    }),
    curfewTime: z.string().optional(),
    noticePeriod: z.string().optional(),
    rulesStrictness: z.string().optional(),
    facilities: z.union([z.array(z.string()), z.string()]).transform((value) => {
      if (Array.isArray(value)) return value;
      try {
        const parsed = JSON.parse(value) as unknown;
        return Array.isArray(parsed) ? parsed.map(String) : [value];
      } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
      }
    }).optional(),
    isActive: z.boolean().optional()
  }).refine((body) => Object.keys(body).length > 0, "At least one field is required")
});

export const togglePropertyStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    isActive: z.boolean()
  })
});
