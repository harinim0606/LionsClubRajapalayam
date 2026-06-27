import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  exportAllMembers,
  exportFilteredMembers,
  exportSelectedMembers,
  downloadTemplate,
  exportStatistics,
  getExportHistory,
  getExportStats,
  getFilterPreview,
  getPresets,
  savePreset,
  deletePreset,
} from "../controllers/exportController.js";

const router = express.Router();

// All export routes require authentication + admin role
router.use(protect);
router.use(authorize("admin"));

// ── Export Endpoints
router.get("/members",    exportAllMembers);        // GET  /api/export/members
router.post("/filter",    exportFilteredMembers);   // POST /api/export/filter
router.post("/selected",  exportSelectedMembers);   // POST /api/export/selected
router.get("/template",   downloadTemplate);        // GET  /api/export/template
router.get("/statistics", exportStatistics);        // GET  /api/export/statistics

// ── UI Data Endpoints
router.get("/stats",          getExportStats);      // GET  /api/export/stats
router.get("/history",        getExportHistory);    // GET  /api/export/history
router.post("/filter-preview", getFilterPreview);   // POST /api/export/filter-preview

// ── Preset Endpoints
router.get("/presets",         getPresets);         // GET  /api/export/presets
router.post("/presets",        savePreset);         // POST /api/export/presets
router.delete("/presets/:id",  deletePreset);       // DELETE /api/export/presets/:id

export default router;
