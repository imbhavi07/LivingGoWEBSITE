import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as adminService from "../services/admin.service";
import { getPropertyById } from "../services/property.service";
import * as ownerVerificationService from "../services/owner-verification.service";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "../config/prisma";

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

export const approveOwner = asyncHandler(async (request: Request, response: Response) => {
  const id = String(request.params.id);

  // 1. Update DB via service
  const result = await ownerVerificationService.reviewOwnerApproval(id, "approved");

  // 2. Fetch clerkId from DB
  const owner = await prisma.user.findUnique({
    where: { id },
    select: { clerkId: true },
  });

  // 3. Update Clerk metadata so middleware sees role: "owner"
  if (owner?.clerkId) {
    await clerkClient.users.updateUserMetadata(owner.clerkId, {
      publicMetadata: {
        role: "owner",
        verificationStatus: "approved",
      },
    });
  }

  // 4. Send response
  response.json(result);
});

export const rejectOwner = asyncHandler(async (request: Request, response: Response) => {
  const id = String(request.params.id);

  // 1. Update DB via service
  const result = await ownerVerificationService.reviewOwnerApproval(id, "rejected");

  // 2. Fetch clerkId from DB
  const owner = await prisma.user.findUnique({
    where: { id },
    select: { clerkId: true },
  });

  // 3. Update Clerk metadata on rejection too
  if (owner?.clerkId) {
    await clerkClient.users.updateUserMetadata(owner.clerkId, {
      publicMetadata: {
        role: "owner",
        verificationStatus: "rejected",
      },
    });
  }

  // 4. Send response
  response.json(result);
});