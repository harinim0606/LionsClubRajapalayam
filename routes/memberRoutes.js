import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getMembers,
  getMyProfile,
  updateMyProfile,
  uploadMyPhoto,
  deleteMyPhoto,
  getMemberById,
  updateMemberProfile,
  uploadProfilePhoto,
  deleteProfilePhoto
} from "../controllers/memberController.js";

const router = express.Router();

// Configure Multer for profile photo uploads
const storage = multer.diskStorage({
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

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter
});

// All member directory routes require authentication
router.get("/", protect, getMembers);

// Authenticated user's own profile (must be before /:id)
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post("/me/photo", protect, upload.single("photo"), uploadMyPhoto);
router.delete("/me/photo", protect, deleteMyPhoto);

// Member profile routes
router.get("/:id", protect, getMemberById);
router.put("/:id", protect, updateMemberProfile);
router.post("/:id/photo", protect, upload.single("photo"), uploadProfilePhoto);
router.delete("/:id/photo", protect, deleteProfilePhoto);

export default router;
