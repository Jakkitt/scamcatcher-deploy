import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import Report from '../models/Report.js';
import { deleteUploadsByUrls } from '../utils/uploads.js';
import { setAuthCookies, clearAuthCookies, COOKIE_NAMES, REFRESH_MAX_AGE } from '../utils/cookies.js';
import RefreshToken from '../models/RefreshToken.js';
import { recordAuthLog, resolveClientMeta } from '../services/authLog.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { sendMail } from '../services/mailer.js';
import { buildResetPasswordEmail, buildChangePasswordPinEmail } from '../services/emailTemplates.js';
import { logger } from '../utils/logger.js';
import { passwordSchema } from '../validators/auth.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { issueCsrf } from '../middlewares/csrf.js';

const ACCOUNT_SUSPENDED_ERROR = {
  message: 'การเข้าสู่ระบบไม่สำเร็จ เนื่องจากบัญชีของคุณถูกปิดใช้งาน',
  code: 'ACCOUNT_SUSPENDED',
};

const hashToken = (token = '') =>
  crypto.createHash('sha256').update(token).digest('hex');

const tokenExpiryDate = () => new Date(Date.now() + REFRESH_MAX_AGE);

async function persistRefreshToken(userId, token, meta = {}) {
  await RefreshToken.create({
    userId,
    token: hashToken(token),
    expiresAt: tokenExpiryDate(),
    userAgent: meta.userAgent || '',
    ip: meta.ip || '',
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
    settings: u.settings || { emailNotifications: true },
  };
}

export const register = asyncHandler(async (req, res) => {
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
  // SECURITY FIX: Always default to 'user' role. Admin role must be assigned via database seed or manual update.
  const role = 'user';
  const user = await User.create({ email, passwordHash, username, gender, dob, role });

  const safe = toSafeUser(user);
  const accessToken = signAccessToken({ id: safe.id, email: safe.email, role: safe.role });
  const refreshToken = signRefreshToken({ id: safe.id, email: safe.email, role: safe.role });
  const meta = resolveClientMeta(req);
  await revokeUserTokens(user._id);
  await persistRefreshToken(user._id, refreshToken, meta);
  setAuthCookies(res, { accessToken, refreshToken });
  await recordAuthLog({
    userId: user._id,
    event: 'register_success',
    ...meta,
  });
  return res.status(201).json({ user: safe });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: { message: 'email and password required' } });
  }
  const user = await User.findOne({ email });
  const clientMeta = resolveClientMeta(req);
  if (!user) {
    await recordAuthLog({ event: 'login_failed', ...clientMeta, meta: { email } });
    return res.status(401).json({ error: { message: 'invalid credentials' } });
  }
  if (user.suspended) {
    return res.status(403).json({ error: ACCOUNT_SUSPENDED_ERROR });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await recordAuthLog({ userId: user._id, event: 'login_failed', ...clientMeta });
    return res.status(401).json({ error: { message: 'invalid credentials' } });
  }

  const safe = toSafeUser(user);
  const accessToken = signAccessToken({ id: safe.id, email: safe.email, role: safe.role });
  const refreshToken = signRefreshToken({ id: safe.id, email: safe.email, role: safe.role });
  await revokeUserTokens(user._id);
  await persistRefreshToken(user._id, refreshToken, clientMeta);
  setAuthCookies(res, { accessToken, refreshToken });
  await recordAuthLog({
    userId: user._id,
    event: 'login_success',
    ...clientMeta,
  });
  return res.json({ user: safe });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const clientMeta = resolveClientMeta(req);

  if (!normalizedEmail) {
    return res.status(400).json({ error: { message: 'email is required' } });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    await recordAuthLog({ event: 'forgot_password_no_user', meta: { email: normalizedEmail }, ...clientMeta });
    return res.json({ ok: true });
  }

  await PasswordResetToken.deleteMany({ userId: user._id });
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);
  const expiresMs = 15 * 60 * 1000;
  const expiresAt = new Date(Date.now() + expiresMs);

  await PasswordResetToken.create({
    userId: user._id,
    purpose: 'reset_password',
    token: hashedToken,
    expiresAt,
    userAgent: clientMeta.userAgent || '',
    ip: clientMeta.ip || '',
  });

  const baseResetUrl =
    process.env.RESET_PASSWORD_URL ||
    process.env.FRONTEND_BASE_URL ||
    process.env.APP_URL ||
    'http://localhost:5173';
  const resetUrl = `${baseResetUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

  try {
    const { subject, text, html } = buildResetPasswordEmail({
      resetUrl,
      username: user.username,
      expiresMinutes: 15,
    });
    await sendMail({ to: user.email, subject, text, html });
    await recordAuthLog({ userId: user._id, event: 'forgot_password_sent', ...clientMeta });
    return res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'Failed to send reset password email');
    await recordAuthLog({
      userId: user._id,
      event: 'forgot_password_failed',
      meta: { reason: err.message },
      ...clientMeta,
    });
    return res.status(500).json({ error: { message: 'ส่งอีเมลรีเซ็ตรหัสผ่านไม่สำเร็จ' } });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body || {};
  const clientMeta = resolveClientMeta(req);
  if (!token || !newPassword) {
    return res.status(400).json({ error: { message: 'token and newPassword required' } });
  }

  try {
    passwordSchema.parse(newPassword);
  } catch (err) {
    const message = err?.issues?.[0]?.message || 'invalid password';
    return res.status(400).json({ error: { message } });
  }

  const hashed = hashToken(token);
  const now = new Date();
  const entry = await PasswordResetToken.findOne({
    token: hashed,
    purpose: 'reset_password',
    used: false,
    expiresAt: { $gt: now },
  });

  if (!entry) {
    await recordAuthLog({
      event: 'reset_password_invalid_token',
      meta: { reason: 'not_found_or_used_or_expired' },
      ...clientMeta,
    });
    return res.status(400).json({ error: { message: 'ลิงก์หมดอายุหรือไม่ถูกต้อง' } });
  }

  const user = await User.findById(entry.userId);
  if (!user) {
    return res.status(404).json({ error: { message: 'user not found' } });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  entry.used = true;
  await entry.save();

  await revokeUserTokens(user._id);

  await recordAuthLog({
    userId: user._id,
    event: 'reset_password_success',
    ...clientMeta,
  });

  return res.json({ ok: true });
});

export async function sendChangePasswordPin(req, res) {
  const userId = req.user?.id;
  const clientMeta = resolveClientMeta(req);
  if (!userId) return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: { message: 'user not found' } });

  const pin = String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6);
  const hashed = hashToken(pin);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 นาที

  await PasswordResetToken.deleteMany({ userId, purpose: 'change_password_pin' });
  await PasswordResetToken.create({
    userId,
    purpose: 'change_password_pin',
    token: hashed,
    expiresAt,
    userAgent: clientMeta.userAgent || '',
    ip: clientMeta.ip || '',
  });

  try {
    const { subject, text, html } = buildChangePasswordPinEmail({
      pin,
      username: user.username,
      expiresMinutes: 10,
    });
    await sendMail({ to: user.email, subject, text, html });
    await recordAuthLog({ userId, event: 'change_password_pin_sent', ...clientMeta });
    return res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, 'Failed to send change password PIN email');
    await recordAuthLog({
      userId,
      event: 'change_password_pin_failed',
      meta: { reason: err.message },
      ...clientMeta,
    });
    return res.status(500).json({ error: { message: 'ไม่สามารถส่งรหัส PIN ได้' } });
  }
}

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, pin } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: { message: 'currentPassword and newPassword required' } });
  }
  // ตรวจ OTP ที่ส่งทางอีเมล
  if (!pin) return res.status(401).json({ error: { message: 'รหัส OTP ไม่ถูกต้อง' } });
  const hashedPin = hashToken(pin);
  const otp = await PasswordResetToken.findOne({
    userId: req.user.id,
    purpose: 'change_password_pin',
    token: hashedPin,
    used: false,
    expiresAt: { $gt: new Date() },
  });
  if (!otp) {
    return res.status(401).json({ error: { message: 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ' } });
  }
  otp.used = true;
  await otp.save();
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: { message: 'user not found' } });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ error: { message: 'invalid current password' } });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  
  // SECURITY: Revoke all refresh tokens (force logout everywhere)
  await revokeUserTokens(user._id);
  
  return res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: { message: 'user not found' } });
  return res.json({ user: toSafeUser(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, gender, dob, avatarUrl, settings } = req.body || {};
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

  // Update settings if provided
  if (settings && typeof settings === 'object') {
    if (typeof settings.emailNotifications === 'boolean') {
      user.settings.emailNotifications = settings.emailNotifications;
    }
  }

  await user.save();
  return res.json({ user: toSafeUser(user) });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error:{ message:'UNAUTHORIZED' } });
  const meta = resolveClientMeta(req);
  const ownedReports = await Report.find({ owner: userId }, { photos: 1 }).lean();
  await Report.deleteMany({ owner: userId });
  await Promise.all(ownedReports.map((doc) => deleteUploadsByUrls(doc?.photos || [])));
  await User.findByIdAndDelete(userId);
  await revokeUserTokens(userId);
  clearAuthCookies(res);
  await recordAuthLog({ userId, event: 'account_deleted', ...meta });
  return res.status(204).end();
});

export async function logout(req, res) {
  const meta = resolveClientMeta(req);
  const refresh = req.cookies?.[COOKIE_NAMES.refresh];
  if (refresh) {
    await revokeToken(refresh);
  }
  clearAuthCookies(res);
  await recordAuthLog({ userId: req.user?.id || null, event: 'logout', ...meta });
  return res.status(204).end();
}

export const refreshSession = asyncHandler(async (req, res) => {
  const token = req.cookies?.[COOKIE_NAMES.refresh];
  const meta = resolveClientMeta(req);
  if (!token) {
    clearAuthCookies(res);
    return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
  }
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    await recordAuthLog({ event: 'refresh_invalid', ...meta, meta: { reason: err.message } });
    clearAuthCookies(res);
    return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
  }
  const stored = await RefreshToken.findOne({ token: hashToken(token) });
  if (!stored) {
    if (payload?.id) {
      await revokeUserTokens(payload.id);
      await recordAuthLog({ userId: payload.id, event: 'refresh_token_reuse', ...meta });
    }
    clearAuthCookies(res);
    return res.status(403).json({ error: { message: 'forbidden' } });
  }
  const user = await User.findById(stored.userId);
  if (!user || user.suspended) {
    await revokeUserTokens(stored.userId);
    clearAuthCookies(res);
    return res.status(403).json({ error: { message: 'forbidden' } });
  }
  const safe = toSafeUser(user);
  const accessToken = signAccessToken({ id: safe.id, email: safe.email, role: safe.role });
  const refreshToken = signRefreshToken({ id: safe.id, email: safe.email, role: safe.role });
  await revokeToken(token);
  await persistRefreshToken(user._id, refreshToken, meta);
  setAuthCookies(res, { accessToken, refreshToken });
  await recordAuthLog({ userId: user._id, event: 'refresh_success', ...meta });
  await recordAuthLog({ userId: user._id, event: 'refresh_success', ...meta });
  return res.json({ ok: true });
});

export const getCsrfToken = (req, res) => {
  issueCsrf(res);
  return res.json({ ok: true });
};
