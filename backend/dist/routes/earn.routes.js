"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const earn_controller_1 = require("../controllers/earn.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const earn_controller_2 = require("../controllers/earn.controller");
const auth_middleware_2 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// This makes the full path /api/earn/dashboard
router.get('/dashboard', auth_middleware_1.protect, earn_controller_1.getEarnDashboard);
router.post("/request-code", auth_middleware_1.protect, earn_controller_1.requestReferralCode);
router.patch("/:id/approve", auth_middleware_1.protect, (0, auth_middleware_2.authorize)("admin", "SUPER_ADMIN"), earn_controller_2.approveReferral);
router.patch("/:id/reject", auth_middleware_1.protect, (0, auth_middleware_2.authorize)("admin", "SUPER_ADMIN"), earn_controller_2.rejectReferral);
exports.default = router;
