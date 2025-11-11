import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' });

const passwordSchema = z
  .string()
  .min(8, 'รหัสผ่านอย่างน้อย 8 ตัวอักษร')
  .max(72, 'รหัสผ่านไม่เกิน 72 ตัวอักษร')
  .refine((v) => Buffer.byteLength(v || '', 'utf8') <= 72, {
    message: 'รหัสผ่านไม่เกิน 72 bytes',
  });

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: z.string().trim().max(100).optional().default(''),
  gender: z.enum(['', 'male', 'female', 'other']).optional().default(''),
  dob: z
    .union([z.string().trim().min(1).optional(), z.null()])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ['newPassword'],
    message: 'รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน',
  });

export const profileSchema = z.object({
  username: z.string().trim().max(100).optional().default(''),
  gender: z.enum(['', 'male', 'female', 'other']).optional().default(''),
  dob: z.union([z.string().trim().min(1), z.null(), z.literal('')]).optional(),
  avatarUrl: z.string().trim().url().optional().or(z.literal('')).optional(),
});
