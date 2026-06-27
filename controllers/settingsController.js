import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";


/**
 * GET /api/settings
 * Fetch logged in user's settings.
 */
export const getSettings = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    return next(error);
  }

  // Default settings are returned by Mongoose, but if somehow missing, fallback.
  const defaultSettings = {
    theme: "system",
    language: "en",
    accessibility: {
      textSize: "medium",
      fontFamily: "default",
      highContrast: false,
      reduceMotion: false,
      lineSpacing: 1,
      letterSpacing: 0,
      sidebarDensity: "comfortable",
      roundedCorners: true,
    }
  };

  const settings = user.settings || defaultSettings;

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/**
 * PUT /api/settings
 * Update logged in user's settings.
 */
export const updateSettings = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    return next(error);
  }

  // Deep merge settings
  if (req.body.theme !== undefined) user.settings.theme = req.body.theme;
  if (req.body.language !== undefined) user.settings.language = req.body.language;
  
  if (req.body.accessibility) {
    const acc = req.body.accessibility;
    if (acc.textSize !== undefined) user.settings.accessibility.textSize = acc.textSize;
    if (acc.fontFamily !== undefined) user.settings.accessibility.fontFamily = acc.fontFamily;
    if (acc.highContrast !== undefined) user.settings.accessibility.highContrast = acc.highContrast;
    if (acc.reduceMotion !== undefined) user.settings.accessibility.reduceMotion = acc.reduceMotion;
    if (acc.lineSpacing !== undefined) user.settings.accessibility.lineSpacing = acc.lineSpacing;
    if (acc.letterSpacing !== undefined) user.settings.accessibility.letterSpacing = acc.letterSpacing;
    if (acc.sidebarDensity !== undefined) user.settings.accessibility.sidebarDensity = acc.sidebarDensity;
    if (acc.roundedCorners !== undefined) user.settings.accessibility.roundedCorners = acc.roundedCorners;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    data: user.settings,
  });
});
