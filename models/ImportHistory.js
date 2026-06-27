import mongoose from "mongoose";

const importHistorySchema = new mongoose.Schema(
  {
    importId: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    fileName: { type: String, default: "" },          // sanitized display name
    originalFileName: { type: String, default: "" },   // as uploaded

    // Row counts
    totalRows: { type: Number, default: 0 },
    selectedRows: { type: Number, default: 0 },
    importedRows: { type: Number, default: 0 },
    skippedRows: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    duplicateExcelRows: { type: Number, default: 0 },
    duplicateDbRows: { type: Number, default: 0 },
    warningRows: { type: Number, default: 0 },
    overriddenRows: { type: Number, default: 0 },
    updatedRows: { type: Number, default: 0 },
    createdMembers: { type: Number, default: 0 },
    createdUsers: { type: Number, default: 0 },

    // Timing
    importStartedAt: { type: Date },
    importCompletedAt: { type: Date },
    executionTime: { type: String, default: "0" }, // seconds as string e.g. "12.4"

    // Actor
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["Completed", "Completed With Warnings", "Failed", "Cancelled"],
      default: "Completed",
    },

    previewId: { type: String, default: "" },
    notes: { type: String, default: "" },

    // Permanent report paths (JSON files in storage/imports/reports/)
    reports: {
      errors: { type: String, default: null },     // absolute path to errors JSON
      passwords: { type: String, default: null },  // absolute path to passwords JSON
      usernames: { type: String, default: null },  // absolute path to usernames JSON
      combined: { type: String, default: null },   // absolute path to combined JSON
    },

    // Misc
    appVersion: { type: String, default: "1.0.0" },
  },
  { timestamps: true }
);

// Indexes for import history queries
importHistorySchema.index({ importedBy: 1 });       // filter by admin user
importHistorySchema.index({ createdAt: -1 });        // sort newest first
importHistorySchema.index({ status: 1 });            // filter by status
importHistorySchema.index({ importedBy: 1, createdAt: -1 }); // user's history sorted

const ImportHistory = mongoose.model("ImportHistory", importHistorySchema);
export default ImportHistory;
