import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as adminService from "../services/admin.service";
import { getPropertyById } from "../services/property.service";
import * as ownerVerificationService from "../services/owner-verification.service";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getPropertyRating } from "../services/property.service";
import { uploadImage, uploadPanorama, deleteCloudinaryImage } from "../services/cloudinary.service";

import type { Prisma } from "@prisma/client";


const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const getStats = asyncHandler(async (_request: Request, response: Response) => {
  response.json(await adminService.getAdminStats());
});

export const getListings = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.getSubmittedProperties(request.query));
});

export const getAdminPropertyByIdController = asyncHandler(async (request: Request, response: Response) => {
  response.json(await getPropertyById(String(request.params.id), "admin"));
});

export const approveListing = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.moderateProperty(String(request.params.id), "approved"));
});

export const rejectListing = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.moderateProperty(String(request.params.id), "rejected"));
});

export const removeListing = asyncHandler(async (request: Request, response: Response) => {
  await adminService.removeListing(String(request.params.id));
  response.status(204).send();
});

export const getUsers = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.getUsers(request.query));
});

export const suspendUser = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.updateUserStatus(String(request.params.id), "suspended"));
});

export const deleteUser = asyncHandler(async (request: Request, response: Response) => {
  await adminService.deleteSpamUser(String(request.params.id));
  response.status(204).send();
});

export const getOwnerApprovals = asyncHandler(async (_request: Request, response: Response) => {
  response.json(await ownerVerificationService.getPendingOwnerApprovals());
});

export const getOwnerApprovalById = asyncHandler(async (request: Request, response: Response) => {
  response.json(await ownerVerificationService.getPendingOwnerApprovalById(String(request.params.id)));
});

export const getUserProperties = asyncHandler(async (request: Request, response: Response) => {
  const id = String(request.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      verificationStatus: true,
      createdAt: true,
      properties: {
        select: {
          id: true,
          title: true,
          location: true,
          status: true,
          price: true,
          occupiedBeds: true,
          bedsSingle: true,
          bedsDouble: true,
          bedsTriple: true,
          createdAt: true,
          _count: { select: { reviews: true, tenants: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) throw new AppError("User not found", 404);

  const propertiesWithRatings = await Promise.all(
    user.properties.map(async (property) => {
      const rating = await getPropertyRating(property.id);
      const totalBeds =
        (property.bedsSingle ?? 0) +
        (property.bedsDouble ?? 0) +
        (property.bedsTriple ?? 0);
      return {
        ...property,
        totalBeds,
        availableBeds: Math.max(0, totalBeds - property.occupiedBeds),
        rating,
      };
    })
  );

  response.json({ user, properties: propertiesWithRatings });
});

export const getPropertyManagement = asyncHandler(async (request: Request, response: Response) => {
  const id = String(request.params.id);
  const property = await adminService.getPropertyManagement(id);
  if (!property) throw new AppError("Property not found", 404);
  response.json(property);
});

export const approveOwner = asyncHandler(async (request: Request, response: Response) => {
  const id = String(request.params.id);
  const result = await ownerVerificationService.reviewOwnerApproval(id, "approved");

  const owner = await prisma.user.findUnique({
    where: { id },
    select: { clerkId: true },
  });

  if (owner?.clerkId) {
    await clerkClient.users.updateUserMetadata(owner.clerkId, {
      publicMetadata: {
        role: "owner",
        verificationStatus: "approved",
      },
    });
  }

  response.json(result);
});

export const rejectOwner = asyncHandler(async (request: Request, response: Response) => {
  const id = String(request.params.id);
  const result = await ownerVerificationService.reviewOwnerApproval(id, "rejected");

  const owner = await prisma.user.findUnique({
    where: { id },
    select: { clerkId: true },
  });

  if (owner?.clerkId) {
    await clerkClient.users.updateUserMetadata(owner.clerkId, {
      publicMetadata: {
        role: "owner",
        verificationStatus: "rejected",
      },
    });
  }

  response.json(result);
});

export const updateListing = asyncHandler(async (request: Request, response: Response) => {
  const id = String(request.params.id);
  const files = (request.files as Express.Multer.File[]) ?? [];
  const data = request.body;

  const updated = await adminService.updateListingByAdmin(id, data);

  if (files.length) {
    const uploads = await Promise.all(files.map(uploadImage));
    const imagesToAdd = uploads.map(u => ({
      url: u.secure_url,
      publicId: u.public_id
    }));
    await adminService.addImagesToProperty(id, imagesToAdd);
    const refreshed = await getPropertyById(id);
    response.json(refreshed);
  } else {
    response.json(updated);
  }
});

export const getAllProperties = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.getAllProperties(request.query));
});


export const getAdminCoupons = asyncHandler(async (_request: Request, response: Response) => {
  const coupons = await prisma.coupon.findMany({
    select: {
      id: true,
      code: true,
      affiliateId: true,
      discountType: true,
      value: true,
      validFrom: true,
      validTo: true,
      targetPlans: true,
      isActive: true,
      currentUses: true,
      maxUses: true,
    },
  });

  const adminCoupons = await Promise.all(
    coupons.map(async (coupon) => {
      let partnerName = "Admin";

      if (coupon.affiliateId) {
        const partner = await prisma.user.findUnique({
          where: { id: coupon.affiliateId },
          select: { name: true },
        });

        partnerName = partner?.name ?? "Unknown";
      }
      

      return {
        id: coupon.id,
        partnerName,
        code: coupon.code,
        type: "ADMIN",
        uses: coupon.currentUses,
        successful: coupon.currentUses,
        discountType: coupon.discountType,
        value: coupon.value,
        targetPlans: coupon.targetPlans,
        validFrom: coupon.validFrom,
        validTo: coupon.validTo,
        isActive: coupon.isActive,
      };
    })
  );

  const referrals = await prisma.referral.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const partnerCoupons = referrals.map((referral) => ({
    id: referral.id,
    partnerName: referral.user?.name ?? "Unknown",
    code: referral.code,
    type: "PARTNER",
    uses: referral.invites,
    successful: referral.successful,
    isActive: true,
  }));
    response.json([
    ...adminCoupons,
    ...partnerCoupons,
    ]);
});

export const addPropertyImages = asyncHandler(async (req: Request, res: Response) => {
  const propertyId = String(req.params.id);
  const files = (req.files as Express.Multer.File[]) ?? [];

  if (!files.length) {
    throw new AppError("No images uploaded", 400);
  }

  const uploads = await Promise.all(files.map(uploadImage));

  const result = await adminService.addImagesToProperty(
    propertyId,
    uploads.map((u) => ({
      url: u.secure_url,
      publicId: u.public_id
    }))
  );

  res.json(result);
});

export const replacePropertyImage = asyncHandler(async (req: Request, res: Response) => {
  const imageId = String(req.params.imageId);
  const file = (req.files as Express.Multer.File[])?.[0];

  if (!file) {
    throw new AppError("Image required", 400);
  }

  const existing = await prisma.propertyImage.findUnique({
    where: { id: imageId },
  });

  if (!existing) {
    throw new AppError("Image not found", 404);
  }

  // FIXED: Changed uploadPanorama to uploadImage
  const uploaded = await uploadImage(file);

  if (existing.publicId) {
    await deleteCloudinaryImage(existing.publicId);
  }

  const result = await adminService.replacePropertyImage(
    imageId,
    uploaded.secure_url,
    uploaded.public_id
  );

  res.json(result);
});

export const deletePropertyImage = asyncHandler(async (req: Request, res: Response) => {
  const propertyId = String(req.params.id);
  const imageId = String(req.params.imageId);
  console.log("PROPERTY ID:", req.params.id);
  console.log("IMAGE ID:", req.params.imageId);
  const image = await prisma.propertyImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image || image.propertyId !== propertyId) {
    throw new AppError("Image not found", 404);
  }

  if (!image) {
    throw new AppError("Image not found", 404);
  }

  if (image.publicId) {
    await deleteCloudinaryImage(image.publicId);
  }

  await adminService.deletePropertyImage(imageId);
  console.log("DELETE SUCCESS");
  res.status(204).send();
});

export const createAdminReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const propertyId = String(id);
  const { studentName, rating, content } = req.body;

  const property = await prisma.property.findUnique({
    where: { id: propertyId }
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const review = await prisma.review.create({
    data: {
      propertyId,
      studentName,
      isAdminGenerated: true,
      content: content,
      cleanliness: Number(rating),
      food: Number(rating),
      security: Number(rating),
      management: Number(rating),
      location: Number(rating),
    } as unknown as Prisma.ReviewUncheckedCreateInput,
  });

  res.status(201).json(review);
});

export const deleteAdminReview = asyncHandler(async (request: Request, response: Response) => {
  const { id } = request.params;
  const reviewId = String(id);

  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  await prisma.review.delete({
    where: { id: reviewId }
  });

  response.status(204).send();
});

export const addPanoramaController = async (req: Request, res: Response) => {
  console.log("1. Reached addPanoramaController");
  try {
    const propertyId = String(req.params.id);
    console.log("2. Property ID:", propertyId);
    const file = req.file as Express.Multer.File;
    console.log("3. File received:", file ? { filename: file.originalname, size: file.size, mimetype: file.mimetype } : "undefined");

    if (!file) {
      console.log("4. No file provided");
      return res.status(400).json({ success: false, message: "Panorama image is required" });
    }

    console.log("5. Starting cloud upload...");
    // FIXED: Changed uploadImage to uploadPanorama
    const uploaded = await uploadPanorama(file);
    console.log("6. Cloud upload successful. URL:", uploaded.secure_url);

    const { title, sortOrder } = req.body;
    console.log("7. Request body:", { title, sortOrder });

    const panorama = await prisma.propertyPanorama.create({
      data: {
        propertyId,
        title,
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });
    console.log("8. Panorama saved to Prisma:", panorama.id);

    console.log("9. Sending success response");
    return res.status(201).json({ success: true, data: panorama });
  } catch (error) {
    console.error("10. Error in addPanoramaController:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message: "Upload failed", error: message });
  }
};

export const updatePanorama = asyncHandler(async (req: Request, res: Response) => {
  const panoramaId = String(req.params.panoramaId);
  const { title, sortOrder } = req.body;

  const panorama = await prisma.propertyPanorama.update({
    where: { id: panoramaId },
    data: {
      title,
      sortOrder: sortOrder ? Number(sortOrder) : undefined,
    },
  });

  res.json(panorama);
});

export const deletePanorama = asyncHandler(async (req: Request, res: Response) => {
  const panoramaId = String(req.params.panoramaId);

  const panorama = await prisma.propertyPanorama.findUnique({
    where: { id: panoramaId },
  });

  if (!panorama) {
    throw new AppError("Panorama not found", 404);
  }

  if (panorama.publicId) {
    await deleteCloudinaryImage(panorama.publicId);
  }

  await prisma.propertyPanorama.delete({
    where: { id: panoramaId },
  });

  res.status(204).send();
});

export const replacePanoramaImage = asyncHandler(async (req: Request, res: Response) => {
  const panoramaId = String(req.params.panoramaId);
  const file = req.file as Express.Multer.File;

  if (!file) {
    throw new AppError("Panorama image is required", 400);
  }

  const panorama = await prisma.propertyPanorama.findUnique({
    where: { id: panoramaId },
  });

  if (!panorama) {
    throw new AppError("Panorama not found", 404);
  }

  // Upload new image
  const uploaded = await uploadImage(file);

  if (panorama.publicId) {
    await deleteCloudinaryImage(panorama.publicId);
  }

  const updatedPanorama = await prisma.propertyPanorama.update({
    where: { id: panoramaId },
    data: {
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
    },
  });

  res.json(updatedPanorama);
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  // Try deleting from Coupon table first
  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (coupon) {
    await prisma.coupon.delete({
      where: { id },
    });

    return res.status(204).send();
  }

  // Otherwise delete from Referral table
  const referral = await prisma.referral.findUnique({
    where: { id },
  });

  if (referral) {
    await prisma.referral.delete({
      where: { id },
    });

    return res.status(204).send();
  }

  throw new AppError("Coupon or Referral not found", 404);
});