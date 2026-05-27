import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import { uploadMany } from "../services/cloudinary.service";
import * as propertyService from "../services/property.service";
import { prisma } from "../config/prisma";

function requireUser(request: Request) {
  if (!request.user) throw new AppError("Authentication required", 401);
  return request.user;
}

export const createProperty = asyncHandler(async (request: Request, response: Response) => {
  let userId: string;

  if (request.user) {
    userId = request.user.id;
  } else {
    // Clerk user — find by email
    const clerkEmail = request.body.clerkEmail as string;
    if (!clerkEmail) throw new AppError("Authentication required", 401);
    const owner = await prisma.user.findUnique({ where: { email: clerkEmail } });
    if (!owner) throw new AppError("Owner not found. Please sign up first.", 404);
    userId = owner.id;
  }

  const files = (request.files as Express.Multer.File[]) ?? [];
  const uploads = await uploadMany(files);
  const property = await propertyService.createProperty(
    userId,
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
