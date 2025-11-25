import { logger } from './logger.js';

const REQUIRED_VARS = ['JWT_SECRET'];
const PRODUCTION_REQUIRED = ['MONGODB_URI', 'ALLOWED_ORIGINS'];
const SMTP_VARS = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];

export function validateEnv() {
  const { NODE_ENV } = process.env;
  const missing = [];
  const warnings = [];

  // Check critical vars
  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check production vars
  if (NODE_ENV === 'production') {
    for (const key of PRODUCTION_REQUIRED) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  // Check SMTP configuration (optional but recommended)
  const hasAnySmtp = SMTP_VARS.some(key => process.env[key]);
  if (hasAnySmtp) {
    const missingSmtp = SMTP_VARS.filter(key => !process.env[key]);
    if (missingSmtp.length > 0) {
      warnings.push(`Partial SMTP configuration detected. Missing: ${missingSmtp.join(', ')}`);
    }
  }

  if (missing.length > 0) {
    logger.error({ missing }, 'Missing required environment variables');
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  // Warn about insecure defaults
  if (process.env.JWT_SECRET) {
    const insecureSecrets = ['dev-secret', 'test-secret', 'secret', 'please-change-me'];
    if (insecureSecrets.some(s => process.env.JWT_SECRET.toLowerCase().includes(s))) {
      if (NODE_ENV === 'production') {
        throw new Error('Insecure JWT_SECRET detected in production');
      }
      warnings.push('⚠️  Using default/weak JWT_SECRET. Change it immediately!');
    }
  }

  // Warn about development settings in production
  if (NODE_ENV === 'production') {
    if (process.env.USE_MEMORY_DB === 'true') {
      throw new Error('USE_MEMORY_DB=true is not allowed in production');
    }
    if (process.env.SMTP_DEV_MODE === 'true') {
      warnings.push('⚠️  SMTP_DEV_MODE=true in production - emails will not be sent!');
    }
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      throw new Error('ALLOW_ALL_ORIGINS=true is a security risk in production');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    warnings.forEach(warning => logger.warn(warning));
  }

  logger.info({ env: NODE_ENV }, 'Environment variables validated successfully');
  return true;
}
