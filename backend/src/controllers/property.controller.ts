import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import { uploadMany } from "../services/cloudinary.service";
import * as propertyService from "../services/property.service";
import { PrismaClient } from "@prisma/client";

// Create a Prisma client instance for DB operations in this controller
const db = new PrismaClient();

type ImageWithUrl = { url: string; [key: string]: unknown };
type PropertyItem = { images?: ImageWithUrl[] } & Record<string, unknown>;

function requireUser(request: Request) {
  if (!request.user) {
    throw new AppError("Authentication required");
  }
  return request.user;
}

export const createProperty = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);

  // Verify user exists in Prisma database (protect against Clerk-Prisma desync)
  const dbUser = await db.user.findFirst({
    where: {
      OR: [
        { id: user.id },
        { clerkId: user.id }
      ]
    }
  });

  if (!dbUser) {
    console.error("Failed to map Clerk ID:", user.id);
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }

  if (user.role === "owner" && user.verificationStatus !== "approved") {
    const statusMessages: Record<string, string> = {
      not_required:             "Please complete your KYC verification before listing properties.",
      pending_email_verification: "Please verify your email before listing properties.",
      pending_approval:         "Your KYC is under review. You can list properties once approved.",
      rejected:                 "Your KYC validation was rejected. Please contact support.",
    };
    const message = statusMessages[user.verificationStatus] ?? "KYC verification required.";
    throw new AppError(message, 403);
  }

  // Process image uploads through middleware
  const files = (request.files as Express.Multer.File[]) ?? [];
  console.log("FILES RECEIVED:", files.length);
  const uploads = await uploadMany(files);
  console.log("UPLOADS COMPLETED:", uploads.length);

  // Extract room-type mappings from request body
  let roomTypeMappings: { roomCategory: string; }[] = [];

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

  // Wrap database operation in try/catch to prevent unhandled rejections
  try {
    const property = await propertyService.createProperty(
      dbUser.id, // Use the internal user id (CUID)
      request.body,
      uploads.map((upload, index) => ({
        url: upload.secure_url,
        publicId: upload.public_id,
        roomCategory:
          roomTypeMappings[index]?.roomCategory ?? "common",
      }))
    );

    response.status(201).json(property);
  } catch (error) {
    console.error("Property Creation Error:", error);
    return response.status(500).json({ error: "Failed to create property. Please try again." });
  }
});

export const getProperties = asyncHandler(
  async (request: Request, response: Response) => {
    const result = await propertyService.getProperties(
      request.query,
      request.user?.role
    );

    // Map the items to ensure the 'images' key exists and convert HEIC URLs
    if (result && typeof result === 'object' && 'items' in result && Array.isArray(result.items)) {
      result.items = result.items.map((item: PropertyItem) => ({
        ...item,
        images: item.images?.map((image: ImageWithUrl) => {
          let url = image.url;
          // Cloudinary auto-format injection for HEIC images
          if (url.includes('/upload/')) {
            url = url.replace('/upload/', '/upload/f_auto,q_auto/');
          }
          // Fallback extension replacement for HEIC
          url = url.replace(/\.heic$/i, '.jpg');

          return { ...image, url };
        }) || []
      }));
    }

    response.json(result);
  }
);

export const getPropertyById = asyncHandler(async (request: Request, response: Response) => {
  const propertyId = String(request.params.id);
  let internalUserId: string | undefined;
  
  if (request.user?.id) {
    const user = await db.user.findUnique({ where: { id: request.user.id } });
    if (!user) {
      console.error("Failed to map Clerk ID:", request.user.id);
      return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
    }
    internalUserId = user.id;
  }

  const property = await propertyService.getPropertyById(propertyId, request.user?.role, internalUserId);
  
  // Map the property to ensure the 'images' key exists and convert HEIC URLs
  const mappedProperty = {
    ...property,
    images: (property as PropertyItem).images?.map((image: ImageWithUrl) => {
      let url = image.url;
      if (url.includes('/upload/')) {
        url = url.replace('/upload/', '/upload/f_auto,q_auto/');
      }
      url = url.replace(/\.heic$/i, '.jpg');

      return { ...image, url };
    }) || []
  };

  const [rating, reviews] = await Promise.all([
    propertyService.getPropertyRating(propertyId),
    propertyService.getPropertyReviews(propertyId),
  ]);
  
  response.json({ ...mappedProperty, rating, reviews });
});

export const getApprovedPropertyList = asyncHandler(async (_request: Request, response: Response) => {
  const properties = await propertyService.getApprovedPropertyList();
  response.json(properties);
});

export const getStudentResidence = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!internalUser) {
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }
  const residence = await propertyService.getStudentResidence(internalUser.id);
  response.json(residence ?? null);
});

export const updateProperty = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!internalUser) {
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }

  const property = await propertyService.getPropertyById(String(request.params.id), request.user?.role, internalUser.id);

  if (!property) throw new AppError("Property not found", 404);
  if (user.role !== "admin" && property.ownerId !== internalUser.id) throw new AppError("Forbidden", 403);

  // Process image uploads if any new files were provided
  let roomTypeMappings: { roomCategory: string; }[] = [];
  let images: {
    url: string;
    publicId: string;
    roomCategory: string;
  }[] = [];

  if ((request.files as Express.Multer.File[])?.length) {
    const files = (request.files as Express.Multer.File[]) ?? [];

    const rawUploads = await uploadMany(files);
    images = rawUploads.map((upload, index) => ({
      url: upload.secure_url,
      publicId: upload.public_id,
      roomCategory:
        roomTypeMappings[index]?.roomCategory ?? "common",
    }));

    // Extract room-type mappings from request body
    roomTypeMappings = request.body.roomTypeMappings
      ? JSON.parse(request.body.roomTypeMappings as string)
      : [];
  }

  const updatedProperty = await propertyService.updateProperty(
    String(request.params.id),
    internalUser.id,
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
  const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!internalUser) {
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }

  await propertyService.deleteProperty(String(request.params.id), internalUser.id, user.role);
  response.status(204).send();
});

export const togglePropertyStatus = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!internalUser) {
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }

  const property = await propertyService.getPropertyById(String(request.params.id), user.role, internalUser.id);
  if (!property) throw new AppError("Property not found", 404);
  if (property.ownerId !== internalUser.id) throw new AppError("Forbidden", 403);

  return propertyService.togglePropertyStatus(String(request.params.id), internalUser.id, Boolean(request.body.isActive));
});

export const createReview = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!internalUser) {
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }
  const propertyId = String(request.params.id);
  const review = await propertyService.createReview(internalUser.id, propertyId, request.body);
  response.status(201).json(review);
});

export const markResidence = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const propertyId = String(request.params.id);

  const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!internalUser) {
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }

  const result = await propertyService.markResidence(internalUser.id, propertyId);
  return response.json({ success: true, ...result });
});

export const getFeaturedProperty = asyncHandler(async (_request: Request, response: Response) => {
  const property = await propertyService.getFeaturedProperty();

  if (!property) {
    throw new AppError("No featured property found", 404);
  }

  // Fetch rating and reviews so the featured card can display them
  const [rating, reviews] = await Promise.all([
    propertyService.getPropertyRating(property.id),
    propertyService.getPropertyReviews(property.id),
  ]);

  return response.json({ ...property, rating, reviews });
});

export const getOwnerStats = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
  if (!internalUser) {
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }
  const stats = await propertyService.getOwnerStats(internalUser.id);
  response.json(stats);
});

export const getOwnerProperties = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  const internalUser = await db.user.findUnique({ where: { clerkId: user.id } });
  
  if (!internalUser) {
    return response.status(404).json({ error: "User profile missing from database. Please re-authenticate." });
  }
  
  const result = await propertyService.getOwnerProperties(internalUser.id, request.query);

  // If result has items, map them into a NEW object to avoid mutating Prisma's strict types
  if (result && typeof result === 'object' && 'items' in result && Array.isArray(result.items)) {
    const mappedItems = result.items.map((item: PropertyItem) => ({
      ...item,
      images: item.images?.map((image: ImageWithUrl) => {
        let url = image.url;
        
        // Cloudinary auto-format injection for HEIC images
        if (url.includes('/upload/')) {
          url = url.replace('/upload/', '/upload/f_auto,q_auto/');
        }
        // Fallback extension replacement for HEIC
        url = url.replace(/\.heic$/i, '.jpg');

        return { ...image, url };
      }) || []
    }));

    // Send the new combined payload directly
    return response.json({
      ...result,
      items: mappedItems
    });
  }

  // Fallback if no items array exists
  return response.json(result);
});