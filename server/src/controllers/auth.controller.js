import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import Report from '../models/Report.js';

function toSafeUser(u) {
  return {
    id: u._id.toString(),
    email: u.email,
    username: u.username,
    gender: u.gender || '',
    dob: u.dob || null,
    avatarUrl: u.avatarUrl || '',
    role: u.role || 'user'
  };
}

export async function register(req, res) {
  try {
    const { email, password, username, gender, dob } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: { message: 'email and password required' } });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: { message: 'email already exists' } });

    const passwordHash = await bcrypt.hash(password, 10);
    const role = String(email).toLowerCase().startsWith('admin') ? 'admin' : 'user';
    const user = await User.create({ email, passwordHash, username, gender, dob, role });

    const safe = toSafeUser(user);
    const accessToken = signAccessToken({ id: safe.id, email: safe.email, role: safe.role });
    const refreshToken = signRefreshToken({ id: safe.id, email: safe.email, role: safe.role });

    return res.status(201).json({ user: safe, tokens: { accessToken, refreshToken } });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: { message: 'email and password required' } });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: { message: 'invalid credentials' } });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { message: 'invalid credentials' } });

    const safe = toSafeUser(user);
    const accessToken = signAccessToken({ id: safe.id, email: safe.email, role: safe.role });
    const refreshToken = signRefreshToken({ id: safe.id, email: safe.email, role: safe.role });

    return res.json({ user: safe, tokens: { accessToken, refreshToken } });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: { message: 'currentPassword and newPassword required' } });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: { message: 'user not found' } });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { message: 'invalid current password' } });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: { message: 'user not found' } });
    return res.json({ user: toSafeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function updateProfile(req, res) {
  try {
    const { username, gender, dob, avatarUrl } = req.body || {};
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: { message: 'user not found' } });

    if (typeof username === 'string') user.username = username;
    if (typeof gender === 'string') user.gender = ['','male','female','other'].includes(gender) ? gender : user.gender;
    if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl;
    if (dob === '' || dob === null) user.dob = undefined;
    else if (typeof dob === 'string') {
      const d = new Date(dob);
      if (!isNaN(d.getTime())) user.dob = d; // เฉพาะกรณีเป็นวันที่ถูกต้อง
    }

    await user.save();
    return res.json({ user: toSafeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error:{ message:'UNAUTHORIZED' } });
    // ลบรายงานของผู้ใช้
    await Report.deleteMany({ owner: userId });
    // ลบผู้ใช้
    await User.findByIdAndDelete(userId);
    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error:{ message: e.message } });
  }
}
