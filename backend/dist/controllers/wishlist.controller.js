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
exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const app_error_1 = require("../utils/app-error");
const async_handler_1 = require("../utils/async-handler");
const wishlistService = __importStar(require("../services/wishlist.service"));
function requireUser(request) {
    if (!request.user)
        throw new app_error_1.AppError("Authentication required", 401);
    return request.user;
}
exports.getWishlist = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    response.json(await wishlistService.getWishlist(user.id));
});
exports.addToWishlist = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    response.status(201).json(await wishlistService.addToWishlist(user.id, String(request.params.propertyId)));
});
exports.removeFromWishlist = (0, async_handler_1.asyncHandler)(async (request, response) => {
    const user = requireUser(request);
    await wishlistService.removeFromWishlist(user.id, String(request.params.propertyId));
    response.status(204).send();
});
