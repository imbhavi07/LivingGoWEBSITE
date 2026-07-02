import type { Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import * as wishlistService from "../services/wishlist.service";

function requireUser(request: Request) {
  if (!request.user) throw new AppError("Authentication required", 401);
  return request.user;
}

export const getWishlist = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  response.json(await wishlistService.getWishlist(user.id));
});

export const addToWishlist = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  response.status(201).json(
  await wishlistService.addToWishlist(user.id, String(request.params.propertyId))
);
});

export const removeFromWishlist = asyncHandler(async (request: Request, response: Response) => {
  const user = requireUser(request);
  await wishlistService.removeFromWishlist(user.id, String(request.params.propertyId));
  response.status(204).send();
});