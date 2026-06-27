import mongoose from "mongoose";

const clubSettingsSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      required: true,
      trim: true,
    },
    clubNumber: {
      type: String,
      required: true,
      trim: true,
    },
    inauguratedOn: {
      type: String,
    },
    charteredOn: {
      type: String,
    },
    totalMembers: {
      type: Number,
      default: 0,
    },
    region: {
      type: String,
      trim: true,
    },
    zone: {
      type: String,
      trim: true,
    },
    mjfCount: {
      type: Number,
      default: 0,
    },
    meetingDays: {
      type: String,
      trim: true,
    },
    meetingTime: {
      type: String,
      trim: true,
    },
    meetingVenue: {
      type: String,
      trim: true,
    },
    sponsoredBy: {
      type: String,
      trim: true,
    },
    clubsSponsored: [
      {
        type: String,
        trim: true,
      },
    ],
    permanentProjects: [
      {
        type: String,
        trim: true,
      },
    ],
    currentLionisticYear: {
      type: String,
      trim: true,
    },
    clubLogo: {
      type: String,
      default: "", // Can point to an asset URL/path
    },
    // Leadership references
    president: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    secretary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    treasurer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
  },
  {
    timestamps: true,
  }
);

const ClubSettings = mongoose.model("ClubSettings", clubSettingsSchema);

export default ClubSettings;
