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
  limit: 100, // Increased for testing
  message: { error: { message: 'ส่งรายงานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' } },
});

export const statsLimiter = baseLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  message: { error: { message: 'บันทึกสถิติถี่เกินไป กรุณารอสักครู่' } },
});

export const externalChecksLimiter = baseLimiter({
  windowMs: 60 * 1000,
  limit: 30, // เพิ่มจาก 8 เป็น 30 เพื่อรองรับการใช้งานสาธารณะ
  message: { error: { message: 'มีการตรวจสอบข้อมูลภายนอกมากเกินไป กรุณาลองใหม่ในภายหลัง' } },
});

export const reportSearchLimiter = baseLimiter({
  windowMs: 60 * 1000,
  limit: 25,
  message: { error: { message: 'ค้นหารายงานบ่อยเกินไป กรุณาพักสักครู่' } },
});

export const sessionRefreshLimiter = baseLimiter({
  windowMs: 60 * 1000,
  limit: 15,
  message: { error: { message: 'รีเฟรชเซสชันบ่อยเกินไป กรุณารอสักครู่' } },
});

export const globalLimiter = baseLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { error: { message: 'Too many requests from this IP, please try again later.' } },
});
