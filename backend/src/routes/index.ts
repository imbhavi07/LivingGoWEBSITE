import { Router } from "express";
import { adminRouter } from "./admin.routes";
import { authRouter } from "./auth.routes";
import { ownerRouter } from "./owner.routes";
import { propertyRouter } from "./property.routes";
import { uploadRouter } from "./upload.routes";
import { wishlistRouter } from "./wishlist.routes";
import { userRouter } from "./user.routes";
import { visitRouter } from "./visit.routes";
import { visitingRouter } from "./visiting.routes";
import kycRouter from "./kyc.routes";
import webhookRouter from "./webhook.routes";
import { tokenPaymentRouter } from "./token-payment.routes";
import * as couponController from "../controllers/coupon.controller";
import { internRouter } from "./intern.routes";
export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "LivingGo-backend" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/properties", propertyRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/visits", visitRouter);
apiRouter.use("/visiting", visitingRouter);
apiRouter.use("/kyc", kycRouter);
apiRouter.use("/owner", ownerRouter);
apiRouter.use("/webhooks/clerk", webhookRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/token-payments", tokenPaymentRouter);
apiRouter.use("/visiting/lead", internRouter);
apiRouter.post("/coupons/apply", couponController.applyCoupon);
