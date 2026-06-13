"use strict";
// backend/src/controllers/token-payment.controller.ts  (NEW FILE)
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
exports.ownerGetTokenPayments = exports.adminModerateTokenPayment = exports.adminGetTokenPayments = exports.getMyTokenPayments = exports.submitTokenPayment = void 0;
const async_handler_1 = require("../utils/async-handler");
const app_error_1 = require("../utils/app-error");
const tokenService = __importStar(require("../services/token-payment.service"));
function requireUser(req) {
    if (!req.user)
        throw new app_error_1.AppError("Authentication required", 401);
    return req.user;
}
// Student: submit UTR after paying token
exports.submitTokenPayment = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = requireUser(req);
    const propertyId = String(req.params.id);
    const { utrNumber } = req.body;
    if (!utrNumber?.trim())
        throw new app_error_1.AppError("UTR number is required", 400);
    const payment = await tokenService.createTokenPayment(user.id, propertyId, utrNumber.trim());
    res.status(201).json(payment);
});
// Student: get their own token payments
exports.getMyTokenPayments = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = requireUser(req);
    const payments = await tokenService.getStudentTokenPayments(user.id);
    res.json(payments);
});
// Admin: get all token payments (optional ?status=pending filter)
exports.adminGetTokenPayments = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const status = req.query.status;
    const payments = await tokenService.getAllTokenPayments(status);
    res.json(payments);
});
// Admin: approve or reject
exports.adminModerateTokenPayment = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const id = String(req.params.id);
    const { action } = req.body;
    if (!["approved", "rejected"].includes(action))
        throw new app_error_1.AppError("Invalid action", 400);
    const result = await tokenService.moderateTokenPayment(id, action);
    res.json(result);
});
// Owner: see payments for their properties
exports.ownerGetTokenPayments = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = requireUser(req);
    const payments = await tokenService.getOwnerTokenPayments(user.id);
    res.json(payments);
});
