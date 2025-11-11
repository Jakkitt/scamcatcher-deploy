import { ZodError } from 'zod';

function zodToFields(err) {
  const fields = {};
  if (!(err instanceof ZodError)) return fields;
  for (const issue of err.issues) {
    const key = (issue.path?.[0] ?? 'unknown');
    let code = issue.code || 'invalid';
    if (issue.code === 'too_small') code = `min_${issue.minimum ?? 'x'}`;
    if (issue.code === 'too_big') code = `max_${issue.maximum ?? 'x'}`;
    if (issue.code === 'invalid_string' && issue.validation === 'email') code = 'invalid_email';
    if (issue.code === 'custom') {
      const msg = String(issue.message || '').toLowerCase();
      if (msg.includes('72') && msg.includes('byte')) code = 'max_bytes_72';
      else code = 'invalid';
    }
    fields[key] = code;
  }
  return fields;
}

export function validate(schema) {
  return (req, res, next) => {
    try {
      const input = schema.parse(req.body ?? {});
      req.body = input; // normalized body
      next();
    } catch (e) {
      const fields = zodToFields(e);
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง', fields } });
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const input = schema.parse(req.query ?? {});
      req.query = input; // normalized query
      next();
    } catch (e) {
      const fields = zodToFields(e);
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง', fields } });
    }
  };
}
