"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUserListSchema = exports.adminListSchema = exports.adminIdSchema = void 0;
const zod_1 = require("zod");
exports.adminIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1)
    })
});
exports.adminListSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        status: zod_1.z.enum(["pending", "approved", "rejected", "inactive"]).optional()
    })
});
exports.adminUserListSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        search: zod_1.z.string().optional()
    })
});
