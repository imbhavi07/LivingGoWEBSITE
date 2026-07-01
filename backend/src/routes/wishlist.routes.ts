import { Router, RequestHandler } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { clerkAuthenticate, authorize } from "../middleware/auth.middleware";

export const wishlistRouter = Router();

wishlistRouter.use(clerkAuthenticate as RequestHandler);
wishlistRouter.use(authorize("student") as RequestHandler);
wishlistRouter.get("/", wishlistController.getWishlist as RequestHandler);
wishlistRouter.post("/:propertyId", wishlistController.addToWishlist as RequestHandler);
wishlistRouter.delete("/:propertyId", wishlistController.removeFromWishlist as RequestHandler);
