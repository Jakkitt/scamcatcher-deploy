import mongoose from 'mongoose';

const authLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: String, required: true },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export default mongoose.model('AuthLog', authLogSchema);
