import { verifyToken } from '../utils/jwt.js';
import { COOKIE_NAMES } from '../utils/cookies.js';

export function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    let token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      token = req.cookies?.[COOKIE_NAMES.access] || null;
    }
    if (!token) return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    const r = req.user?.role || 'user';
    if (r !== role) return res.status(403).json({ error:{ message:'forbidden' } });
    next();
  };
}
