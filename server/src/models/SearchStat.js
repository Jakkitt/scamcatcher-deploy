import mongoose from 'mongoose';

const searchStatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['query', 'name', 'account', 'channel', 'bank', 'firstName', 'lastName'],
      required: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

searchStatSchema.index({ type: 1, key: 1 }, { unique: true });
searchStatSchema.index({ updatedAt: -1 });

export default mongoose.model('SearchStat', searchStatSchema);
