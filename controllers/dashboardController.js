import mongoose from "mongoose";
import ClubSettings from "../models/ClubSettings.js";
import Member from "../models/Member.js";
import asyncHandler from "../middleware/asyncHandler.js";

/**
 * GET /api/dashboard/member
 * Fetches data for the Member Dashboard
 */
export const getMemberDashboard = asyncHandler(async (req, res, next) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // 1. Fetch Logged-in Member Profile
  let loggedInMember = null;
  if (req.user && req.user.memberId) {
    loggedInMember = await Member.findById(req.user.memberId)
      .select("-__v -createdAt -updatedAt")
      .lean();
  }

  // 2. Fetch Club Settings and Populate Leadership
  const clubSettings = await ClubSettings.findOne()
    .populate("president", "name memberNumber avatar clubPosition")
    .populate("secretary", "name memberNumber avatar clubPosition")
    .populate("treasurer", "name memberNumber avatar clubPosition")
    .lean();

  // Calculate total members dynamically
  const totalMembers = await Member.countDocuments({ status: "active" });
  
  // Attach dynamically calculated total to clubSettings response
  if (clubSettings) {
    clubSettings.totalMembers = totalMembers;
  }

  // 3. Fetch Today's Birthdays
  const todayBirthdays = await Member.find({
    status: "active",
    $expr: {
      $and: [
        { $eq: [{ $month: "$dateOfBirth" }, currentMonth] },
        { $eq: [{ $dayOfMonth: "$dateOfBirth" }, currentDay] }
      ]
    }
  })
  .select("name memberNumber avatar clubPosition dateOfBirth")
  .lean();

  // 4. Fetch Today's Anniversaries
  const todayAnniversaries = await Member.find({
    status: "active",
    $expr: {
      $and: [
        { $eq: [{ $month: "$weddingDate" }, currentMonth] },
        { $eq: [{ $dayOfMonth: "$weddingDate" }, currentDay] }
      ]
    }
  })
  .select("name memberNumber avatar clubPosition weddingDate")
  .lean();

  res.status(200).json({
    success: true,
    data: {
      loggedInMember,
      clubSettings,
      todayBirthdays,
      todayAnniversaries,
    }
  });
});
/**
 * GET /api/dashboard/admin
 * Fetches all data required by the Admin Dashboard in one efficient request.
 * Uses Promise.all for parallel queries.
 */
export const getAdminDashboard = asyncHandler(async (req, res, next) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const birthdayDateFilter = {
    status: "active",
    dateOfBirth: { $ne: null },
    $expr: {
      $and: [
        { $eq: [{ $month: "$dateOfBirth" }, currentMonth] },
        { $eq: [{ $dayOfMonth: "$dateOfBirth" }, currentDay] },
      ],
    },
  };

  const anniversaryDateFilter = {
    status: "active",
    weddingDate: { $ne: null },
    $expr: {
      $and: [
        { $eq: [{ $month: "$weddingDate" }, currentMonth] },
        { $eq: [{ $dayOfMonth: "$weddingDate" }, currentDay] },
      ],
    },
  };

  const [clubSettings, totalActiveMembers, todaysBirthdays, todaysAnniversaries] =
    await Promise.all([
      ClubSettings.findOne()
        .populate("president", "name memberNumber avatar clubPosition mobile")
        .populate("secretary", "name memberNumber avatar clubPosition mobile")
        .populate("treasurer", "name memberNumber avatar clubPosition mobile")
        .lean(),

      Member.countDocuments({ status: "active" }),

      Member.find(birthdayDateFilter)
        .select("name memberNumber avatar mobile email whatsappMobile dateOfBirth clubPosition")
        .lean(),

      Member.find(anniversaryDateFilter)
        .select("name memberNumber avatar mobile whatsappMobile weddingDate spouseName")
        .lean(),
    ]);

  // Attach live member count to settings
  const clubInfo = clubSettings
    ? { ...clubSettings, totalMembers: totalActiveMembers }
    : null;

  res.status(200).json({
    success: true,
    data: {
      clubInformation: clubInfo,
      todaysBirthdays,
      todaysAnniversaries,
    },
  });
});
