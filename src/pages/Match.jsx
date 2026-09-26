import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRightIcon, CheckCircleIcon, WarningIcon, XCircleIcon, LightbulbIcon, XIcon } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { sum, short, pct } from "../lib/format";
import { updateProfile, setMatch } from "../redux/AppSlice";
import PageHeader from "../components/PageHeader";

const purposes = [
    { id: "consumer", label: "Потребительский" },
    { id: "micro", label: "Микрозайм" },
    { id: "auto", label: "Автокредит" },
    { id: "mortgage", label: "Ипотека" },
    { id: "education", label: "Обучение" },
];

const employment = [
    { id: "official", label: "Официальная работа" },
    { id: "self", label: "ИП / самозанятый" },
    { id: "unofficial", label: "Неофициальный доход" },
    { id: "pensioner", label: "Пенсионер" },
    { id: "student", label: "Студент" },
];

const history = [
    { id: "good", label: "Платил без просрочек" },
    { id: "none", label: "Кредитов не было" },
    { id: "past_overdue", label: "Были просрочки раньше" },
    { id: "overdue_now", label: "Есть просрочка сейчас" },
];

const statusView = {
    likely: { label: "Высокие шансы", icon: CheckCircleIcon, cls: "text-emerald-400 bg-emerald-500/10" },
    possible: { label: "Возможно", icon: WarningIcon, cls: "text-amber bg-amber/10" },
    unlikely: { label: "Скорее откажут", icon: XCircleIcon, cls: "text-red-400 bg-red-500/10" },
};

function Field({ label, hint, children }) {
    return (
        <label className="block">
            <span className="mb-2 flex justify-between text-sm text-neutral-300">
                {label}
                {hint && <span className="text-muted">{hint}</span>}
            </span>
            {children}
        </label>
    );
}

const inputCls = "w-full rounded-xl border border-line bg-panel-2 px-4 py-3 outline-none transition-colors focus:border-gold";

function Chips({ options, value, onChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((o) => (
                <button
                    type="button"
                    key={o.id}
                    onClick={() => onChange(o.id)}
                    className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                        value === o.id ? "bg-gold text-ink" : "bg-panel-2 text-neutral-300 hover:bg-neutral-800"
                    }`}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-left text-sm text-neutral-300">
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-gold" : "bg-neutral-700"}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`} />
            </span>
            {label}
        </button>
    );
}

function Match() {
    const dispatch = useDispatch();
    const { profile, quiz, match } = useSelector((s) => s.app);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [applyTo, setApplyTo] = useState(null);
    const resultsRef = useRef(null);

    const set = (patch) => dispatch(updateProfile(patch));
    const needsDown = profile.purpose === "auto" || profile.purpose === "mortgage";

    async function submit(e) {
        e.preventDefault();
        setError("");

        const numericFields = [
            ["Сумма кредита", profile.amount],
            ["Ежемесячный доход", profile.income],
            ["Текущие платежи", profile.existingPayments],
            ["Возраст", profile.age],
            ["Срок", profile.term],
            ["Первоначальный взнос", profile.downPayment],
        ];
        const invalid = numericFields.find(([, value]) => value === "" || !Number.isFinite(Number(value)));
        if (invalid) {
            setError(`${invalid[0]}: укажите корректное значение.`);
            return;
        }

        setLoading(true);
        try {
            const data = await api.match({
                ...profile,
                amount: Number(profile.amount),
                income: Number(profile.income),
                existingPayments: Number(profile.existingPayments || 0),
                age: Number(profile.age),
                term: Number(profile.term),
                downPayment: Number(profile.downPayment || 0),
                quizScore: quiz?.score ?? 0,
            });
            dispatch(setMatch(data));
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        } catch (err) {
            setError(err.message || "Не удалось выполнить подбор.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="px-6 py-10 sm:px-12 lg:px-[114px]">
            <PageHeader badge="Подбор кредита" title="Ответьте на вопросы — мы проверим банки">
                Расчёт ориентировочный и основан на публичных условиях банков. Паспортные данные не нужны.
            </PageHeader>

            {!quiz && (
                <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#3a3318] bg-[#1c1a10] p-5 text-sm sm:flex-row sm:items-center">
                    <span className="flex gap-2 text-neutral-300">
                        <LightbulbIcon size={18} className="shrink-0 text-gold" />
                        Сначала пройдите тест по финграмотности — он добавит до 30 баллов к индексу готовности.
                    </span>
                    <Link to="/quiz" className="shrink-0 rounded-xl bg-gold px-4 py-2 font-medium text-ink">
                        Пройти тест
                    </Link>
                </div>
            )}

            <form onSubmit={submit} className="grid gap-6 rounded-3xl bg-panel p-6 sm:p-8 lg:grid-cols-2">
                <div className="space-y-6 lg:col-span-2">
                    <Field label="1. Цель кредита">
                        <Chips options={purposes} value={profile.purpose} onChange={(purpose) => set({ purpose, term: purpose === "mortgage" ? Math.max(profile.term, 60) : Math.min(profile.term, 84) })} />
                    </Field>
                </div>

                <Field label="2. Сумма кредита" hint={short(profile.amount) + " сум"}>
                    <input
                        type="number"
                        min={100000}
                        step={100000}
                        required
                        className={inputCls}
                        value={profile.amount ?? ""}
                        onChange={(e) => set({ amount: e.target.value })}
                    />
                </Field>

                <Field label="3. Срок" hint={`${profile.term} мес. (${+(profile.term / 12).toFixed(1)} г.)`}>
                    <input
                        type="range"
                        min={profile.purpose === "mortgage" ? 12 : 3}
                        max={profile.purpose === "mortgage" ? 240 : 84}
                        step={profile.purpose === "mortgage" ? 12 : 3}
                        className="mt-3 w-full"
                        value={profile.term}
                        onChange={(e) => set({ term: Number(e.target.value) })}
                    />
                </Field>

                <Field label="4. Ежемесячный доход (после налогов)" hint={short(profile.income) + " сум"}>
                    <input
                        type="number"
                        min={0}
                        step={100000}
                        required
                        className={inputCls}
                        value={profile.income ?? ""}
                        onChange={(e) => set({ income: e.target.value })}
                    />
                </Field>

                <Field label="5. Платежи по текущим кредитам в месяц" hint={short(profile.existingPayments) + " сум"}>
                    <input
                        type="number"
                        min={0}
                        step={100000}
                        className={inputCls}
                        value={profile.existingPayments ?? ""}
                        onChange={(e) => set({ existingPayments: e.target.value })}
                    />
                </Field>

                <Field label="6. Возраст">
                    <input
                        type="number"
                        min={16}
                        max={90}
                        required
                        className={inputCls}
                        value={profile.age ?? ""}
                        onChange={(e) => set({ age: e.target.value })}
                    />
                </Field>

                {needsDown ? (
                    <Field label="7. Первоначальный взнос" hint={`${profile.downPayment}%`}>
                        <input
                            type="range"
                            min={0}
                            max={80}
                            step={5}
                            className="mt-3 w-full"
                            value={profile.downPayment}
                            onChange={(e) => set({ downPayment: Number(e.target.value) })}
                        />
                    </Field>
                ) : (
                    <div />
                )}

                <div className="lg:col-span-2">
                    <Field label="8. Занятость">
                        <Chips options={employment} value={profile.employment} onChange={(v) => set({ employment: v })} />
                    </Field>
                </div>

                <div className="lg:col-span-2">
                    <Field label="9. Кредитная история">
                        <Chips options={history} value={profile.history} onChange={(v) => set({ history: v })} />
                    </Field>
                </div>

                <div className="flex flex-col gap-4 lg:col-span-2">
                    <Toggle checked={profile.collateral} onChange={(v) => set({ collateral: v })} label="Могу предоставить залог или поручителя" />
                    <Toggle checked={profile.hasReserve} onChange={(v) => set({ hasReserve: v })} label="Есть сбережения на 3+ месяца расходов" />
                </div>

                {error && <div className="rounded-xl bg-red-950/40 p-4 text-sm text-red-300 lg:col-span-2">{error}</div>}

                <div className="lg:col-span-2">
                    <button disabled={loading} className="btn-gold flex items-center gap-2 rounded-2xl px-10 py-4 font-medium disabled:opacity-60">
                        {loading ? "Проверяем банки…" : "Подобрать кредит"} <ArrowRightIcon size={16} weight="bold" />
                    </button>
                </div>
            </form>

            {match && (
                <div ref={resultsRef} className="scroll-mt-6">
                    <Results match={match} onApply={setApplyTo} />
                </div>
            )}

            {applyTo && <ApplyModal offer={applyTo} profile={profile} readiness={match?.readiness.score} onClose={() => setApplyTo(null)} />}
        </section>
    );
}

function Readiness({ readiness }) {
    const { score, parts } = readiness;
    const rows = [
        ["Финграмотность", parts.literacy, 30],
        ["Долговая нагрузка", parts.load, 30],
        ["Кредитная история", parts.history, 20],
        ["Стабильность дохода", parts.income, 10],
        ["Финансовый резерв", parts.reserve, 10],
    ];
    const label = score >= 75 ? "Отличная готовность" : score >= 50 ? "Средняя готовность" : "Нужно подготовиться";
    return (
        <div className="card-gold rounded-3xl p-7 text-ink">
            <div className="mb-1 text-sm font-medium">Индекс готовности к кредиту</div>
            <div className="mb-1 text-6xl font-semibold">{score}</div>
            <div className="mb-6 text-sm">{label}</div>
            <div className="space-y-3">
                {rows.map(([name, v, max]) => (
                    <div key={name}>
                        <div className="mb-1 flex justify-between text-xs">
                            <span>{name}</span>
                            <span>
                                {v}/{max}
                            </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-ink/15">
                            <div className="h-full rounded-full bg-ink" style={{ width: `${(v / max) * 100}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Results({ match, onApply }) {
    const { summary, readiness, tips, offers } = match;
    return (
        <div className="animate-fade-up mt-10">
            <h2 className="mb-6 text-2xl font-medium">Результаты подбора</h2>
            <div className="mb-6 grid gap-6 lg:grid-cols-[320px_1fr]">
                <Readiness readiness={readiness} />
                <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Stat label="Высокие шансы" value={`${summary.likely} из ${summary.total}`} />
                        <Stat label="Лучшая ставка" value={summary.bestRate ? `${summary.bestRate}%` : "—"} />
                        <Stat label="Максимум по доходу" value={short(summary.maxAffordable)} />
                    </div>
                    <div className="rounded-3xl bg-panel p-6">
                        <h3 className="mb-4 flex items-center gap-2 font-medium">
                            <LightbulbIcon size={18} className="text-gold" /> Рекомендации
                        </h3>
                        <ul className="space-y-3">
                            {tips.map((t) => (
                                <li key={t} className="flex gap-3 text-sm leading-relaxed text-neutral-300">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {offers.length === 0 ? (
                <div className="rounded-3xl bg-panel p-8 text-muted">Для этой цели нет предложений в нашей базе.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {offers.map((o) => (
                        <OfferCard key={o.bankId} offer={o} onApply={onApply} />
                    ))}
                </div>
            )}
            <p className="mt-6 text-xs text-muted">
                * Расчёт ориентировочный. Итоговые ставку и сумму определяет банк после проверки документов и кредитной истории.
            </p>
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="rounded-3xl bg-panel p-5">
            <div className="mb-1 text-xs text-muted">{label}</div>
            <div className="text-2xl font-medium">{value}</div>
        </div>
    );
}

function OfferCard({ offer: o, onApply }) {
    const s = statusView[o.status];
    return (
        <div className={`rounded-3xl bg-panel p-6 ${o.status === "unlikely" ? "opacity-75" : ""}`}>
            <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: o.color }}>
                        {o.bankName[0]}
                    </span>
                    <div>
                        <div className="font-medium">{o.bankName}</div>
                        <div className="text-xs text-muted">{o.productLabel}</div>
                    </div>
                </div>
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${s.cls}`}>
                    <s.icon size={14} weight="fill" /> {s.label}
                </span>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-3 rounded-2xl bg-panel-2 p-4">
                <div>
                    <div className="text-[11px] text-muted">Ставка ~</div>
                    <div className="font-medium">{o.rate}%</div>
                </div>
                <div>
                    <div className="text-[11px] text-muted">Платёж / мес</div>
                    <div className="font-medium">{short(o.payment)}</div>
                </div>
                <div>
                    <div className="text-[11px] text-muted">Нагрузка</div>
                    <div className={`font-medium ${o.pti > 0.5 ? "text-red-400" : o.pti > 0.35 ? "text-amber" : ""}`}>{pct(o.pti)}</div>
                </div>
            </div>

            <div className="mb-4 text-sm text-neutral-400">
                Переплата за {o.term} мес.: <span className="text-white">{sum(o.overpayment)}</span>
            </div>

            {[...o.reasons, ...o.risks].length > 0 && (
                <ul className="mb-5 space-y-1.5">
                    {o.reasons.map((r) => (
                        <li key={r} className="text-xs text-red-300">• {r}</li>
                    ))}
                    {o.risks.map((r) => (
                        <li key={r} className="text-xs text-amber">• {r}</li>
                    ))}
                </ul>
            )}

            <div className="flex gap-2">
                {o.status !== "unlikely" && (
                    <button onClick={() => onApply(o)} className="btn-gold flex-1 rounded-xl py-3 text-sm font-medium">
                        Оставить заявку
                    </button>
                )}
                <a href={o.site} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-panel-2 py-3 text-center text-sm hover:bg-neutral-800">
                    Сайт банка
                </a>
            </div>
        </div>
    );
}

function ApplyModal({ offer, profile, readiness, onClose }) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("+998");
    const [state, setState] = useState({ loading: false, error: "", done: false });

    async function send(e) {
        e.preventDefault();
        setState({ loading: true, error: "", done: false });
        try {
            await api.apply({
                name,
                phone,
                bankId: offer.bankId,
                purpose: profile.purpose,
                amount: Number(profile.amount),
                term: Number(profile.term),
                readiness,
            });
            setState({ loading: false, error: "", done: true });
        } catch (err) {
            setState({ loading: false, error: err.message, done: false });
        }
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
            <div className="animate-fade-up w-full max-w-md rounded-3xl bg-panel p-7" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-medium">Заявка в {offer.bankName}</h3>
                        <p className="text-sm text-muted">
                            {offer.productLabel}, {short(profile.amount)} сум на {profile.term} мес.
                        </p>
                    </div>
                    <button onClick={onClose} aria-label="Закрыть" className="text-muted hover:text-white">
                        <XIcon size={20} />
                    </button>
                </div>
                {state.done ? (
                    <div className="rounded-2xl bg-emerald-500/10 p-5 text-sm text-emerald-300">
                        Заявка принята! Наш консультант свяжется с вами и поможет подготовить документы для банка.
                    </div>
                ) : (
                    <form onSubmit={send} className="space-y-4">
                        <Field label="Имя">
                            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
                        </Field>
                        <Field label="Телефон">
                            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" placeholder="+998 90 123 45 67" />
                        </Field>
                        {state.error && <div className="text-sm text-red-300">{state.error}</div>}
                        <p className="text-xs text-muted">Это заявка на консультацию в BankMatch, а не официальная заявка в банк.</p>
                        <button disabled={state.loading} className="btn-gold w-full rounded-xl py-3.5 font-medium disabled:opacity-60">
                            {state.loading ? "Отправляем…" : "Отправить"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Match;
