const buckets = new Map();
const MAX_KEYS = 10_000;

function clientKey(req) {
  // Do not trust x-forwarded-for unless the app is behind a trusted proxy.
  return req.socket.remoteAddress || 'unknown';
}

export function rateLimit({ max = 60, windowMs = 60_000 } = {}) {
  return (req) => {
    const key = `${clientKey(req)}:${req.method}:${new URL(req.url, 'http://localhost').pathname}`;
    const now = Date.now();
    const current = (buckets.get(key) || []).filter((t) => now - t < windowMs);
    current.push(now);
    if (buckets.size > MAX_KEYS) {
      const oldest = buckets.keys().next().value;
      if (oldest) buckets.delete(oldest);
    }
    buckets.set(key, current);
    return current.length > max;
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, values] of buckets) {
    const fresh = values.filter((t) => now - t < 60_000);
    if (fresh.length) buckets.set(key, fresh);
    else buckets.delete(key);
  }
}, 60_000).unref();
