import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import Report from '../models/Report.js';
import { deleteUploadsByUrls } from '../utils/uploads.js';
import { setAuthCookies, clearAuthCookies, COOKIE_NAMES, REFRESH_MAX_AGE } from '../utils/cookies.js';
import RefreshToken from '../models/RefreshToken.js';

const ACCOUNT_SUSPENDED_ERROR = {
  message: 'การเข้าสู่ระบบไม่สำเร็จ เนื่องจากบัญชีของคุณถูกปิดใช้งาน',
  code: 'ACCOUNT_SUSPENDED',
};

const hashToken = (token = '') =>
  crypto.createHash('sha256').update(token).digest('hex');

const tokenExpiryDate = () => new Date(Date.now() + REFRESH_MAX_AGE);

async function persistRefreshToken(userId, token, req) {
  await RefreshToken.create({
    userId,
    token: hashToken(token),
    expiresAt: tokenExpiryDate(),
    userAgent: req.get('user-agent') || '',
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
  });
}

async function revokeToken(token) {
  if (!token) return;
  await RefreshToken.deleteOne({ token: hashToken(token) });
}

async function revokeUserTokens(userId) {
  await RefreshToken.deleteMany({ userId });
}

function toSafeUser(u) {
  return {
    id: u._id.toString(),
    email: u.email,
    username: u.username,
    gender: u.gender || '',
    dob: u.dob || null,
    avatarUrl: u.avatarUrl || '',
    role: u.role || 'user',
  };
}

export async function register(req, res) {
  try {
    const { email, password, username, gender, dob } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: { message: 'email and password required' } });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      if (exists.suspended) {
        return res.status(403).json({ error: ACCOUNT_SUSPENDED_ERROR });
      }
      return res.status(409).json({ error: { message: 'email already exists' } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = String(email).toLowerCase().startsWith('admin') ? 'admin' : 'user';
    const user = await User.create({ email, passwordHash, username, gender, dob, role });

    const safe = toSafeUser(user);
    const accessToken = signAccessToken({ id: safe.id, email: safe.email, role: safe.role });
    const refreshToken = signRefreshToken({ id: safe.id, email: safe.email, role: safe.role });
    await revokeUserTokens(user._id);
    await persistRefreshToken(user._id, refreshToken, req);
    setAuthCookies(res, { accessToken, refreshToken });
    return res.status(201).json({ user: safe });
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
    if (user.suspended) {
      return res.status(403).json({ error: ACCOUNT_SUSPENDED_ERROR });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { message: 'invalid credentials' } });

    const safe = toSafeUser(user);
    const accessToken = signAccessToken({ id: safe.id, email: safe.email, role: safe.role });
    const refreshToken = signRefreshToken({ id: safe.id, email: safe.email, role: safe.role });
    await revokeUserTokens(user._id);
    await persistRefreshToken(user._id, refreshToken, req);
    setAuthCookies(res, { accessToken, refreshToken });
    return res.json({ user: safe });
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
      if (!isNaN(d.getTime())) user.dob = d;
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
    const ownedReports = await Report.find({ owner: userId }, { photos: 1 }).lean();
    await Report.deleteMany({ owner: userId });
    await Promise.all(ownedReports.map((doc) => deleteUploadsByUrls(doc?.photos || [])));
    await User.findByIdAndDelete(userId);
    await revokeUserTokens(userId);
    clearAuthCookies(res);
    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function logout(req, res) {
  await revokeToken(req.cookies?.[COOKIE_NAMES.refresh]);
  clearAuthCookies(res);
  return res.status(204).end();
}

export async function refreshSession(req, res) {
  try {
    const token = req.cookies?.[COOKIE_NAMES.refresh];
    if (!token) {
      clearAuthCookies(res);
      return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
    }
    const stored = await RefreshToken.findOne({ token: hashToken(token) });
    if (!stored) {
      clearAuthCookies(res);
      return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
    }
    const user = await User.findById(stored.userId);
    if (!user || user.suspended) {
      clearAuthCookies(res);
      return res.status(403).json({ error: { message: 'forbidden' } });
    }
    verifyToken(token); // ensure token valid
    const safe = toSafeUser(user);
    const accessToken = signAccessToken({ id: safe.id, email: safe.email, role: safe.role });
    const refreshToken = signRefreshToken({ id: safe.id, email: safe.email, role: safe.role });
    await revokeToken(token);
    await persistRefreshToken(user._id, refreshToken, req);
    setAuthCookies(res, { accessToken, refreshToken });
    return res.json({ ok: true });
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
  }
}
