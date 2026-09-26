import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './config/env.js';
import { router } from './routes/routes.js';
import { sendJson } from './utils/http.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
loadEnv(ROOT);

const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim());
if (!hasGeminiKey) console.warn('AI: API key не найден. Добавьте GEMINI_API_KEY в .env или переменные Windows.');
else console.log(`AI: Gemini настроен (модель ${process.env.GEMINI_MODEL || 'gemini-3.8-flash'})`);

const PORT = Number(process.env.PORT) || 5000;
const DIST = path.join(ROOT, 'dist');
const allowedOrigins = String(process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',').map((v) => v.trim()).filter(Boolean);
const defaultOrigin = allowedOrigins[0];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.json': 'application/json',
  '.woff2': 'font/woff2', '.webp': 'image/webp',
};

function serveStatic(req, res) {
  if (!fs.existsSync(DIST)) {
    return sendJson(res, 503, { error: 'Frontend не собран. Запустите npm run build.' });
  }

  let requested;
  try { requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return sendJson(res, 400, { error: 'Некорректный URL' }); }

  const candidate = path.resolve(DIST, `.${requested}`);
  const file = candidate.startsWith(DIST + path.sep) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    ? candidate : path.join(DIST, 'index.html');

  const isHtml = path.extname(file) === '.html';
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://localhost:5173 http://localhost:5174; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if (req.headers['x-forwarded-proto'] === 'https' || req.socket.encrypted) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname.startsWith('/api/')) {
      const data = await router(req, res);
      return sendJson(res, 200, data);
    }
    if (req.method === 'GET') return serveStatic(req, res);
    return sendJson(res, 405, { error: 'Метод не поддерживается' });
  } catch (err) {
    if (!err.status || err.status >= 500) console.error(err);
    return sendJson(res, err.status || 500, {
      error: err.status ? err.message : 'Внутренняя ошибка сервера',
      ...(err.details ? { details: err.details } : {}),
    });
  }
});

server.requestTimeout = 120_000;
server.headersTimeout = 20_000;
server.keepAliveTimeout = 5_000;

server.listen(PORT, () => console.log(`BankMatch API v3: http://localhost:${PORT}`));
