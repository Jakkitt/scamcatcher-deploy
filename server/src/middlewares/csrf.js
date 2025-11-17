import { COOKIE_NAMES, CSRF_HEADER, isSafeMethod, setCsrfCookie } from '../utils/cookies.js';

export function csrfProtection({ ignoredPaths = [] } = {}) {
  return (req, res, next) => {
    if (isSafeMethod(req.method)) return next();
    const path = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
    if (ignoredPaths.some((p) => path.startsWith(p))) return next();
    const cookieToken = req.cookies?.[COOKIE_NAMES.csrf];
    const headerToken = req.get
      ? req.get(CSRF_HEADER)
      : req.headers?.[CSRF_HEADER] || req.headers?.[CSRF_HEADER.toUpperCase()];
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({ error: { message: 'CSRF token mismatch' } });
    }
    return next();
  };
}

export function issueCsrf(res) {
  return setCsrfCookie(res);
}
