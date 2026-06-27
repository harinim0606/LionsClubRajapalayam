import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getBirthdays,
  getAnniversaries,
  getMembers,
  exportContacts,
  logCommunication
} from "../controllers/communicationController.js";

const router = express.Router();

// All communication routes require authentication (both members and admins can access)
router.use(protect);

router.get("/dashboard", getDashboardStats);
router.get("/birthdays", getBirthdays);
router.get("/anniversaries", getAnniversaries);
router.post("/members", getMembers);
router.post("/export-contacts", exportContacts);
router.post("/audit", logCommunication);

export default router;
