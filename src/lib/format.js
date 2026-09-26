export function sum(n) {
    const value = Number(n);
    if (!Number.isFinite(value)) return "—";
    return `${Math.round(value).toLocaleString("ru-RU")} сум`;
}

export function short(n) {
    const value = Number(n);
    if (!Number.isFinite(value)) return "—";
    if (value >= 1_000_000_000) return `${+(value / 1_000_000_000).toFixed(2)} млрд`;
    if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)} млн`;
    if (value >= 1_000) return `${Math.round(value / 1_000)} тыс`;
    return String(Math.round(value));
}

export function pct(x) {
    return `${Math.round(x * 100)}%`;
}
