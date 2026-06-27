import mongoose from "mongoose";

const exportPresetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    columns: [{ type: String }],    // Selected column keys
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isGlobal: { type: Boolean, default: false }, // If true, visible to all admins
  },
  { timestamps: true }
);

const ExportPreset = mongoose.model("ExportPreset", exportPresetSchema);
export default ExportPreset;
