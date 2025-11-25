import jwt from 'jsonwebtoken';

const { JWT_SECRET, NODE_ENV } = process.env;
const ACCESS_TTL = '30m';
const REFRESH_TTL = '14d';

// CRITICAL: Validate JWT_SECRET
if (!JWT_SECRET) {
  if (NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using insecure default for development only!');
  console.warn('⚠️  DO NOT USE IN PRODUCTION! Set JWT_SECRET in server/.env');
}

// Check for common insecure defaults
const INSECURE_SECRETS = [
  'dev-secret',
  'test-secret',
  'secret',
  'please-change-me',
  'please-change-me-super-secret-32chars',
];

if (JWT_SECRET && INSECURE_SECRETS.some(s => JWT_SECRET.toLowerCase().includes(s))) {
  if (NODE_ENV === 'production') {
    throw new Error('Insecure JWT_SECRET detected in production. Please use a strong random secret.');
  }
  console.warn('⚠️  WARNING: Using default/weak JWT_SECRET. Change it immediately!');
}

// Use secure default only in development
const SECRET = JWT_SECRET || 'dev-secret-DO-NOT-USE-IN-PRODUCTION';

export function signAccessToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
