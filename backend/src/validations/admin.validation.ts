import { z } from "zod";

export const adminIdSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

export const adminListSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected", "inactive"]).optional()
  })
});

export const adminUserListSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional()
  })
});