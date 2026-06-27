import mongoose from "mongoose";

const communicationAuditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      required: true,
    },
    action: {
      type: String,
      enum: ["WhatsApp", "Email"],
      required: true,
    },
    type: {
      type: String,
      enum: ["Individual", "Bulk"],
      required: true,
    },
    recipientsCount: {
      type: Number,
      required: true,
      default: 1,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    timeTakenMs: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["completed", "cancelled", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for communication audit queries
communicationAuditSchema.index({ user: 1 });            // filter by user
communicationAuditSchema.index({ createdAt: -1 });       // sort newest first
communicationAuditSchema.index({ action: 1 });           // filter by WhatsApp/Email
communicationAuditSchema.index({ user: 1, createdAt: -1 }); // user's audit log
communicationAuditSchema.index({ action: 1, type: 1 }); // WhatsApp Bulk, Email Individual, etc.

const CommunicationAudit = mongoose.model("CommunicationAudit", communicationAuditSchema);
export default CommunicationAudit;
