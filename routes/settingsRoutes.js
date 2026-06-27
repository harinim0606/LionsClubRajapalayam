import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();

// All settings routes require a logged-in user (admin or member)
router.use(protect);

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
