import mongoose from "mongoose";

const exportHistorySchema = new mongoose.Schema(
  {
    fileName: { type: String, default: "" },
    exportType: {
      type: String,
      enum: ["all", "filtered", "selected", "template", "statistics"],
      required: true,
    },
    totalRows: { type: Number, default: 0 },
    columnsExported: [{ type: String }],
    filtersUsed: { type: mongoose.Schema.Types.Mixed, default: {} },
    executionTime: { type: String, default: "0" }, // seconds as string
    status: {
      type: String,
      enum: ["Completed", "Failed"],
      default: "Completed",
    },
    errorMessage: { type: String, default: null },
    exportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

const ExportHistory = mongoose.model("ExportHistory", exportHistorySchema);
export default ExportHistory;
