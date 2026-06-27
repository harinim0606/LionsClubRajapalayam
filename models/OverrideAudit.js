import mongoose from 'mongoose';

const overrideAuditSchema = new mongoose.Schema({
  previewId: { type: String, required: true },
  rowNumber: { type: Number, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminName: { type: String, required: true },
  originalErrors: [{ type: String }],
  originalWarnings: [{ type: String }],
  overrideReason: { type: String, required: true },
  memberNumber: { type: String, required: true },
  memberData: { type: mongoose.Schema.Types.Mixed }, // Snap of data at time of override
  timestamp: { type: Date, default: Date.now }
});

overrideAuditSchema.index({ previewId: 1, rowNumber: 1 });

const OverrideAudit = mongoose.model('OverrideAudit', overrideAuditSchema);
export default OverrideAudit;
