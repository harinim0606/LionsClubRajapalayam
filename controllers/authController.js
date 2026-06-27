import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Member from "../models/Member.js";
import asyncHandler from "../middleware/asyncHandler.js";

/**
 * Generates a JWT token for the user session
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      memberId: user.memberId || null,
    },
    process.env.JWT_SECRET || "fallback_local_secret_key",
    { expiresIn: "1d" }
  );
};

/**
 * POST /api/auth/login
 * Public authentication handler
 */
export const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // 1. Basic validation
  if (!username || !password) {
    const error = new Error("Please provide username and password.");
    error.statusCode = 400;
    return next(error);
  }

  // 2. Lookup user case-insensitively (User schema lowercase: true stores usernames in lowercase)
  const normalizedUsername = username.trim().toLowerCase();
  const user = await User.findOne({ username: normalizedUsername });

  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    return next(error);
  }

  // 3. Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    return next(error);
  }

  // 4. Generate token
  const token = generateToken(user);

  // 5. Send cookie & respond
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "strict",
  };

  res.cookie("token", token, cookieOptions);

  // Fetch full name and avatar if user is a member
  let name = "Administrator";
  let avatar = "";
  if (user.role === "member" && user.memberId) {
    const member = await Member.findById(user.memberId).select("name avatar").lean();
    if (member) {
      name = member.name;
      avatar = member.avatar || "";
    }
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        memberId: user.memberId,
        name,
        avatar,
      },
    },
  });
});

/**
 * POST /api/auth/change-password
 * Protected password update handler
 */
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    const error = new Error("Please provide current and new passwords.");
    error.statusCode = 400;
    return next(error);
  }

  if (newPassword.length < 6) {
    const error = new Error("New password must be at least 6 characters long.");
    error.statusCode = 400;
    return next(error);
  }

  // Retrieve user database record
  const user = await User.findById(req.user.id);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    return next(error);
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error("Current password incorrect.");
    error.statusCode = 401;
    return next(error);
  }

  // Update password (pre-save hook will hash it automatically)
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    data: {},
  });
});

/**
 * GET /api/auth/me
 * Protected routing session check
 */
export const getMe = asyncHandler(async (req, res, next) => {
  let name = "Administrator";
  let avatar = "";

  if (req.user.role === "member" && req.user.memberId) {
    const member = await Member.findById(req.user.memberId).select("name avatar").lean();
    if (member) {
      name = member.name;
      avatar = member.avatar || "";
    }
  }

  res.status(200).json({
    success: true,
    message: "User profile retrieved successfully",
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        memberId: req.user.memberId,
        name,
        avatar,
      }
    },
  });
});

