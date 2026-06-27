import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    memberNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    weddingDate: {
      type: Date,
    },
    mobile: {
      type: String,
      trim: true,
      // optional
    },
    alternateMobile: {
      type: String,
      trim: true,
      // optional
    },
    whatsappMobile: {
      type: String,
      trim: true,
      // optional
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    profession: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    joiningYear: {
      type: Number,
    },
    clubPosition: {
      type: String,
      trim: true,
    },
    clubPositionYear: {
      type: String,
      trim: true,
    },
    spouseName: {
      type: String,
      trim: true,
    },
    spouseMemberId: {
      type: String,
      trim: true,
    },
    membershipType: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String, // Path to avatar relative file path
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Text search index for full-text member search
memberSchema.index({
  memberNumber: "text",
  name: "text",
  mobile: "text",
  bloodGroup: "text",
  profession: "text",
  city: "text",
  district: "text",
  clubPosition: "text",
  membershipType: "text",
});

// Single-field indexes for common filter/lookup operations
memberSchema.index({ status: 1 });           // filter by active/inactive
memberSchema.index({ mobile: 1 });           // WhatsApp/communication lookup
memberSchema.index({ email: 1 });            // email communication lookup
memberSchema.index({ bloodGroup: 1 });       // blood group filter
memberSchema.index({ city: 1 });             // city filter
memberSchema.index({ joiningYear: 1 });      // joining year filter
memberSchema.index({ createdAt: -1 });       // sort by newest first

// Compound indexes for multi-field query patterns
memberSchema.index({ status: 1, name: 1 });         // active members sorted by name
memberSchema.index({ status: 1, bloodGroup: 1 });   // filter by status+blood group
memberSchema.index({ status: 1, createdAt: -1 });   // recent active members

const Member = mongoose.model("Member", memberSchema);
export default Member;
