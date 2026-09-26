export function httpError(status, message, details = undefined) {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}

export function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

export function readJson(req, limit = 100_000) {
  const contentType = String(req.headers['content-type'] || '');
  if (contentType && !contentType.toLowerCase().includes('application/json')) {
    return Promise.reject(httpError(415, 'Ожидается Content-Type: application/json'));
  }

  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > limit) {
    return Promise.reject(httpError(413, 'Слишком большой запрос'));
  }

  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let settled = false;

    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    req.on('data', (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > limit) {
        fail(httpError(413, 'Слишком большой запрос'));
        req.resume();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (settled) return;
      if (!chunks.length) return resolve({});
      try { settled = true; resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { fail(httpError(400, 'Некорректный JSON')); }
    });
    req.on('error', fail);
  });
}
