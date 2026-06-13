"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = getAdminStats;
exports.getSubmittedProperties = getSubmittedProperties;
exports.moderateProperty = moderateProperty;
exports.removeListing = removeListing;
exports.getUsers = getUsers;
exports.updateUserStatus = updateUserStatus;
exports.deleteSpamUser = deleteSpamUser;
exports.updateListingByAdmin = updateListingByAdmin;
exports.getUserProperties = getUserProperties;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const pagination_1 = require("../utils/pagination");
const adminPropertyInclude = {
    owner: {
        select: {
            id: true,
            name: true,
            email: true,
            phone: true
        }
    },
    images: {
        select: {
            id: true,
            url: true,
            publicId: true
        }
    }
};
async function getAdminStats() {
    const [totalUsers, totalProperties, pendingApprovals, approvedListings, pendingOwnerApprovals] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.property.count(),
        prisma_1.prisma.property.count({ where: { status: "pending" } }),
        prisma_1.prisma.property.count({ where: { status: "approved" } }),
        prisma_1.prisma.user.count({ where: { role: "owner", verificationStatus: "pending_approval" } })
    ]);
    return { totalUsers, totalProperties, pendingApprovals, approvedListings, pendingOwnerApprovals };
}
async function getSubmittedProperties(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const search = query.search ? String(query.search) : undefined;
    const status = query.status ?? "pending";
    const where = {
        status,
        OR: search
            ? [
                { title: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
                { owner: { name: { contains: search, mode: "insensitive" } } },
                { owner: { email: { contains: search, mode: "insensitive" } } }
            ]
            : undefined
    };
    const [items, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.property.findMany({
            where,
            include: adminPropertyInclude,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma_1.prisma.property.count({ where })
    ]);
    return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}
async function moderateProperty(id, status) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    return prisma_1.prisma.property.update({
        where: { id },
        data: { status },
        include: adminPropertyInclude
    });
}
async function removeListing(id) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    await prisma_1.prisma.property.delete({ where: { id } });
}
async function getUsers(query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const search = query.search ? String(query.search) : undefined;
    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } }
            ]
        }
        : {};
    const [items, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                _count: { select: { properties: true, wishlist: true } }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma_1.prisma.user.count({ where })
    ]);
    return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}
async function updateUserStatus(id, status) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user)
        throw new app_error_1.AppError("User not found", 404);
    if (user.role === "admin")
        throw new app_error_1.AppError("Admin accounts cannot be suspended through this endpoint", 400);
    return prisma_1.prisma.user.update({
        where: { id },
        data: { status },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
        }
    });
}
async function deleteSpamUser(id) {
    const user = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!user)
        throw new app_error_1.AppError("User not found", 404);
    if (user.role === "admin")
        throw new app_error_1.AppError("Admin accounts cannot be deleted through this endpoint", 400);
    await prisma_1.prisma.user.delete({ where: { id } });
}
async function updateListingByAdmin(id, input) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    return prisma_1.prisma.property.update({
        where: { id },
        data: {
            ...(input.title !== undefined && { title: String(input.title) }),
            ...(input.description !== undefined && { description: String(input.description) }),
            ...(input.price !== undefined && { price: Number(input.price) }),
            ...(input.priceSingle !== undefined && { priceSingle: Number(input.priceSingle) }),
            ...(input.priceDouble !== undefined && { priceDouble: Number(input.priceDouble) }),
            ...(input.priceTriple !== undefined && { priceTriple: Number(input.priceTriple) }),
            ...(input.location !== undefined && { location: String(input.location) }),
            ...(input.roomType !== undefined && { roomType: input.roomType }),
            ...(input.preference !== undefined && { preference: input.preference }),
            ...(input.mealPlan !== undefined && { mealPlan: String(input.mealPlan) }),
            ...(input.mealTimes !== undefined && { mealTimes: input.mealTimes }),
            ...(input.curfewTime !== undefined && { curfewTime: String(input.curfewTime) }),
            ...(input.noticePeriod !== undefined && { noticePeriod: String(input.noticePeriod) }),
            ...(input.rulesStrictness !== undefined && { rulesStrictness: String(input.rulesStrictness) }),
            ...(input.facilities !== undefined && { facilities: input.facilities }),
        },
        include: {
            owner: { select: { id: true, name: true, email: true, phone: true } },
            images: { select: { id: true, url: true, publicId: true } },
        },
    });
}
async function getUserProperties(userId) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
        },
    });
    if (!user) {
        throw new app_error_1.AppError("User not found", 404);
    }
    const properties = await prisma_1.prisma.property.findMany({
        where: { ownerId: userId },
        include: adminPropertyInclude,
        orderBy: { createdAt: "desc" },
    });
    return {
        user,
        properties,
    };
}
