/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Router } from "express";
import { handleClerkWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post("/", handleClerkWebhook);

export default router;