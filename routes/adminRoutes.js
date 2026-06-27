import express from "express";
import multer from "multer";
import { authorize, protect } from "../middleware/authMiddleware.js";
import path from "path";
import crypto from "crypto";
import {
  exportMembers,
  getAdminMembers,
  getAdminMemberById,
  createAdminMember,
  updateAdminMember,
  deleteAdminMember,
  resetMemberPassword,
  getAdminMemberIds,
  bulkDeleteMembers,
  exportSelectedMembers,
} from "../controllers/adminController.js";
import {
  importPreview,
  getPreviewData,
  updatePreviewRow,
  overridePreviewRow,
  getMatchingIds,
  comparePreviewRow,
  resolveExcelDuplicate,
  importProgress,
  importConfirm,
  getImportHistory,
  getImportHistoryById,
  getImportHistoryReport,
  deleteImportHistory,
} from "../controllers/importController.js";

const router = express.Router();

// Setup Multer for disk storage (for Excel import)
const excelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/excel/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
    cb(null, `import-${uniqueSuffix}${ext}`);
  },
});

const excelFilter = (req, file, cb) => {
  if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only .xlsx files are allowed."), false);
  }
};

const uploadExcel = multer({
  storage: excelStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: excelFilter,
});

// Setup Multer for disk storage (for profile photos)
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profiles/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed."), false);
  }
};

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: fileFilter,
});

// All routes in this file require admin privileges
router.use(protect, authorize("admin"));

// Member Management CRUD
router.get("/members", getAdminMembers);
router.get("/members/ids", getAdminMemberIds);
router.delete("/members/bulk-delete", bulkDeleteMembers);
router.post("/members/export-selected", exportSelectedMembers);
router.post("/members", uploadProfile.single("photo"), createAdminMember);
router.get("/members/:id", getAdminMemberById);
router.put("/members/:id", uploadProfile.single("photo"), updateAdminMember);
router.delete("/members/:id", deleteAdminMember);
router.put("/members/:id/reset-password", resetMemberPassword);

// POST /api/admin/import/preview
router.post("/import/preview", uploadExcel.single("excel"), importPreview);
router.post("/import/preview/:id/data", getPreviewData);
router.put("/import/preview/:id/row/:rowNumber", updatePreviewRow);
router.post("/import/preview/:id/override", overridePreviewRow);
router.post("/import/preview/:id/matching", getMatchingIds);
router.get("/import/preview/:id/compare/:rowNumber", comparePreviewRow);
router.post("/import/preview/:id/resolve/:rowNumber", resolveExcelDuplicate);
router.get("/import/preview/:id/progress", importProgress);

// POST /api/admin/import/confirm
router.post("/import/confirm", importConfirm);

// Import History
router.get("/import/history", getImportHistory);
router.get("/import/history/:id", getImportHistoryById);
router.get("/import/history/:id/reports/:type", getImportHistoryReport);
router.get("/import/report/:id/:type", getImportHistoryReport); // backwards compat/alias
router.delete("/import/history/:id", deleteImportHistory);

// GET /api/admin/export
router.get("/export", exportMembers);

export default router;
