"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlist = getWishlist;
exports.addToWishlist = addToWishlist;
exports.removeFromWishlist = removeFromWishlist;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
async function getWishlist(userId) {
    return prisma_1.prisma.wishlist.findMany({
        where: { userId },
        include: {
            property: {
                include: {
                    images: { select: { id: true, url: true } },
                    owner: { select: { id: true, name: true, phone: true } }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}
async function addToWishlist(userId, propertyId) {
    const property = await prisma_1.prisma.property.findFirst({ where: { id: propertyId, status: "approved" } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    return prisma_1.prisma.wishlist.upsert({
        where: { userId_propertyId: { userId, propertyId } },
        update: {},
        create: { userId, propertyId }
    });
}
async function removeFromWishlist(userId, propertyId) {
    await prisma_1.prisma.wishlist.deleteMany({ where: { userId, propertyId } });
}
