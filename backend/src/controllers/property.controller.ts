import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import { uploadMany } from "../services/cloudinary.service";
import * as propertyService from "../services/property.service";

function requireUser(request: Request) {
  if (!request.user) throw new AppError("Authentication required", 401);
  return request.user;
}

export const createProperty = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);

  // Only approved owners can list properties
  // admins bypass this check
  if (user.role === "owner" && user.verificationStatus !== "approved") {
    const statusMessages: Record<string, string> = {
      not_required:             "Please complete your KYC verification before listing properties.",
      pending_email_verification: "Please verify your email before listing properties.",
      pending_approval:         "Your KYC is under review. You can list properties once approved.",
      rejected:                 "Your KYC verification was rejected. Please contact support.",
    };
    const message = statusMessages[user.verificationStatus] ?? "KYC verification required.";
    throw new AppError(message, 403);
  }

  const files = (request.files as Express.Multer.File[]) ?? [];
  const uploads = await uploadMany(files);
  const property = await propertyService.createProperty(
    user.id,
    request.body,
    uploads.map((upload) => ({ url: upload.secure_url, publicId: upload.public_id }))
  );

  response.status(201).json(property);
});

export const getProperties = asyncHandler(async (request: Request, response: Response) => {
  const result = await propertyService.getProperties(request.query, request.user?.role);
  response.json(result);
});

export const getPropertyById = asyncHandler(async (request: Request, response: Response) => {
  const property = await propertyService.getPropertyById(String(request.params.id), request.user?.role);
  response.json(property);
});

export const getOwnerProperties = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const result = await propertyService.getOwnerProperties(user.id, request.query);
  response.json(result);
});

export const getOwnerStats = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  response.json(await propertyService.getOwnerStats(user.id));
});

export const updateProperty = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const property = await propertyService.updateProperty(String(request.params.id), user.id, user.role, request.body);
  response.json(property);
});

export const deleteProperty = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  await propertyService.deleteProperty(String(request.params.id), user.id, user.role);
  response.status(204).send();
});

export const togglePropertyStatus = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const property = await propertyService.togglePropertyStatus(String(request.params.id), user.id, Boolean(request.body.isActive));
  response.json(property);
});