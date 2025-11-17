import jwt from 'jsonwebtoken';

const { JWT_SECRET = 'dev-secret' } = process.env;
const ACCESS_TTL = '30m';
const REFRESH_TTL = '14d';

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
