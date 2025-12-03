import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

let transporter;

function ensureTransporter() {
  if (transporter) return transporter;

  const devMode = process.env.SMTP_DEV_MODE === 'true';
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host) {
    if (!devMode) throw new Error('SMTP_HOST is not configured');
    transporter = nodemailer.createTransport({
      streamTransport: true,
      buffer: true,
    });
    return transporter;
  }
  if (user && !pass) {
    throw new Error('SMTP_PASS is required when SMTP_USER is set');
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
  });

  return transporter;
}

export async function sendMail({ to, subject, text, html }) {
  const t = ensureTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  if (!from) throw new Error('MAIL_FROM is not configured');

  const info = await t.sendMail({ from, to, subject, text, html });
  if (info.message) {
    logger.info({ to, messageId: info.messageId || 'dev-preview', preview: info.message.toString() }, 'Email sent (dev mode)');
  } else {
    logger.info({ to, messageId: info.messageId }, 'Email sent');
  }
  return info;
}
