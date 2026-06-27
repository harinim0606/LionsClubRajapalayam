import XLSX from "xlsx";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Member from "../models/Member.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Clean up preview cache files older than 24 hours.
 * Called automatically before each new preview is created.
 */
const cleanupOldPreviews = () => {
  try {
    const files = fs.readdirSync(PREVIEWS_DIR);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    files.forEach(file => {
      const filePath = path.join(PREVIEWS_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (_) {
    // Non-fatal — log silently
  }
};

/**
 * Safely delete a file without throwing.
 */
const safeUnlink = (filePath) => {
  try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
};

// Helper for generating secure random 12-char password
const generateRandomPassword = () => {
  return crypto.randomBytes(9).toString('base64').replace(/[/+=]/g, '').substring(0, 12);
};
/**
 * Helper to parse European dates dd.MM.yyyy
 */
const parseDate = (val) => {
  if (!val || val === "-") return null;
  
  // if it's already a JS Date (parsed by xlsx if it's a true date cell)
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  
  // If it's a string, expect dd.MM.yyyy
  if (typeof val === "string") {
    const parts = val.split(".");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const parsed = new Date(`${year}-${month}-${day}`);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  }
  return null;
};

/**
 * Format a Date to DDMMYYYY string for default password
 */
const formatPasswordDate = (date) => {
  if (!date || isNaN(date.getTime())) return "Default@123";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear());
  return `${d}${m}${y}`;
};

/**
 * GET /api/admin/export
 * Export all active members to Excel
 */

export const exportMembers = async (req, res, next) => {
  try {
    const members = await Member.find({}).lean();

    const formatDate = (date) => {
      if (!date || isNaN(new Date(date).getTime())) return "-";
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
    };

    // Map to expected Excel columns
    const exportData = members.map(m => ({
      member_no: m.memberNumber,
      first_name: m.firstName || "-",
      last_name: m.lastName || "-",
      full_name: m.name,
      gender: m.gender || "-",
      email: m.email || "-",
      mobile_number: m.mobile,
      alternate_mobile: m.alternateMobile || "-",
      whatsapp_mobile: m.whatsappMobile || "-",
      blood_group: m.bloodGroup || "-",
      date_of_birth: formatDate(m.dateOfBirth),
      wedding_date: formatDate(m.weddingDate),
      occupation: m.profession || "-",
      company_name: m.company || "-",
      address_line: m.address || "-",
      city: m.city || "-",
      district: m.district || "-",
      state: m.state || "-",
      pincode: m.pincode || "-",
      country: m.country || "-",
      joining_year: m.joiningYear || "-",
      club_position: m.clubPosition || "-",
      club_position_year: m.clubPositionYear || "-",
      spouse_name: m.spouseName || "-",
      spouse_member_id: m.spouseMemberId || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");

    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=LionsClubMembers_Export.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    
    res.status(200).send(excelBuffer);

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/members
 * Fetch all members with pagination, search, sorting, and filtering
 */
export const getAdminMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sort = "name", order = "asc", status, clubPosition, bloodGroup, city, joiningYear } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build Query
    const query = {};
    if (status) query.status = status;
    if (clubPosition) query.clubPosition = clubPosition;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = city;
    if (joiningYear) query.joiningYear = Number(joiningYear);

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { memberNumber: searchRegex },
        { name: searchRegex },
        { mobile: searchRegex },
        { email: searchRegex },
        { bloodGroup: searchRegex },
        { profession: searchRegex },
        { clubPosition: searchRegex },
        { city: searchRegex },
      ];
    }

    // Build Sort
    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const totalMembers = await Member.countDocuments(query);
    const totalPages = Math.ceil(totalMembers / Number(limit));

    const members = await Member.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        members,
        pagination: {
          totalMembers,
          currentPage: Number(page),
          totalPages,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/members/ids
 * Fetch only the IDs of members matching the search/filter criteria.
 * Used for "Select All X Matching Members".
 */
export const getAdminMemberIds = async (req, res, next) => {
  try {
    const { search, status, clubPosition, bloodGroup, city, joiningYear } = req.query;

    const query = {};
    if (status) query.status = status;
    if (clubPosition) query.clubPosition = clubPosition;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = city;
    if (joiningYear) query.joiningYear = Number(joiningYear);

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { memberNumber: searchRegex },
        { name: searchRegex },
        { mobile: searchRegex },
        { email: searchRegex },
        { bloodGroup: searchRegex },
        { profession: searchRegex },
        { clubPosition: searchRegex },
        { city: searchRegex },
      ];
    }

    const memberIds = await Member.find(query).distinct("_id");

    res.status(200).json({
      success: true,
      data: memberIds,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/members/bulk-delete
 * Delete multiple members at once, including linked users and profile photos.
 */
export const bulkDeleteMembers = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("No member IDs provided for deletion.");
    }

    const members = await Member.find({ _id: { $in: ids } }).session(session);
    
    members.forEach((member) => {
      if (member.avatar && member.avatar.startsWith("/uploads/profiles/")) {
        const fileName = member.avatar.split("/").pop();
        const filePath = path.join(__dirname, "..", "public", "uploads", "profiles", fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await User.deleteMany({ memberId: { $in: ids } }).session(session);
    const result = await Member.deleteMany({ _id: { $in: ids } }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} members.`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * POST /api/admin/members/export-selected
 * Export only the selected members to Excel.
 */
export const exportSelectedMembers = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("No member IDs provided for export.");
    }

    const members = await Member.find({ _id: { $in: ids } }).lean();

    const formatDate = (date) => {
      if (!date || isNaN(new Date(date).getTime())) return "-";
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
    };

    const exportData = members.map(m => ({
      member_no: m.memberNumber,
      first_name: m.firstName || "-",
      last_name: m.lastName || "-",
      full_name: m.name,
      gender: m.gender || "-",
      email: m.email || "-",
      mobile_number: m.mobile,
      alternate_mobile: m.alternateMobile || "-",
      whatsapp_mobile: m.whatsappMobile || "-",
      blood_group: m.bloodGroup || "-",
      date_of_birth: formatDate(m.dateOfBirth),
      wedding_date: formatDate(m.weddingDate),
      occupation: m.profession || "-",
      company_name: m.company || "-",
      address_line: m.address || "-",
      city: m.city || "-",
      district: m.district || "-",
      state: m.state || "-",
      pincode: m.pincode || "-",
      country: m.country || "-",
      joining_year: m.joiningYear || "-",
      club_position: m.clubPosition || "-",
      status: m.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Members");
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", 'attachment; filename="SelectedMembers.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/members/:id
 * Fetch single member details
 */
export const getAdminMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id).lean();
    if (!member) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/members
 * Create member + linked user account
 */
export const createAdminMember = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { memberNumber, name, mobile, email } = req.body;

    if (!memberNumber || !name || !mobile) {
      throw new Error("Member Number, Name, and Mobile are required");
    }

    // Check unique constraints
    const existingMember = await Member.findOne({
      $or: [
        { memberNumber },
        ...(email ? [{ email }] : []),
        { mobile }
      ]
    }).session(session);

    if (existingMember) {
      if (existingMember.memberNumber === memberNumber) throw new Error("Member number already exists");
      if (email && existingMember.email === email) throw new Error("Email already in use");
      if (existingMember.mobile === mobile) throw new Error("Mobile number already in use");
    }

    // Handle photo
    let avatarUrl = "";
    if (req.file) {
      avatarUrl = `/uploads/profiles/${req.file.filename}`;
    }

    const newMemberData = {
      ...req.body,
      avatar: avatarUrl,
    };

    // Clean up empty strings to null for Date fields to avoid cast errors
    if (!newMemberData.dateOfBirth) delete newMemberData.dateOfBirth;
    if (!newMemberData.weddingDate) delete newMemberData.weddingDate;

    const member = new Member(newMemberData);
    const savedMember = await member.save({ session });

    // Determine password
    let password;
    let tempPassword = null;
    if (savedMember.dateOfBirth) {
      password = formatPasswordDate(savedMember.dateOfBirth);
    } else {
      tempPassword = generateRandomPassword();
      password = tempPassword;
    }

    // Check if user exists
    const existingUser = await User.findOne({ username: memberNumber }).session(session);
    if (existingUser) {
        throw new Error("User with this member number already exists.");
    }

    // Create User
    const user = new User({
      username: savedMember.memberNumber,
      password,
      role: "member",
      memberId: savedMember._id,
    });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: {
        member: savedMember,
        tempPassword // Only sent once!
      }
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Clean up uploaded file if transaction failed
    if (req.file) {
      const filePath = path.join(__dirname, "..", "public", "uploads", "profiles", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

/**
 * PUT /api/admin/members/:id
 * Update member, optionally update username if memberNumber changed
 */
export const updateAdminMember = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const memberId = req.params.id;
    const updateData = { ...req.body };
    const { memberNumber, email, mobile } = updateData;

    const existingMember = await Member.findById(memberId).session(session);
    if (!existingMember) {
      throw new Error("Member not found");
    }

    // Check unique constraints for OTHER members
    const duplicateCheck = await Member.findOne({
      _id: { $ne: memberId },
      $or: [
        ...(memberNumber ? [{ memberNumber }] : []),
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : [])
      ]
    }).session(session);

    if (duplicateCheck) {
      if (memberNumber && duplicateCheck.memberNumber === memberNumber) throw new Error("Member number already exists");
      if (email && duplicateCheck.email === email) throw new Error("Email already in use");
      if (mobile && duplicateCheck.mobile === mobile) throw new Error("Mobile number already in use");
    }

    // Handle photo replacement
    if (req.file) {
      updateData.avatar = `/uploads/profiles/${req.file.filename}`;
      
      // Delete old photo
      if (existingMember.avatar && existingMember.avatar.startsWith("/uploads/profiles/")) {
        const oldFileName = existingMember.avatar.split("/").pop();
        const oldFilePath = path.join(__dirname, "..", "public", "uploads", "profiles", oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    // Clean up empty strings to null for Date fields
    if (updateData.dateOfBirth === "") updateData.dateOfBirth = null;
    if (updateData.weddingDate === "") updateData.weddingDate = null;

    const updatedMember = await Member.findByIdAndUpdate(memberId, updateData, { new: true, session });

    // If memberNumber changed, update User's username
    if (memberNumber && memberNumber !== existingMember.memberNumber) {
      const user = await User.findOne({ memberId: memberId }).session(session);
      if (user) {
        user.username = memberNumber;
        await user.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: updatedMember
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Clean up newly uploaded file if transaction failed
    if (req.file) {
      const filePath = path.join(__dirname, "..", "public", "uploads", "profiles", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

/**
 * PUT /api/admin/members/:id/reset-password
 * Dedicated endpoint to reset a member's password
 */
export const resetMemberPassword = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      return next(error);
    }

    const user = await User.findOne({ memberId: member._id });
    if (!user) {
      const error = new Error("Associated user account not found");
      error.statusCode = 404;
      return next(error);
    }

    let password;
    let tempPassword = null;
    
    if (member.dateOfBirth) {
      password = formatPasswordDate(member.dateOfBirth);
    } else {
      tempPassword = generateRandomPassword();
      password = tempPassword;
    }

    user.password = password;
    await user.save(); // pre-save hook handles hashing

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: { tempPassword }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/members/:id
 * Hard delete member, linked user, and uploaded photo via transaction
 */
export const deleteAdminMember = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const memberId = req.params.id;

    const member = await Member.findById(memberId).session(session);
    if (!member) {
      throw new Error("Member not found");
    }

    // Delete associated User
    await User.findOneAndDelete({ memberId: memberId }).session(session);

    // Delete Member document
    await Member.findByIdAndDelete(memberId).session(session);

    // Delete uploaded photo if it exists locally
    if (member.avatar && member.avatar.startsWith("/uploads/profiles/")) {
      const fileName = member.avatar.split("/").pop();
      const filePath = path.join(__dirname, "..", "public", "uploads", "profiles", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Member, linked user, and photo deleted successfully"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
