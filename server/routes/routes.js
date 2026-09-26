import { getBanks } from '../controllers/banks.controller.js';
import { getQuiz, checkAnswer, submitQuiz } from '../controllers/quiz.controller.js';
import { match } from '../controllers/match.controller.js';
import { create, list } from '../controllers/application.controller.js';
import {
  chat,
  status as aiStatus,
  businessPlan,
  financialCheckup,
  loanExplainer,
  antiScam,
  documentAnalysis,
} from '../controllers/ai.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { readJson, sendJson, httpError } from '../utils/http.js';
import { rateLimit } from '../middleware/rateLimit.js';

const aiLimit = rateLimit({ max: 20, windowMs: 60_000 });
const aiToolLimit = rateLimit({ max: 8, windowMs: 60_000 });
const apiLimit = rateLimit({ max: 120, windowMs: 60_000 });

export async function router(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const key = `${req.method} ${url.pathname}`;
  if (apiLimit(req)) throw httpError(429, 'Слишком много запросов. Попробуйте позже.');

  switch (key) {
    case 'GET /api/health':
      return { ok: true, service: 'BankMatch API', version: '3.0.0', time: new Date().toISOString(), aiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim()) };
    case 'GET /api/banks': return getBanks();
    case 'GET /api/quiz': return getQuiz();
    case 'POST /api/quiz/check': return checkAnswer(await readJson(req));
    case 'POST /api/quiz/submit': return submitQuiz(await readJson(req));
    case 'POST /api/match': return match(await readJson(req));
    case 'POST /api/applications': return create(await readJson(req));
    case 'GET /api/applications': requireAdmin(req); return list();
    case 'GET /api/ai/status': return await aiStatus();
    case 'POST /api/ai/chat':
      if (aiLimit(req)) throw httpError(429, 'Слишком много сообщений. Подождите минуту.');
      return await chat(await readJson(req));
    case 'POST /api/ai/business-plan':
      if (aiToolLimit(req)) throw httpError(429, 'Слишком много AI-запросов. Попробуйте через минуту.');
      return await businessPlan(await readJson(req));
    case 'POST /api/ai/financial-checkup':
      if (aiToolLimit(req)) throw httpError(429, 'Слишком много AI-запросов. Попробуйте через минуту.');
      return await financialCheckup(await readJson(req));
    case 'POST /api/ai/loan-explainer':
      if (aiToolLimit(req)) throw httpError(429, 'Слишком много AI-запросов. Попробуйте через минуту.');
      return await loanExplainer(await readJson(req));
    case 'POST /api/ai/anti-scam':
      if (aiToolLimit(req)) throw httpError(429, 'Слишком много AI-запросов. Попробуйте через минуту.');
      return await antiScam(await readJson(req));
    case 'POST /api/ai/document':
      if (aiToolLimit(req)) throw httpError(429, 'Слишком много AI-запросов. Попробуйте через минуту.');
      return await documentAnalysis(await readJson(req, 8_000_000));
    default: throw httpError(404, 'Маршрут не найден');
  }
}
