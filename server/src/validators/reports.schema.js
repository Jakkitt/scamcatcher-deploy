import { z } from 'zod';

const trimmedRequired = (max = 120) =>
  z
    .string()
    .trim()
    .max(max, `max_${max}`);

const trimmedOptional = (max = 120) =>
  trimmedRequired(max)
    .optional()
    .transform((val) => val ?? '');

const accountDigits = z
  .string()
  .trim()
  .regex(/^[0-9\s-]{6,24}$/u, 'รูปแบบเลขบัญชีไม่ถูกต้อง')
  .transform((raw) => raw.replace(/[^\d]/g, ''))
  .refine((digits) => digits.length >= 6 && digits.length <= 16, 'รูปแบบเลขบัญชีไม่ถูกต้อง');

export const createReportSchema = z
  .object({
    firstName: trimmedRequired(80).min(1, 'กรุณาระบุชื่อจริง'),
    lastName: trimmedRequired(80).min(1, 'กรุณาระบุนามสกุล'),
    name: trimmedOptional(160),
    bank: trimmedOptional(80),
    account: z
      .union([accountDigits, z.string().length(0)])
      .optional()
      .transform((value) => value?.replace?.(/[^\d]/g, '') || ''),
    amount: z.coerce.number().positive('กรุณาระบุจำนวนเงินให้ถูกต้อง'),
    date: trimmedRequired(40).min(1, 'กรุณาระบุวันที่โอน'),
    category: trimmedRequired(120).min(1, 'กรุณาระบุหมวดหมู่'),
    channel: trimmedOptional(120),
    desc: z.string().optional().default(''),
  })
  .transform((data) => ({
    ...data,
    name: data.name || `${data.firstName} ${data.lastName}`.trim(),
    account: data.account || '',
    bank: data.bank || '',
    channel: data.channel || '',
  }));

const searchAccount = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val ? val.replace(/[^\d]/g, '') : ''));

export const searchReportsSchema = z
  .object({
    firstName: trimmedOptional(80),
    lastName: trimmedOptional(80),
    name: trimmedOptional(160),
    account: searchAccount,
    bank: trimmedOptional(80),
    channel: trimmedOptional(80),
  })
  .refine(
    (data) =>
      Boolean(
        data.firstName ||
          data.lastName ||
          data.name ||
          data.account ||
          data.bank ||
          data.channel,
      ),
    { message: 'กรุณาระบุอย่างน้อย 1 รายการ' },
  );
