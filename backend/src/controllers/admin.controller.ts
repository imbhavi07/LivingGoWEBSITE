import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as adminService from "../services/admin.service";
import { getPropertyById } from "../services/property.service";
import * as ownerVerificationService from "../services/owner-verification.service";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getPropertyRating } from "../services/property.service";
import { uploadImage, deleteCloudinaryImage } from "../services/cloudinary.service";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const getStats = asyncHandler(async (_request: Request, response: Response) => {
  response.json(await adminService.getAdminStats());
});

export const getListings = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.getSubmittedProperties(request.query));
});

export const getListingDetails = asyncHandler(async (request: Request, response: Response) => {
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
  const id = String(request.params.id); // ← was request.params (bug fix from earlier)

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

// ← NEW: full property management detail
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
  const result = await adminService.updateListingByAdmin(id, request.body);
  response.json(result);
});

export const getAllProperties = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.getAllProperties(request.query));
});


export const getAdminCoupons = asyncHandler(async (_request: Request, response: Response) => {
  // Get all coupons with basic info and affiliateId
  const coupons = await prisma.coupon.findMany({
    select: {
      id: true,
      code: true,
      affiliateId: true,
    }
  });

  // For each coupon, get the partner name and count visits
  const couponsWithStats = await Promise.all(
    coupons.map(async (coupon) => {
      let partnerName = "Unknown";
      if (coupon.affiliateId) {
        const partner = await prisma.user.findUnique({
          where: { id: coupon.affiliateId },
          select: { name: true }
        });
        partnerName = partner?.name || "Unknown";
      }

      // Count total visits for this coupon
      const totalVisits = await prisma.visit.count({
        where: {
          couponCode: coupon.code
        }
      });

      // Count converted bookings (visits with leadStatus VISIT_COMPLETED or FULLY_BOOKED)
      const convertedBookingsCount = await prisma.visit.count({
        where: {
          couponCode: coupon.code,
          leadStatus: {
            in: ["VISIT_COMPLETED", "FULLY_BOOKED"]
          }
        }
      });

      return {
        id: coupon.id,
        partnerName,
        couponCode: coupon.code,
        totalVisits,
        totalConvertedBookings: convertedBookingsCount
      };
    })
  );

  response.json(couponsWithStats);
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
      publicId: u.public_id,
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
  const imageId = String(req.params.imageId);

  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    throw new AppError("Image not found", 404);
  }

  if (image.publicId) {
    await deleteCloudinaryImage(image.publicId);
  }

  await adminService.deletePropertyImage(imageId);

  res.status(204).send();
});