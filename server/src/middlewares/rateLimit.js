import rateLimit from 'express-rate-limit';

const baseLimiter = (options = {}) =>
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: 'Too many requests, please try again later.' } },
    ...options,
  });

export const authRateLimiter = baseLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: { message: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง' } },
});

export const reportSubmissionLimiter = baseLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  message: { error: { message: 'ส่งรายงานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' } },
});
