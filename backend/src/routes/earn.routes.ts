import { Router } from 'express';
import { getEarnDashboard } from '../controllers/earn.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// This makes the full path /api/earn/dashboard
router.get('/dashboard', protect, getEarnDashboard); 

export default router;