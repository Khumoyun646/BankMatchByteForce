import { banks, PRODUCT_TYPES } from "../data/banks.js";

export const MAX_PTI = 0.5;

export function annuityPayment(principal, annualRate, months) {
    const r = annualRate / 100 / 12;
    if (r === 0) return principal / months;
    return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function principalFromPayment(payment, annualRate, months) {
    const r = annualRate / 100 / 12;
    if (payment <= 0) return 0;
    if (r === 0) return payment * months;
    return (payment * (1 - Math.pow(1 + r, -months))) / r;
}

const EMPLOYMENT = ["official", "self", "unofficial", "pensioner", "student"];
const HISTORY = ["good", "none", "past_overdue", "overdue_now"];

function num(v, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) return null;
    return n;
}

export function validateProfile(body = {}) {
    const errors = [];
    const profile = {
        purpose: body.purpose,
        amount: num(body.amount, { min: 100_000 }),
        term: num(body.term, { min: 1, max: 360 }),
        income: num(body.income, { min: 1 }),
        existingPayments: num(body.existingPayments ?? 0, { min: 0 }),
        age: num(body.age, { min: 14, max: 100 }),
        employment: body.employment,
        history: body.history,
        collateral: Boolean(body.collateral),
        downPayment: num(body.downPayment ?? 0, { min: 0, max: 100 }),
        hasReserve: Boolean(body.hasReserve),
        quizScore: num(body.quizScore ?? 0, { min: 0, max: 1 }) ?? 0,
    };
    if (!PRODUCT_TYPES[profile.purpose]) errors.push("Выберите цель кредита");
    if (profile.amount === null) errors.push("Укажите сумму кредита (от 100 000 сум)");
    if (profile.term === null) errors.push("Укажите срок от 1 до 360 месяцев");
    if (profile.income === null) errors.push("Укажите ежемесячный доход");
    if (profile.existingPayments === null) errors.push("Некорректные текущие платежи");
    if (profile.age === null) errors.push("Укажите возраст");
    if (profile.downPayment === null) errors.push("Первоначальный взнос — от 0 до 100%");
    if (!EMPLOYMENT.includes(profile.employment)) errors.push("Выберите тип занятости");
    if (!HISTORY.includes(profile.history)) errors.push("Выберите состояние кредитной истории");
    profile.term = profile.term && Math.round(profile.term);
    return { profile, errors };
}

function estimateRate(prod, profile) {
    let rate = prod.rateFrom;
    if (profile.employment === "unofficial") rate += 2;
    if (profile.employment === "self") rate += 1;
    if (profile.history === "none") rate += 1;
    if (profile.history === "past_overdue") rate += 3;
    if (profile.collateral) rate -= 1;
    return Math.min(Math.max(rate, prod.rateFrom), prod.rateTo);
}

function evaluateOffer(bank, prod, profile) {
    const hard = []; // причины отказа
    const soft = []; // факторы риска
    const officialRequired = prod.officialIncomeRequired ?? bank.officialIncomeRequired;
    const loanAmount = profile.amount;

    if (profile.history === "overdue_now") hard.push("Есть текущая просрочка — банки отказывают до её погашения");
    if (profile.history === "past_overdue" && !bank.lenient) hard.push("Банк строго относится к просрочкам в прошлом");
    if (profile.history === "none" && !bank.acceptsNoHistory) soft.push("Без кредитной истории одобряют реже");

    if (profile.age < bank.minAge) hard.push(`Минимальный возраст — ${bank.minAge} лет`);
    const ageAtEnd = profile.age + profile.term / 12;
    if (ageAtEnd > bank.maxAge) hard.push(`На момент погашения возраст не должен превышать ${bank.maxAge} лет`);

    if (officialRequired && (profile.employment === "unofficial" || profile.employment === "student"))
        hard.push("Требуется официально подтверждённый доход");

    if (loanAmount < prod.min) hard.push(`Минимальная сумма — ${fmt(prod.min)}`);
    if (loanAmount > prod.max) hard.push(`Максимальная сумма — ${fmt(prod.max)}`);
    if (profile.term > prod.termMax) hard.push(`Максимальный срок — ${prod.termMax} мес.`);
    if (profile.income < prod.minIncome) hard.push(`Минимальный доход — ${fmt(prod.minIncome)} в месяц`);
    if (prod.downPaymentMin && profile.downPayment < prod.downPaymentMin)
        hard.push(`Первоначальный взнос — от ${prod.downPaymentMin}%`);
    const securedByPurchase = profile.purpose === "auto" || profile.purpose === "mortgage";
    if (loanAmount > prod.collateralOver && !profile.collateral && !securedByPurchase)
        hard.push(`Свыше ${fmt(prod.collateralOver)} нужен залог или поручитель`);

    const rate = estimateRate(prod, profile);
    const term = Math.min(profile.term, prod.termMax);
    const payment = annuityPayment(loanAmount, rate, term);
    const pti = profile.income > 0 ? (payment + profile.existingPayments) / profile.income : Infinity;

    if (pti > MAX_PTI) hard.push(`Долговая нагрузка ${pct(pti)} — выше лимита ЦБ 50%`);
    else if (pti > 0.35) soft.push(`Нагрузка ${pct(pti)} — одобрят, но бюджет будет напряжённым`);

    const maxPayment = MAX_PTI * profile.income - profile.existingPayments;
    const maxAffordable = Math.min(Math.max(0, principalFromPayment(maxPayment, rate, term)), prod.max);

    const status = hard.length ? "unlikely" : soft.length ? "possible" : "likely";
    return {
        bankId: bank.id,
        bankName: bank.name,
        color: bank.color,
        site: bank.site,
        product: profile.purpose,
        productLabel: PRODUCT_TYPES[profile.purpose],
        rate,
        rateRange: [prod.rateFrom, prod.rateTo],
        term,
        payment: Math.round(payment),
        overpayment: Math.round(payment * term - loanAmount),
        pti: Number(pti.toFixed(3)),
        maxAffordable: Math.round(maxAffordable),
        status,
        reasons: hard,
        risks: soft,
    };
}

function readiness(profile, bestPti) {
    const literacy = profile.quizScore * 30;
    const load = Number.isFinite(bestPti) ? Math.max(0, Math.min(1, (0.6 - bestPti) / 0.35)) * 30 : 0;
    const historyScore = { good: 20, none: 12, past_overdue: 6, overdue_now: 0 }[profile.history];
    const incomeScore = { official: 10, pensioner: 9, self: 7, unofficial: 3, student: 2 }[profile.employment];
    const reserveScore = profile.hasReserve ? 10 : 0;
    const parts = {
        literacy: Math.round(literacy),
        load: Math.round(load),
        history: historyScore,
        income: incomeScore,
        reserve: reserveScore,
    };
    return { score: Object.values(parts).reduce((a, b) => a + b, 0), parts };
}

function buildTips(profile, offers, best) {
    const tips = [];
    if (profile.history === "overdue_now")
        tips.push("Сначала погасите текущую просрочку: пока она есть, любой банк откажет.");
    if (best && best.pti > MAX_PTI)
        tips.push(
            `Платёж слишком велик для вашего дохода. Реально получить до ${fmt(best.maxAffordable)} — уменьшите сумму или увеличьте срок.`
        );
    if (best && best.pti > 0.35 && best.pti <= MAX_PTI)
        tips.push("Нагрузка выше 35% дохода. Оставьте запас на непредвиденные расходы или возьмите меньшую сумму.");
    if (!profile.hasReserve)
        tips.push("Соберите резерв на 3–6 месяцев расходов — он защитит от просрочек при потере дохода.");
    if (profile.employment === "unofficial")
        tips.push("Официальное трудоустройство или регистрация самозанятости расширит выбор банков и снизит ставку.");
    if (profile.history === "none")
        tips.push("Нет кредитной истории? Небольшая рассрочка, вовремя погашенная, поможет её сформировать.");
    if (profile.quizScore < 0.7)
        tips.push("Пройдите тест по финансовой грамотности ещё раз — это поможет увереннее сравнивать предложения.");
    if (offers.some((o) => o.reasons.some((r) => r.includes("залог"))) && !profile.collateral)
        tips.push("С залогом или поручителем доступны большие суммы и ставка ниже.");
    if (!tips.length) tips.push("Ваш профиль выглядит надёжно. Сравните эффективные ставки и условия досрочного погашения.");
    return tips;
}

export function matchOffers(profile) {
    const offers = banks
        .filter((bank) => bank.products[profile.purpose])
        .map((bank) => evaluateOffer(bank, bank.products[profile.purpose], profile));

    const order = { likely: 0, possible: 1, unlikely: 2 };
    offers.sort((a, b) => order[a.status] - order[b.status] || a.rate - b.rate || a.reasons.length - b.reasons.length);

    const best = offers[0];
    const bestPti = offers.length ? Math.min(...offers.map((o) => o.pti)) : Infinity;
    return {
        summary: {
            total: offers.length,
            likely: offers.filter((o) => o.status === "likely").length,
            possible: offers.filter((o) => o.status === "possible").length,
            bestRate: offers.filter((o) => o.status !== "unlikely").reduce((m, o) => Math.min(m, o.rate), Infinity),
            maxAffordable: offers.reduce((m, o) => Math.max(m, o.maxAffordable), 0),
        },
        readiness: readiness(profile, bestPti),
        tips: buildTips(profile, offers, best),
        offers,
    };
}

function fmt(n) {
    if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)} млн сум`;
    return `${Math.round(n).toLocaleString("ru-RU")} сум`;
}

function pct(x) {
    return `${Math.round(x * 100)}%`;
}
