"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = createProperty;
exports.getProperties = getProperties;
exports.getPropertyById = getPropertyById;
exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;
exports.createReview = createReview;
exports.markResidence = markResidence;
exports.getStudentResidence = getStudentResidence;
exports.getPropertyRating = getPropertyRating;
exports.getPropertyReviews = getPropertyReviews;
exports.togglePropertyStatus = togglePropertyStatus;
exports.getOwnerProperties = getOwnerProperties;
exports.getOwnerStats = getOwnerStats;
exports.getApprovedPropertyList = getApprovedPropertyList;
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
async function createReview(studentId, propertyId, body) {
    // Validate all ratings are 1-5
    const fields = ["cleanliness", "food", "security", "management", "location"];
    for (const field of fields) {
        const val = body[field];
        if (!Number.isInteger(val) || val < 1 || val > 5) {
            throw new app_error_1.AppError(`${field} must be an integer between 1 and 5`, 400);
        }
    }
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    // Upsert: one review per student per property (@@unique constraint)
    const review = await prisma_1.prisma.review.upsert({
        where: { studentId_propertyId: { studentId, propertyId } },
        update: { ...body },
        create: { studentId, propertyId, ...body },
        include: {
            student: { select: { id: true, name: true } },
        },
    });
    return review;
}
async function markResidence(studentId, propertyId) {
    const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property)
        throw new app_error_1.AppError("Property not found", 404);
    // Calculate total beds
    const totalBeds = (property.bedsSingle ?? 0) +
        (property.bedsDouble ?? 0) +
        (property.bedsTriple ?? 0);
    // Check for existing residence (student can only live in one place)
    const existing = await prisma_1.prisma.tenantResidence.findUnique({
        where: { studentId },
    });
    // Guard: already in same property — check before transaction
    if (existing && existing.propertyId === propertyId) {
        throw new app_error_1.AppError("You are already marked as a tenant here", 400);
    }
    await prisma_1.prisma.$transaction(async (tx) => {
        if (existing) {
            // Free up a bed in old property
            await tx.property.update({
                where: { id: existing.propertyId },
                data: { occupiedBeds: { decrement: 1 } },
            });
            // Update residence to new property
            await tx.tenantResidence.update({
                where: { studentId },
                data: { propertyId },
            });
        }
        else {
            // Check capacity only for new residents
            if (totalBeds > 0 && property.occupiedBeds >= totalBeds) {
                throw new app_error_1.AppError("This property is at full capacity", 400);
            }
            await tx.tenantResidence.create({ data: { studentId, propertyId } });
        }
        // Increment occupiedBeds in new property
        await tx.property.update({
            where: { id: propertyId },
            data: { occupiedBeds: { increment: 1 } },
        });
    });
    // Return updated property snapshot
    const updated = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
    return {
        propertyId,
        occupiedBeds: updated.occupiedBeds,
        totalBeds,
        availableBeds: Math.max(0, totalBeds - updated.occupiedBeds),
    };
}
async function getStudentResidence(studentId) {
    const residence = await prisma_1.prisma.tenantResidence.findUnique({
        where: { studentId },
        include: {
            property: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    bedsSingle: true,
                    bedsDouble: true,
                    bedsTriple: true,
                    occupiedBeds: true,
                },
            },
        },
    });
    if (!residence)
        return null;
    const p = residence.property;
    const totalBeds = (p.bedsSingle ?? 0) + (p.bedsDouble ?? 0) + (p.bedsTriple ?? 0);
    return {
        propertyId: p.id,
        propertyTitle: p.title,
        location: p.location,
        occupiedBeds: p.occupiedBeds,
        totalBeds,
        availableBeds: Math.max(0, totalBeds - p.occupiedBeds),
    };
}
async function getPropertyRating(propertyId) {
    const agg = await prisma_1.prisma.review.aggregate({
        where: { propertyId },
        _avg: {
            cleanliness: true,
            food: true,
            security: true,
            management: true,
            location: true,
        },
        _count: { id: true },
    });
    const avg = agg._avg;
    const fields = [avg.cleanliness, avg.food, avg.security, avg.management, avg.location];
    const defined = fields.filter((v) => v !== null);
    const overall = defined.length > 0 ? defined.reduce((a, b) => a + b, 0) / defined.length : null;
    return {
        overall: overall ? Math.round(overall * 10) / 10 : null,
        cleanliness: avg.cleanliness ? Math.round(avg.cleanliness * 10) / 10 : null,
        food: avg.food ? Math.round(avg.food * 10) / 10 : null,
        security: avg.security ? Math.round(avg.security * 10) / 10 : null,
        management: avg.management ? Math.round(avg.management * 10) / 10 : null,
        location: avg.location ? Math.round(avg.location * 10) / 10 : null,
        count: agg._count.id,
    };
}
async function getPropertyReviews(propertyId) {
    return prisma_1.prisma.review.findMany({
        where: { propertyId },
        include: {
            student: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
    });
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
async function getApprovedPropertyList() {
    return prisma_1.prisma.property.findMany({
        where: {
            status: "approved",
        },
        include: propertyInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
}
