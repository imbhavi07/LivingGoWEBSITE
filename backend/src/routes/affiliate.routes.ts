/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Router } from "express";
import { requireAuth } from "../middleware/superAdmin.middleware";
import { registerAffiliate, getMyAffiliateDashboard } from "../controllers/affiliate.controller";

const router = Router();

router.post("/affiliate/register", requireAuth, registerAffiliate);
router.get("/affiliate/me/dashboard", requireAuth, getMyAffiliateDashboard);

export default router;
