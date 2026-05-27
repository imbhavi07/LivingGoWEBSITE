import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

export const wishlistRouter = Router();

wishlistRouter.use(authenticate, authorize("student"));
wishlistRouter.get("/", wishlistController.getWishlist);
wishlistRouter.post("/:propertyId", wishlistController.addToWishlist);
wishlistRouter.delete("/:propertyId", wishlistController.removeFromWishlist);
