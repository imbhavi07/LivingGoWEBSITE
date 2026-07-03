import { Router } from 'express';
import { getEarnDashboard, requestReferralCode } from "../controllers/earn.controller";
import { protect } from '../middleware/auth.middleware';
import { approveReferral, rejectReferral } from '../controllers/earn.controller';
import { authorize } from '../middleware/auth.middleware';   

const router = Router();

// This makes the full path /api/earn/dashboard
router.get('/dashboard', protect, getEarnDashboard); 
router.post(
    "/request-code",
    protect,
    requestReferralCode
); 
router.patch(
    "/:id/approve",
    protect,
    authorize("admin", "SUPER_ADMIN"),
    approveReferral
);

router.patch(
    "/:id/reject",
    protect,
    authorize("admin", "SUPER_ADMIN"),
    rejectReferral
);

export default router;