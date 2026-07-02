import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { clerkAuthenticate, authorize } from "../middleware/auth.middleware";

export const wishlistRouter = Router();

wishlistRouter.use(clerkAuthenticate, authorize("student"));
wishlistRouter.get("/", wishlistController.getWishlist);
wishlistRouter.post("/:propertyId", wishlistController.addToWishlist);
wishlistRouter.delete("/:propertyId", wishlistController.removeFromWishlist);