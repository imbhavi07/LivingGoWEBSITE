import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as adminService from "../services/admin.service";
import { getPropertyById } from "../services/property.service";
import * as ownerVerificationService from "../services/owner-verification.service";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getPropertyRating } from "../services/property.service";

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