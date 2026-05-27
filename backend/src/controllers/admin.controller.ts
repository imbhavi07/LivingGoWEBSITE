import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import * as adminService from "../services/admin.service";
import { getPropertyById } from "../services/property.service";
import * as ownerVerificationService from "../services/owner-verification.service";

export const getStats = asyncHandler(async (_request: Request, response: Response) => {
  response.json(await adminService.getAdminStats());
});

export const getListings = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.getSubmittedProperties(request.query));
});

export const getListingDetails = asyncHandler(async (request: Request, response: Response) => {
  response.json(await getPropertyById(request.params.id, "admin"));
});

export const approveListing = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.moderateProperty(request.params.id, "approved"));
});

export const rejectListing = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.moderateProperty(request.params.id, "rejected"));
});

export const removeListing = asyncHandler(async (request: Request, response: Response) => {
  await adminService.removeListing(request.params.id);
  response.status(204).send();
});

export const getUsers = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.getUsers(request.query));
});

export const suspendUser = asyncHandler(async (request: Request, response: Response) => {
  response.json(await adminService.updateUserStatus(request.params.id, "suspended"));
});

export const deleteUser = asyncHandler(async (request: Request, response: Response) => {
  await adminService.deleteSpamUser(request.params.id);
  response.status(204).send();
});

export const getOwnerApprovals = asyncHandler(async (_request: Request, response: Response) => {
  response.json(await ownerVerificationService.getPendingOwnerApprovals());
});

export const getOwnerApprovalById = asyncHandler(async (request: Request, response: Response) => {
  response.json(await ownerVerificationService.getPendingOwnerApprovalById(request.params.id));
});

export const approveOwner = asyncHandler(async (request: Request, response: Response) => {
  response.json(await ownerVerificationService.reviewOwnerApproval(request.params.id, "approved"));
});

export const rejectOwner = asyncHandler(async (request: Request, response: Response) => {
  response.json(await ownerVerificationService.reviewOwnerApproval(request.params.id, "rejected"));
});
