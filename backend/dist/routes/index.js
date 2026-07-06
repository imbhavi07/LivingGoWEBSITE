"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const admin_routes_1 = require("./admin.routes");
const auth_routes_1 = require("./auth.routes");
const owner_routes_1 = require("./owner.routes");
const property_routes_1 = require("./property.routes");
const upload_routes_1 = require("./upload.routes");
const wishlist_routes_1 = require("./wishlist.routes");
const user_routes_1 = require("./user.routes");
const kyc_routes_1 = __importDefault(require("./kyc.routes"));
const webhook_routes_1 = __importDefault(require("./webhook.routes"));
const token_payment_routes_1 = require("./token-payment.routes");
const couponController = __importStar(require("../controllers/coupon.controller"));
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "LivingGo-backend" });
});
exports.apiRouter.use("/auth", auth_routes_1.authRouter);
exports.apiRouter.use("/properties", property_routes_1.propertyRouter);
exports.apiRouter.use("/wishlist", wishlist_routes_1.wishlistRouter);
exports.apiRouter.use("/user", user_routes_1.userRouter);
exports.apiRouter.use("/kyc", kyc_routes_1.default);
exports.apiRouter.use("/owner", owner_routes_1.ownerRouter);
exports.apiRouter.use("/webhooks/clerk", webhook_routes_1.default);
exports.apiRouter.use("/admin", admin_routes_1.adminRouter);
exports.apiRouter.use("/uploads", upload_routes_1.uploadRouter);
exports.apiRouter.use("/token-payments", token_payment_routes_1.tokenPaymentRouter);
// Public coupon application route
exports.apiRouter.post("/coupons/apply", couponController.applyCoupon);
