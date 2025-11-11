import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, default: '' },
    bank: { type: String, default: '' },
    account: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    date: { type: String, default: '' },
    category: { type: String, default: '' },
    channel: { type: String, default: '' },
    desc: { type: String, default: '' },
    photos: { type: [String], default: [] },
    status: { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true }
  },
  { timestamps: true }
);

reportSchema.index({ bank: 1, account: 1 });
reportSchema.index({ name: 'text', category: 'text' });

export default mongoose.model('Report', reportSchema);

