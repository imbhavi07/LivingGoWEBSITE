import { Router } from "express";
import express from "express";
import { handleClerkWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post(
  "/",
  express.raw({ type: "application/json" }),
  handleClerkWebhook
);

export default router;