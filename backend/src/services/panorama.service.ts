import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { deleteCloudinaryImage } from "./cloudinary.service";

export async function getPropertyPanoramas(propertyId: string) {
  return prisma.propertyPanorama.findMany({
    where: { propertyId },
    orderBy: { sortOrder: "asc" }
  });
}

export async function createPanorama(
  propertyId: string,
  data: {
    title: string;
    imageUrl: string;
    publicId?: string;
    sortOrder?: number;
  }
) {
  return prisma.propertyPanorama.create({
    data: {
      propertyId,
      title: data.title,
      imageUrl: data.imageUrl,
      publicId: data.publicId,
      sortOrder: data.sortOrder ?? 0
    }
  });
}

export async function updatePanorama(
  id: string,
  data: {
    title?: string;
    sortOrder?: number;
  }
) {
  const panorama = await prisma.propertyPanorama.findUnique({
    where: { id }
  });

  if (!panorama) {
    throw new AppError("Panorama not found", 404);
  }

  return prisma.propertyPanorama.update({
    where: { id },
    data
  });
}

export async function deletePanorama(id: string) {
  const panorama = await prisma.propertyPanorama.findUnique({
    where: { id }
  });

  if (!panorama) {
    throw new AppError("Panorama not found", 404);
  }

  if (panorama.publicId) {
    await deleteCloudinaryImage(
      panorama.publicId
    );
  }

  await prisma.propertyPanorama.delete({
    where: { id }
  });

  return {
    success: true
  };
}

export async function replacePanoramaImage(
  panoramaId: string,
  imageUrl: string,
  publicId: string
) {
  const panorama =
    await prisma.propertyPanorama.findUnique({
      where: {
        id: panoramaId,
      },
    });

  if (!panorama) {
    throw new AppError(
      "Panorama not found",
      404
    );
  }

  if (panorama.publicId) {
    await deleteCloudinaryImage(
      panorama.publicId
    );
  }

  return prisma.propertyPanorama.update({
    where: {
      id: panoramaId,
    },
    data: {
      imageUrl,
      publicId,
    },
  });
}