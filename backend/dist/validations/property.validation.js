"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markResidenceSchema = exports.createReviewSchema = exports.togglePropertyStatusSchema = exports.updatePropertySchema = exports.createPropertySchema = exports.listPropertiesSchema = exports.propertyIdSchema = void 0;
const zod_1 = require("zod");
exports.propertyIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.listPropertiesSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        roomType: zod_1.z.enum(["Single", "Shared"]).optional(),
        preference: zod_1.z.enum(["Boys", "Girls", "Any"]).optional(),
        status: zod_1.z.enum(["pending", "approved", "rejected", "inactive"]).optional()
    })
});
exports.createPropertySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(4).max(120),
        description: zod_1.z.string().min(20).max(3000),
        price: zod_1.z.coerce.number().int().positive(),
        priceSingle: zod_1.z.coerce.number().int().nonnegative().optional(),
        bedsSingle: zod_1.z.coerce.number().int().positive().optional(),
        priceDouble: zod_1.z.coerce.number().int().nonnegative().optional(),
        bedsDouble: zod_1.z.coerce.number().int().positive().optional(),
        priceTriple: zod_1.z.coerce.number().int().nonnegative().optional(),
        bedsTriple: zod_1.z.coerce.number().int().positive().optional(),
        securityDepositMonths: zod_1.z.string().optional(),
        location: zod_1.z.string().min(2).max(120),
        lat: zod_1.z.coerce.number().optional(),
        lng: zod_1.z.coerce.number().optional(),
        roomType: zod_1.z.enum(["Single", "Shared"]),
        sharedType: zod_1.z.enum(["Double", "Triple", ""]).optional(),
        preference: zod_1.z.enum(["Boys", "Girls", "Any"]),
        mealPlan: zod_1.z.string().optional(),
        mealTimes: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()]).optional().transform((value) => {
            if (!value)
                return [];
            if (Array.isArray(value))
                return value;
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed.map(String) : [value];
            }
            catch {
                return value.split(",").map((item) => item.trim()).filter(Boolean);
            }
        }),
        curfewTime: zod_1.z.string().optional(),
        noticePeriod: zod_1.z.string().optional(),
        rulesStrictness: zod_1.z.string().optional(),
        facilities: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()]).transform((value) => {
            if (Array.isArray(value))
                return value;
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed.map(String) : [value];
            }
            catch {
                return value.split(",").map((item) => item.trim()).filter(Boolean);
            }
        })
    })
});
exports.updatePropertySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(4).max(120).optional(),
        description: zod_1.z.string().min(20).max(3000).optional(),
        price: zod_1.z.coerce.number().int().positive().optional(),
        priceSingle: zod_1.z.coerce.number().int().nonnegative().optional(),
        bedsSingle: zod_1.z.coerce.number().int().positive().optional(),
        priceDouble: zod_1.z.coerce.number().int().nonnegative().optional(),
        bedsDouble: zod_1.z.coerce.number().int().positive().optional(),
        priceTriple: zod_1.z.coerce.number().int().nonnegative().optional(),
        bedsTriple: zod_1.z.coerce.number().int().positive().optional(),
        securityDepositMonths: zod_1.z.string().optional(),
        location: zod_1.z.string().min(2).max(120).optional(),
        lat: zod_1.z.coerce.number().optional(),
        lng: zod_1.z.coerce.number().optional(),
        roomType: zod_1.z.enum(["Single", "Shared"]).optional(),
        sharedType: zod_1.z.enum(["Double", "Triple", ""]).optional(),
        preference: zod_1.z.enum(["Boys", "Girls", "Any"]).optional(),
        mealPlan: zod_1.z.string().optional(),
        mealTimes: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()]).optional().transform((value) => {
            if (!value)
                return [];
            if (Array.isArray(value))
                return value;
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed.map(String) : [value];
            }
            catch {
                return value.split(",").map((item) => item.trim()).filter(Boolean);
            }
        }),
        curfewTime: zod_1.z.string().optional(),
        noticePeriod: zod_1.z.string().optional(),
        rulesStrictness: zod_1.z.string().optional(),
        facilities: zod_1.z.union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()]).transform((value) => {
            if (Array.isArray(value))
                return value;
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed.map(String) : [value];
            }
            catch {
                return value.split(",").map((item) => item.trim()).filter(Boolean);
            }
        }).optional(),
        isActive: zod_1.z.boolean().optional()
    }).refine((body) => Object.keys(body).length > 0, "At least one field is required")
});
exports.togglePropertyStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    }),
    body: zod_1.z.object({
        isActive: zod_1.z.boolean()
    })
});
exports.createReviewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    }),
    body: zod_1.z.object({
        cleanliness: zod_1.z.number().min(1).max(5),
        food: zod_1.z.number().min(1).max(5),
        security: zod_1.z.number().min(1).max(5),
        management: zod_1.z.number().min(1).max(5),
        location: zod_1.z.number().min(1).max(5),
        comment: zod_1.z.string().optional()
    })
});
exports.markResidenceSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
