import express from "express";
import { login, changePassword, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes (require JWT verification)
router.post("/change-password", protect, changePassword);
router.get("/me", protect, getMe);

export default router;
