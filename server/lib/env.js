import fs from 'node:fs';
import path from 'node:path';

function parseLine(rawLine) {
  const line = rawLine.replace(/^\uFEFF/, '').trim();
  if (!line || line.startsWith('#')) return null;
  const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
  const match = normalized.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!match) return null;

  let value = match[2].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  } else {
    value = value.replace(/\s+#.*$/, '').trim();
  }
  return [match[1], value];
}

export function loadEnv(rootDir) {
  // .env has priority, then Ai.env fills only variables that are still missing.
  for (const name of ['.env', 'Ai.env']) {
    const file = path.join(rootDir, name);
    if (!fs.existsSync(file)) continue;

    const text = fs.readFileSync(file, 'utf8');
    for (const rawLine of text.split(/\r?\n/)) {
      const parsed = parseLine(rawLine);
      if (!parsed) continue;
      const [key, value] = parsed;
      if (process.env[key] === undefined && value !== '') process.env[key] = value;
    }
  }
}
