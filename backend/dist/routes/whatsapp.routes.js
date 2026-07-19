"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappRouter = void 0;
const express_1 = require("express");
const whatsapp_controller_1 = require("../controllers/whatsapp.controller");
exports.whatsappRouter = (0, express_1.Router)();
// GET request is used by Meta to verify your token
exports.whatsappRouter.get("/", whatsapp_controller_1.verifyWebhook);
// POST request is used by Meta to send you incoming messages
exports.whatsappRouter.post("/", whatsapp_controller_1.handleIncomingMessage);
