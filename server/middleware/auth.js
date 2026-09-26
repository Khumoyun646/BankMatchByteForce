import crypto from 'node:crypto';
import { httpError } from '../utils/http.js';

export function requireAdmin(req) {
  const expected = String(process.env.ADMIN_TOKEN || '');
  const actual = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!expected) throw httpError(503, 'ADMIN_TOKEN не настроен');
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw httpError(401, 'Нет доступа');
}
