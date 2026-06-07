"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = createProperty;
exports.getProperties = getProperties;
exports.getPropertyById = getPropertyById;
exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;
exports.togglePropertyStatus = togglePropertyStatus;
exports.getOwnerProperties = getOwnerProperties;
exports.getOwnerStats = getOwnerStats;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const pagination_1 = require("../utils/pagination");
const nearby_service_1 = require("./nearby.service");
const propertyInclude = {
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
async function createProperty(ownerId, input, images) {
    // Calculate nearby places if coordinates provided
    let nearbyPlaces = undefined;
    if (input.lat && input.lng) {
        try {
            nearbyPlaces = await (0, nearby_service_1.findNearbyPlaces)(input.lat, input.lng, input.preference === "Any" ? "Any" : input.preference, input.location);
        }
        catch (err) {
            console.error("Nearby places calculation failed:", err);
            // Don't fail property creation if nearby places fails
        }
    }
    return prisma_1.prisma.property.create({
        data: {
            ownerId,
            title: input.title,
            description: input.description,
            price: input.price,
            priceSingle: input.priceSingle,
            bedsSingle: input.bedsSingle,
            priceDouble: input.priceDouble,
            bedsDouble: input.bedsDouble,
            priceTriple: input.priceTriple,
            bedsTriple: input.bedsTriple,
            securityDepositMonths: input.securityDepositMonths,
            location: input.location,
            lat: input.lat,
            lng: input.lng,
            nearbyPlaces: nearbyPlaces ?? undefined,
            roomType: input.roomType,
            sharedType: input.sharedType,
            preference: input.preference,
            mealPlan: input.mealPlan,
            mealTimes: input.mealTimes ?? [],
            curfewTime: input.curfewTime,
            noticePeriod: input.noticePeriod,
            rulesStrictness: input.rulesStrictness,
            facilities: input.facilities,
            status: "pending",
            images: {
                create: images.map((image) => ({ url: image.url, publicId: image.publicId }))
            }
        },
        include: propertyInclude
    });
}
async function getProperties(query, viewerRole) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const status = query.status;
    const where = {
        status: viewerRole === "admin" ? status : "approved",
        location: query.location ? { contains: String(query.location), mode: "insensitive" } : undefined,
        roomType: query.roomType,
        preference: query.preference
    };
    const [items, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.property.findMany({
            where,
            include: propertyInclude,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma_1.prisma.property.count({ where })
    ]);
    return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}
async function getPropertyById(id, viewerRole) {
    const property = await prisma_1.prisma.property.findFirst({
        where: {
            id,
            ...(viewerRole === "admin" ? {} : { status: "approved" })
        },
        include: propertyInclude
    });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    return property;
}
async function updateProperty(id, actorId, actorRole, input) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    if (actorRole !== "admin" && property.ownerId !== actorId)
        throw new app_error_1.AppError("Forbidden", 403);
    // Recalculate nearby places if coordinates changed
    let nearbyPlaces = undefined;
    if (input.lat && input.lng) {
        try {
            nearbyPlaces = await (0, nearby_service_1.findNearbyPlaces)(input.lat, input.lng, (input.preference ?? property.preference) === "Any" ? "Any" : (input.preference ?? property.preference), input.location ?? property.location);
        }
        catch (err) {
            console.error("Nearby places recalculation failed:", err);
        }
    }
    return prisma_1.prisma.property.update({
        where: { id },
        data: {
            ...input,
            ...(nearbyPlaces ? { nearbyPlaces } : {}),
            status: actorRole === "admin" ? property.status : "pending"
        },
        include: propertyInclude
    });
}
async function deleteProperty(id, actorId, actorRole) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    if (actorRole !== "admin" && property.ownerId !== actorId)
        throw new app_error_1.AppError("Forbidden", 403);
    await prisma_1.prisma.property.delete({ where: { id } });
}
async function togglePropertyStatus(id, ownerId, isActive) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    if (property.ownerId !== ownerId)
        throw new app_error_1.AppError("Forbidden", 403);
    return prisma_1.prisma.property.update({
        where: { id },
        data: { status: isActive ? "pending" : "inactive" },
        include: propertyInclude
    });
}
async function getOwnerProperties(ownerId, query) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(query);
    const where = { ownerId };
    const [items, total] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.property.findMany({
            where,
            include: propertyInclude,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma_1.prisma.property.count({ where })
    ]);
    return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}
async function getOwnerStats(ownerId) {
    const [totalListings, activeListings, pendingListings] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.property.count({ where: { ownerId } }),
        prisma_1.prisma.property.count({ where: { ownerId, status: "approved" } }),
        prisma_1.prisma.property.count({ where: { ownerId, status: "pending" } })
    ]);
    return { totalListings, activeListings, pendingListings };
}
