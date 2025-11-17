import crypto from 'crypto';

const IS_PROD = process.env.NODE_ENV === 'production';

export const COOKIE_NAMES = {
  access: 'sc_access',
  refresh: 'sc_refresh',
  csrf: 'sc_csrf',
};

export const CSRF_HEADER = 'x-csrf-token';

export const ACCESS_MAX_AGE = 30 * 60 * 1000;
export const REFRESH_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

const baseOptions = {
  sameSite: 'strict',
  secure: IS_PROD,
};

const authCookieOptions = {
  ...baseOptions,
  httpOnly: true,
  path: '/api',
};

const csrfCookieOptions = {
  ...baseOptions,
  httpOnly: false,
  path: '/',
};

function randomToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(COOKIE_NAMES.access, accessToken, {
    ...authCookieOptions,
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookie(COOKIE_NAMES.refresh, refreshToken, {
    ...authCookieOptions,
    maxAge: REFRESH_MAX_AGE,
  });
  const csrfToken = randomToken();
  res.cookie(COOKIE_NAMES.csrf, csrfToken, {
    ...csrfCookieOptions,
    maxAge: REFRESH_MAX_AGE,
  });
  return csrfToken;
}

export function clearAuthCookies(res) {
  res.cookie(COOKIE_NAMES.access, '', { ...authCookieOptions, maxAge: 0 });
  res.cookie(COOKIE_NAMES.refresh, '', { ...authCookieOptions, maxAge: 0 });
  res.cookie(COOKIE_NAMES.csrf, '', { ...csrfCookieOptions, maxAge: 0 });
}

export function refreshAccessCookie(res, accessToken) {
  res.cookie(COOKIE_NAMES.access, accessToken, {
    ...authCookieOptions,
    maxAge: ACCESS_MAX_AGE,
  });
}

export function setCsrfCookie(res, token = randomToken()) {
  res.cookie(COOKIE_NAMES.csrf, token, {
    ...csrfCookieOptions,
    maxAge: REFRESH_MAX_AGE,
  });
  return token;
}

export function getCsrfCookieName() {
  return COOKIE_NAMES.csrf;
}

export function isSafeMethod(method = '') {
  return ['GET', 'HEAD', 'OPTIONS'].includes(String(method).toUpperCase());
}
