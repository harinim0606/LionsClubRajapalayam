import Member from "../models/Member.js";

/**
 * GET /api/members
 * Protected controller to retrieve members list with pagination, search, sorting, and multi-filters
 */
export const getMembers = async (req, res, next) => {
  try {
    const query = {};

    // 1. Status Filter (active by default, unless "all" or "inactive" is explicitly requested)
    const statusParam = req.query.status;
    if (!statusParam) {
      query.status = "active";
    } else if (statusParam !== "all") {
      query.status = statusParam;
    }

    // 2. Search Handler (Name, Member Number, Mobile, Email)
    if (req.query.search) {
      const searchVal = req.query.search.trim();
      if (searchVal) {
        const searchRegex = new RegExp(searchVal, "i");
        query.$or = [
          { name: searchRegex },
          { memberNumber: searchRegex },
          { mobile: searchRegex },
          { email: searchRegex },
        ];
      }
    }

    // 3. Category / Specific Fields Filters
    if (req.query.designation) {
      query.clubPosition = req.query.designation;
    }
    if (req.query.bloodGroup) {
      query.bloodGroup = req.query.bloodGroup;
    }
    if (req.query.membershipType) {
      query.membershipType = req.query.membershipType;
    }
    if (req.query.gender) {
      query.gender = req.query.gender;
    }

    // 4. Sorting Handler
    const sortFieldMap = {
      name: "name",
      memberNumber: "memberNumber",
      joiningDate: "joiningYear",
      dateOfBirth: "dateOfBirth",
    };
    const sortBy = sortFieldMap[req.query.sortBy] || "name";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    const sort = { [sortBy]: sortOrder };

    // 5. Pagination Handler
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // 6. DB Execution
    const members = await Member.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalMembers = await Member.countDocuments(query);
    const totalPages = Math.ceil(totalMembers / limit);

    res.status(200).json({
      success: true,
      message: "Members list retrieved successfully",
      data: {
        members,
        pagination: {
          totalMembers,
          currentPage: page,
          totalPages,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/members/:id
 * Retrieve a specific member's profile
 */
export const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id).select('-__v').lean();
    
    if (!member) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      return next(error);
    }

    // Determine if the requesting user has edit rights for this profile
    const canEdit = checkEditAuthorization(req, req.params.id);

    res.status(200).json({
      success: true,
      data: {
        ...member,
        canEdit
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to check edit authorization.
 * Rules:
 *   - Admin → can edit any profile
 *   - Member → can edit ONLY their own profile
 */
function checkEditAuthorization(req, targetMemberId) {
  if (req.user.role === "admin") return true;
  if (req.user.memberId && req.user.memberId.toString() === targetMemberId.toString()) return true;
  return false;
}

/**
 * GET /api/members/me
 * Returns the authenticated member's own profile.
 * Only applicable to members (not admin accounts).
 */
export const getMyProfile = async (req, res, next) => {
  try {
    if (!req.user.memberId) {
      const error = new Error("No member profile is linked to this account.");
      error.statusCode = 404;
      return next(error);
    }

    const member = await Member.findById(req.user.memberId).select('-__v').lean();

    if (!member) {
      const error = new Error("Member profile not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: {
        ...member,
        canEdit: true, // "me" endpoint is always own profile, so always editable
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/members/:id
 * Update allowed member fields
 */
export const updateMemberProfile = async (req, res, next) => {
  try {
    const targetMemberId = req.params.id;
    
    // Check authorization
    const isAuthorized = checkEditAuthorization(req, targetMemberId);
    if (!isAuthorized) {
      const error = new Error("Not authorized to edit this profile");
      error.statusCode = 403;
      return next(error);
    }

    // Define allowed fields for update
    const allowedFields = [
      "mobile",
      "alternateMobile",
      "email",
      "profession",
      "address",
      "city",
      "state",
      "pincode"
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updatedMember = await Member.findByIdAndUpdate(
      targetMemberId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!updatedMember) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedMember
    });
  } catch (error) {
    next(error);
  }
};

import fs from "fs";
import path from "path";

/**
 * POST /api/members/:id/photo
 * Upload or replace a member's profile photo
 */
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("Please upload a file");
      error.statusCode = 400;
      return next(error);
    }

    const targetMemberId = req.params.id;

    // Check authorization
    const isAuthorized = checkEditAuthorization(req, targetMemberId);
    if (!isAuthorized) {
      // Clean up uploaded file if unauthorized
      fs.unlinkSync(req.file.path);
      const error = new Error("Not authorized to edit this profile photo");
      error.statusCode = 403;
      return next(error);
    }

    const member = await Member.findById(targetMemberId);
    if (!member) {
      fs.unlinkSync(req.file.path);
      const error = new Error("Member not found");
      error.statusCode = 404;
      return next(error);
    }

    // Delete old avatar if it exists
    if (member.avatar) {
      // The avatar is stored as relative URL e.g. "/uploads/profiles/file.jpg"
      const oldPath = path.join(process.cwd(), "public", member.avatar);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error("Error deleting old avatar:", err);
        }
      }
    }

    // File path to store in DB (e.g. "/uploads/profiles/profile-123.jpg")
    const avatarUrl = `/uploads/profiles/${req.file.filename}`;
    member.avatar = avatarUrl;
    await member.save();

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * DELETE /api/members/:id/photo
 * Remove a member's profile photo
 */
export const deleteProfilePhoto = async (req, res, next) => {
  try {
    const targetMemberId = req.params.id;
    
    // Check authorization
    const isAuthorized = checkEditAuthorization(req, targetMemberId);
    if (!isAuthorized) {
      const error = new Error("Not authorized to edit this profile photo");
      error.statusCode = 403;
      return next(error);
    }

    const member = await Member.findById(targetMemberId);
    if (!member) {
      const error = new Error("Member not found");
      error.statusCode = 404;
      return next(error);
    }

    if (member.avatar) {
      const oldPath = path.join(process.cwd(), "public", member.avatar);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (err) {
          console.error("Error deleting avatar:", err);
        }
      }
      
      member.avatar = "";
      await member.save();
    }

    res.status(200).json({
      success: true,
      message: "Profile photo deleted successfully",
      data: {
        avatar: ""
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/members/me
 */
export const updateMyProfile = async (req, res, next) => {
  if (!req.user.memberId) {
    const error = new Error("No member profile is linked to this account.");
    error.statusCode = 404;
    return next(error);
  }
  req.params.id = req.user.memberId;
  return updateMemberProfile(req, res, next);
};

/**
 * POST /api/members/me/photo
 */
export const uploadMyPhoto = async (req, res, next) => {
  if (!req.user.memberId) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    const error = new Error("No member profile is linked to this account.");
    error.statusCode = 404;
    return next(error);
  }
  req.params.id = req.user.memberId;
  return uploadProfilePhoto(req, res, next);
};

/**
 * DELETE /api/members/me/photo
 */
export const deleteMyPhoto = async (req, res, next) => {
  if (!req.user.memberId) {
    const error = new Error("No member profile is linked to this account.");
    error.statusCode = 404;
    return next(error);
  }
  req.params.id = req.user.memberId;
  return deleteProfilePhoto(req, res, next);
};
