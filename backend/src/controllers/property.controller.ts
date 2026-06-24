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

  // Process image uploads through middleware
  const files = (request.files as Express.Multer.File[]) ?? [];
  const uploads = await uploadMany(files);

  // Extract room-type mappings from request body
  // Expect format: roomTypeMappings=[{"index":0,"roomType":"Bedroom 1"},{"index":1,"roomType":"Bedroom 2"},...]
  let roomTypeMappings = [];

try {
  roomTypeMappings = request.body.roomTypeMappings
    ? JSON.parse(request.body.roomTypeMappings as string)
    : [];
} catch (err) {
  console.error("roomTypeMappings parse failed", err);
  roomTypeMappings = [];
}


console.log("BODY", request.body);
console.log("FILES", files.length);
console.log("USER", user.id);

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
  const [rating, reviews] = await Promise.all([
    propertyService.getPropertyRating(String(request.params.id)),
    propertyService.getPropertyReviews(String(request.params.id)),
  ]);
  response.json({ ...property, rating, reviews });
});

export const getApprovedPropertyList = asyncHandler(async (_request: Request, response: Response) => {
  const properties = await propertyService.getApprovedPropertyList();
  response.json(properties);
});

export const getStudentResidence = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const residence = await propertyService.getStudentResidence(user.id);
  response.json(residence ?? null);
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
  const property = await propertyService.getPropertyById(String(request.params.id), request.user?.role);

  if (!property) throw new AppError("Property not found", 404);
  if (user.role !== "admin" && property.ownerId !== user.id) throw new AppError("Forbidden", 403);

  // Process image uploads if any new files were provided
  let roomTypeMappings: { index: number; roomType: string }[] = [];
  let images: { url: string; publicId: string }[] = [];

  if ((request.files as Express.Multer.File[])?.length) {
    const files = (request.files as Express.Multer.File[]) ?? [];
    const rawUploads = await uploadMany(files);
    images = rawUploads.map(upload => ({ url: upload.secure_url, publicId: upload.public_id }));

    // Extract room-type mappings from request body
    roomTypeMappings = request.body.roomTypeMappings
      ? JSON.parse(request.body.roomTypeMappings as string)
      : [];
  }

  const updatedProperty = await propertyService.updateProperty(
    String(request.params.id),
    user.id,
    user.role,
    {
      ...request.body,
      // Include uploads and mappings if new files were provided
      ...(images.length > 0 ? {
        images: { create: images },
        roomTypeMappings: roomTypeMappings
      } : {})
    }
  );

  response.json(updatedProperty);
});

export const deleteProperty = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  await propertyService.deleteProperty(String(request.params.id), user.id, user.role);
  response.status(204).send();
});

export const togglePropertyStatus = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const property = await propertyService.getPropertyById(String(request.params.id), user.role);
  if (!property) throw new AppError("Property not found", 404);
  if (property.ownerId !== user.id) throw new AppError("Forbidden", 403);

  return propertyService.togglePropertyStatus(String(request.params.id), user.id, Boolean(request.body.isActive));
});

export const createReview = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const propertyId = String(request.params.id);
  const review = await propertyService.createReview(user.id, propertyId, request.body);
  response.status(201).json(review);
});

export const markResidence = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const propertyId = String(request.params.id);
  const result = await propertyService.markResidence(user.id, propertyId);
  response.json({ success: true, ...result });
});