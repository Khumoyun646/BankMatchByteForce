import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { short } from "../lib/format";
import PageHeader from "../components/PageHeader";

function Banks() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [type, setType] = useState("consumer");

    useEffect(() => {
        api.banks().then(setData).catch((e) => setError(e.message));
    }, []);

    const list = useMemo(() => {
        if (!data) return [];
        return data.banks
            .filter((b) => b.products[type])
            .sort((a, b) => a.products[type].rateFrom - b.products[type].rateFrom);
    }, [data, type]);

    return (
        <section className="px-6 py-10 sm:px-12 lg:px-[114px]">
            <PageHeader badge="Каталог" title="Условия банков Узбекистана">
                Сравните диапазоны ставок, лимиты и требования. Данные ориентировочные — актуальные условия уточняйте на сайте банка.
            </PageHeader>

            {error && <div className="mb-6 rounded-2xl bg-red-950/40 p-4 text-sm text-red-300">{error}</div>}

            {data && (
                <div className="mb-8 flex flex-wrap gap-2">
                    {Object.entries(data.products).map(([id, label]) => (
                        <button
                            key={id}
                            onClick={() => setType(id)}
                            className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                                type === id ? "bg-gold text-ink" : "bg-panel text-neutral-300 hover:bg-panel-2"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {!data && !error && <div className="h-64 animate-pulse rounded-3xl bg-panel" />}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((bank) => {
                    const p = bank.products[type];
                    return (
                        <div
                            key={bank.id}
                            className="group rounded-3xl bg-panel p-6 transition-transform duration-300 hover:-translate-y-1"
                            style={{ boxShadow: `inset 0 3px 0 ${bank.color}` }}
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <span className="grid h-11 w-11 place-items-center rounded-xl text-sm font-bold" style={{ background: bank.color }}>
                                    {bank.name[0]}
                                </span>
                                <div>
                                    <div className="font-medium">{bank.name}</div>
                                    <div className="text-xs text-muted">{p.label}</div>
                                </div>
                            </div>
                            <div className="mb-5 text-3xl font-medium">
                                {p.rateFrom}–{p.rateTo}
                                <span className="text-base text-muted">% годовых</span>
                            </div>
                            <dl className="space-y-2 text-sm">
                                <Row label="Сумма" value={`${short(p.min)} – ${short(p.max)}`} />
                                <Row label="Срок" value={`до ${p.termMax} мес.`} />
                                <Row label="Мин. доход" value={p.minIncome ? `${short(p.minIncome)} / мес` : "не требуется"} />
                                <Row
                                    label="Без залога"
                                    value={p.collateralOver === null ? "на любую сумму" : p.collateralOver === 0 ? "залог — покупка" : `до ${short(p.collateralOver)}`}
                                />
                                {p.downPaymentMin > 0 && <Row label="Первый взнос" value={`от ${p.downPaymentMin}%`} />}
                                <Row label="Возраст" value={`${bank.minAge}–${bank.maxAge} лет`} />
                            </dl>
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl bg-panel p-8 sm:flex-row sm:items-center">
                <div>
                    <h3 className="mb-1 text-xl font-medium">Не знаете, какой банк выбрать?</h3>
                    <p className="text-sm text-muted">Мы посчитаем платёж и шансы на одобрение с учётом вашего дохода.</p>
                </div>
                <Link to="/match" className="btn-gold flex shrink-0 items-center gap-2 rounded-2xl px-8 py-4 text-sm font-medium">
                    Подобрать кредит <ArrowRightIcon size={14} weight="bold" />
                </Link>
            </div>
        </section>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right">{value}</dd>
        </div>
    );
}

export default Banks;
