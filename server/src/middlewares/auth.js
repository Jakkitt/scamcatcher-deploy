import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
  }
}

