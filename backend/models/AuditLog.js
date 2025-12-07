import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    },
    action: {
      type: String,
      enum: ['uploaded', 'downloaded', 'shared', 'access_granted', 'access_revoked', 'link_accessed'],
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ file: 1, timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
