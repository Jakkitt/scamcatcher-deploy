import { z } from 'zod';

const trimmed = (max = 120) =>
  z
    .string({ invalid_type_error: 'invalid_string' })
    .trim()
    .max(max, `max_${max}`)
    .optional()
    .transform((val) => val ?? '');

const account = z
  .preprocess(
    (val) => (typeof val === 'string' ? val.replace(/[^\d]/g, '') : ''),
    z
      .string({ invalid_type_error: 'invalid_account' })
      .max(20, 'max_20')
      .regex(/^\d*$/, 'invalid_account'),
  )
  .refine((val) => !val || val.length >= 6, { message: 'min_6' });

export const externalCheckSchema = z
  .object({
    firstName: trimmed(80),
    lastName: trimmed(80),
    name: trimmed(120),
    account,
    bank: trimmed(80),
    channel: trimmed(80),
  })
  .refine(
    (data) => Boolean(data.firstName || data.lastName || data.name || data.account || data.bank),
    { message: 'missing_query' },
  );
