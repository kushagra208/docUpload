import mongoose from 'mongoose';

const shareLinkSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

shareLinkSchema.index({ token: 1 });
shareLinkSchema.index({ createdBy: 1 });
shareLinkSchema.index({ expiryDate: 1 });

export default mongoose.model('ShareLink', shareLinkSchema);
