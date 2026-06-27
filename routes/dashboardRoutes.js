import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { getMemberDashboard, getAdminDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

// Both members and admins can access the member dashboard
router.get("/member", protect, authorize("member", "admin"), getMemberDashboard);

// Admin-only dashboard
router.get("/admin", protect, authorize("admin"), getAdminDashboard);

export default router;
