import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './config/env.js';
import { getAiStatus } from './lib/gemini.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadEnv(ROOT);

console.log('=== BankMatch AI Diagnostic ===');
console.log(`Key configured: ${Boolean(process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim())}`);
console.log(`Configured model: ${process.env.GEMINI_MODEL || 'gemini-3.8-flash'}`);
console.log('Checking Gemini model access...');

try {
  const status = await getAiStatus();
  console.log(`Reachable: ${Boolean(status.reachable)}`);
  console.log(`Selected model: ${status.model || 'none'}`);
  console.log(`Reason: ${status.reason || 'unknown'}`);
  if (Array.isArray(status.availableModels)) {
    console.log(`Available generateContent models (sample): ${status.availableModels.join(', ') || 'none'}`);
  }

  if (!status.configured) process.exitCode = 2;
  else if (!status.reachable) process.exitCode = 3;
} catch (error) {
  console.error(`Diagnostic failed: ${error?.message || error}`);
  process.exitCode = 4;
}
