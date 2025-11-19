import { z } from 'zod';

const trimmedString = (max = 80) =>
  z
    .string({ invalid_type_error: 'invalid_string' })
    .trim()
    .max(max, `max_${max}`)
    .optional()
    .transform((val) => val ?? '');

const accountString = z
  .preprocess(
    (val) => (typeof val === 'string' ? val.replace(/[^\d]/g, '') : ''),
    z
      .string({ invalid_type_error: 'invalid_account' })
      .max(20, 'max_20')
      .regex(/^\d*$/, 'invalid_account'),
  )
  .refine((val) => !val || val.length >= 6, { message: 'min_6' });

export const searchStatsSchema = z.object({
  firstName: trimmedString(80),
  lastName: trimmedString(80),
  name: trimmedString(80),
  account: accountString,
  bank: trimmedString(80),
  channel: trimmedString(80),
});
