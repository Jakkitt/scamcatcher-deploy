import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '5mb' }));

const { PORT = 4000, MONGODB_URI } = process.env;

// MongoDB (retry without exiting so /api/health works)
async function connectWithRetry(delayMs = 5000) {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not set');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('[MongoDB] connected');
  } catch (err) {
    console.error('[MongoDB] connection error:', err.message);
    console.log(`[MongoDB] retrying in ${Math.round(delayMs/1000)}s...`);
    setTimeout(() => connectWithRetry(delayMs), delayMs);
  }
}
connectWithRetry();

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true },
  password: String, // NOTE: plain for demo only
  username: String,
  gender: String,
  dob: String,
  role: { type: String, default: 'user' },
}, { timestamps: true });

const ReportSchema = new mongoose.Schema({
  name: String,
  bank: String,
  account: String,
  amount: Number,
  date: String,
  category: String,
  channel: String,
  desc: String,
  photos: [String],
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Report = mongoose.model('Report', ReportSchema);

// Helpers
const toUserPayload = (u) => ({
  id: u._id.toString(),
  email: u.email,
  username: u.username,
  gender: u.gender,
  dob: u.dob,
  role: u.role || 'user',
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, gender, dob } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email/password required' });
    const role = String(email).toLowerCase().startsWith('admin') ? 'admin' : 'user';
    let u = await User.findOne({ email });
    if (u) return res.status(400).json({ error: 'Email already exists' });
    u = await User.create({ username, email, password, gender, dob, role });
    return res.json(toUserPayload(u));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'register failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email/password required' });
    let u = await User.findOne({ email });
    if (!u) {
      const role = String(email).toLowerCase().startsWith('admin') ? 'admin' : 'user';
      u = await User.create({ email, password, role });
    }
    // naive password check for demo
    if (u.password && u.password !== password) return res.status(400).json({ error: 'invalid credentials' });
    return res.json(toUserPayload(u));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'login failed' });
  }
});

app.patch('/api/auth/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};
    // If email is not provided (client mock), return ok for demo
    if (!email) return res.json({ ok: true });
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'missing fields' });
    const u = await User.findOne({ email });
    if (!u) return res.status(404).json({ error: 'user not found' });
    if (u.password && u.password !== currentPassword) return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    u.password = newPassword; await u.save();
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'change password failed' });
  }
});

// Reports
app.post('/api/reports', async (req, res) => {
  try {
    const rec = await Report.create(req.body || {});
    res.json({ id: rec._id.toString(), ...rec.toObject() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'create report failed' });
  }
});

app.get('/api/reports/search', async (req, res) => {
  try {
    const { name = '', account = '', bank = '' } = req.query || {};
    const cond = {};
    if (name) cond.name = { $regex: String(name), $options: 'i' };
    if (account) cond.account = { $regex: String(account), $options: 'i' };
    if (bank) cond.bank = String(bank);
    const list = await Report.find(cond).sort({ createdAt: -1 }).limit(100);
    res.json(list.map(r => ({ id: r._id.toString(), ...r.toObject() })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'search failed' });
  }
});

app.get('/api/reports/mine', async (req, res) => {
  try {
    const list = await Report.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(list.map(r => ({ id: r._id.toString(), ...r.toObject() })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'list failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[API] http://localhost:${PORT}`);
});
