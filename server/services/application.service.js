import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { httpError } from '../utils/http.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'server/storage/applications.json');

function ensureFile() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]', 'utf8');
}

export function listApplications() {
  ensureFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeApplications(data) {
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, FILE);
}

export function createApplication(body = {}) {
  ensureFile();
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').replace(/[\s()-]/g, '');
  if (name.length < 2 || name.length > 80) throw httpError(400, 'Укажите имя');
  if (!/^\+?998\d{9}$/.test(phone)) throw httpError(400, 'Телефон в формате +998 XX XXX XX XX');

  const number = (value, label, max = 1e12) => {
    if (value == null || value === '') return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > max) throw httpError(400, `${label}: некорректное значение`);
    return n;
  };

  const entry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    phone,
    bankId: String(body.bankId || '').slice(0, 40),
    purpose: String(body.purpose || '').slice(0, 50),
    amount: number(body.amount, 'Сумма'),
    term: number(body.term, 'Срок', 600),
    readiness: number(body.readiness, 'Готовность', 100),
  };

  const all = listApplications();
  all.push(entry);
  writeApplications(all);
  return entry;
}
