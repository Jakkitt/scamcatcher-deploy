import { z } from 'zod';

// อนุญาตเฉพาะตัวเลข ขีด และเว้นวรรค จากนั้นตรวจนับเฉพาะตัวเลข
const accountSchema = z
  .string()
  .trim()
  .regex(/^[0-9\-\s]{6,20}$/u, 'รูปแบบเลขบัญชีไม่ถูกต้อง')
  .refine((raw) => {
    const digits = String(raw || '').replace(/\D/g, '');
    return digits.length >= 6 && digits.length <= 16;
  }, 'รูปแบบเลขบัญชีไม่ถูกต้อง');

// แผนที่ธนาคาร → จำนวนหลักที่คาดหวัง (แบบกว้าง ๆ)
const expectedDigitsByBank = {
  'ธนาคารออมสิน': 11,
};

export const createReportSchema = z
  .object({
    name: z.string().trim().min(1, 'กรุณาระบุชื่อผู้กระทำผิด'),
    bank: z.string().trim().optional().default(''),
    account: accountSchema.optional(),
    amount: z.coerce.number().positive('กรุณาระบุจำนวนเงินให้ถูกต้อง'),
    date: z.string().trim().min(1, 'กรุณาระบุวันที่โอน'),
    category: z.string().trim().min(1, 'กรุณาระบุหมวดหมู่'),
    channel: z.string().trim().optional().default(''),
    desc: z.string().trim().optional().default(''),
  })
  .refine((v) => {
    if (!v.bank || !v.account) return true;
    const digits = String(v.account || '').replace(/\D/g, '');
    const expect = expectedDigitsByBank[v.bank];
    if (!expect) return true; // ไม่มี rule เฉพาะธนาคารนี้
    return digits.length === expect;
  }, { path: ['account'], message: 'เลขบัญชีไม่ตรงตามรูปแบบของธนาคาร' });

export const searchReportsSchema = z.object({
  name: z.string().trim().optional(),
  account: z.string().trim().optional(),
  bank: z.string().trim().optional(),
  channel: z.string().trim().optional(),
});
