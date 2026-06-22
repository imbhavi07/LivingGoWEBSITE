"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyPanoramas = getPropertyPanoramas;
exports.createPanorama = createPanorama;
exports.updatePanorama = updatePanorama;
exports.deletePanorama = deletePanorama;
exports.replacePanoramaImage = replacePanoramaImage;
const prisma_1 = require("../config/prisma");
const app_error_1 = require("../utils/app-error");
const cloudinary_service_1 = require("./cloudinary.service");
async function getPropertyPanoramas(propertyId) {
    return prisma_1.prisma.propertyPanorama.findMany({
        where: { propertyId },
        orderBy: { sortOrder: "asc" }
    });
}
async function createPanorama(propertyId, data) {
    return prisma_1.prisma.propertyPanorama.create({
        data: {
            propertyId,
            title: data.title,
            imageUrl: data.imageUrl,
            publicId: data.publicId,
            sortOrder: data.sortOrder ?? 0
        }
    });
}
async function updatePanorama(id, data) {
    const panorama = await prisma_1.prisma.propertyPanorama.findUnique({
        where: { id }
    });
    if (!panorama) {
        throw new app_error_1.AppError("Panorama not found", 404);
    }
    return prisma_1.prisma.propertyPanorama.update({
        where: { id },
        data
    });
}
async function deletePanorama(id) {
    const panorama = await prisma_1.prisma.propertyPanorama.findUnique({
        where: { id }
    });
    if (!panorama) {
        throw new app_error_1.AppError("Panorama not found", 404);
    }
    if (panorama.publicId) {
        await (0, cloudinary_service_1.deleteCloudinaryImage)(panorama.publicId);
    }
    await prisma_1.prisma.propertyPanorama.delete({
        where: { id }
    });
    return {
        success: true
    };
}
async function replacePanoramaImage(panoramaId, imageUrl, publicId) {
    const panorama = await prisma_1.prisma.propertyPanorama.findUnique({
        where: {
            id: panoramaId,
        },
    });
    if (!panorama) {
        throw new app_error_1.AppError("Panorama not found", 404);
    }
    if (panorama.publicId) {
        await (0, cloudinary_service_1.deleteCloudinaryImage)(panorama.publicId);
    }
    return prisma_1.prisma.propertyPanorama.update({
        where: {
            id: panoramaId,
        },
        data: {
            imageUrl,
            publicId,
        },
    });
}
