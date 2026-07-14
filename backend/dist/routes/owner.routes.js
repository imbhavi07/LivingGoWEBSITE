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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerRouter = void 0;
const express_1 = require("express");
const propertyController = __importStar(require("../controllers/property.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const property_validation_1 = require("../validations/property.validation");
exports.ownerRouter = (0, express_1.Router)();
// All owner routes protected by Clerk
exports.ownerRouter.use(auth_middleware_1.clerkAuthenticate, (0, auth_middleware_1.authorize)("owner", "admin"));
exports.ownerRouter.get("/dashboard/stats", propertyController.getOwnerStats);
exports.ownerRouter.get("/properties", propertyController.getOwnerProperties);
exports.ownerRouter.get("/properties/:id", (0, validate_middleware_1.validate)(property_validation_1.propertyIdSchema), propertyController.getPropertyById);
exports.ownerRouter.post("/properties", upload_middleware_1.uploadImages, (0, validate_middleware_1.validate)(property_validation_1.createPropertySchema), propertyController.createProperty);
exports.ownerRouter.put("/properties/:id", (0, validate_middleware_1.validate)(property_validation_1.updatePropertySchema), propertyController.updateProperty);
exports.ownerRouter.delete("/properties/:id", (0, validate_middleware_1.validate)(property_validation_1.propertyIdSchema), propertyController.deleteProperty);
exports.ownerRouter.patch("/properties/:id/status", (0, validate_middleware_1.validate)(property_validation_1.togglePropertyStatusSchema), propertyController.togglePropertyStatus);
