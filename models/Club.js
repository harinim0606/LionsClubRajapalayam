import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    meetingDay: {
      type: String,
      trim: true,
    },
    meetingVenue: {
      type: String,
      trim: true,
    },
    logo: {
      type: String, // Relative path to logo image
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Club = mongoose.model("Club", clubSchema);
export default Club;
