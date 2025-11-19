import AuthLog from '../models/AuthLog.js';
import { logger } from '../utils/logger.js';

export async function recordAuthLog({ userId = null, event, ip = '', userAgent = '', meta = {} }) {
  try {
    await AuthLog.create({
      userId,
      event,
      ip,
      userAgent,
      meta,
    });
  } catch (err) {
    logger.warn({ err, event, scope: 'auth-log' }, 'Failed to persist auth log');
  }
}

export function resolveClientMeta(req) {
  return {
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
    userAgent: req.get('user-agent') || '',
  };
}
