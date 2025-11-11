import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    username: { type: String, default: '' },
    gender: { type: String, enum: ['', 'male', 'female', 'other'], default: '' },
    dob: { type: Date },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['user','admin'], default: 'user' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

