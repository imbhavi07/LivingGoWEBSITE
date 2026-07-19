import { Router } from "express";
import { verifyWebhook, handleIncomingMessage } from "../controllers/whatsapp.controller";

export const whatsappRouter = Router();

// GET request is used by Meta to verify your token
whatsappRouter.get("/", verifyWebhook);

// POST request is used by Meta to send you incoming messages
whatsappRouter.post("/", handleIncomingMessage);