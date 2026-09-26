const BASE = import.meta.env.VITE_API_URL || "";

function errorMessage(status, data) {
    if (data?.error) return data.error;
    if (status === 429) return "Слишком много запросов. Подождите немного.";
    if (status >= 500) return "Сервер временно недоступен. Попробуйте ещё раз.";
    return `Ошибка ${status}`;
}

async function request(path, options = {}) {
    const timeoutMs = options.timeoutMs ?? 40_000;
    const attempts = options.retries ?? 1;
    let lastError;

    for (let attempt = 0; attempt <= attempts; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
            const fetchOptions = {
                ...options,
                headers,
                signal: controller.signal,
                body: options.body ? JSON.stringify(options.body) : undefined,
            };
            delete fetchOptions.timeoutMs;
            delete fetchOptions.retries;

            const res = await fetch(`${BASE}/api${path}`, fetchOptions);
            const data = await res.json().catch(() => ({}));
            if (res.ok) return data;

            const error = new Error(errorMessage(res.status, data));
            error.status = res.status;
            lastError = error;

            if (![408, 429, 500, 502, 503, 504].includes(res.status) || attempt === attempts) throw error;
            await new Promise((resolve) => setTimeout(resolve, res.status === 429 ? 1800 : 500));
        } catch (error) {
            if (error?.name === "AbortError") {
                lastError = new Error("Сервер отвечает слишком долго. Попробуйте ещё раз.");
            } else if (error?.message) {
                lastError = error;
            } else {
                lastError = new Error("Сервер недоступен. Запустите backend: npm run server");
            }
            if (attempt === attempts) throw lastError;
        } finally {
            clearTimeout(timeout);
        }
    }
    throw lastError || new Error("Не удалось выполнить запрос");
}

export const api = {
    banks: () => request("/banks"),
    quiz: () => request("/quiz"),
    checkAnswer: (id, answer) => request("/quiz/check", { method: "POST", body: { id, answer } }),
    submitQuiz: (answers) => request("/quiz/submit", { method: "POST", body: { answers } }),
    match: (profile) => request("/match", { method: "POST", body: profile }),
    apply: (payload) => request("/applications", { method: "POST", body: payload }),
    chat: (messages) => request("/ai/chat", { method: "POST", body: { messages }, timeoutMs: 100_000, retries: 1 }),
    aiStatus: () => request("/ai/status", { timeoutMs: 20_000, retries: 0 }),
    businessPlan: (body) => request("/ai/business-plan", { method: "POST", body, timeoutMs: 100_000, retries: 1 }),
    financialCheckup: (body) => request("/ai/financial-checkup", { method: "POST", body, timeoutMs: 100_000, retries: 1 }),
    loanExplainer: (body) => request("/ai/loan-explainer", { method: "POST", body, timeoutMs: 100_000, retries: 1 }),
    antiScam: (body) => request("/ai/anti-scam", { method: "POST", body, timeoutMs: 100_000, retries: 1 }),
    documentAnalysis: (body) => request("/ai/document", { method: "POST", body, timeoutMs: 110_000, retries: 0 }),
};
