import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ArrowDownIcon,
    ArrowDownRightIcon,
    WifiHighIcon,
    WalletIcon,
    ExamIcon,
    CalculatorIcon,
    BankIcon,
    ShieldCheckIcon,
} from "@phosphor-icons/react";

const tabs = [
    {
        id: "learn",
        label: "Финансовая грамотность",
        badge: "Бесплатный тест",
        title: "Разберитесь в кредитах до того, как пойти в банк!",
        text: "12 коротких вопросов о ставках, платежах, долговой нагрузке и кредитной истории. После каждого ответа — понятное объяснение.",
        cta: { to: "/quiz", label: "Пройти тест" },
    },
    {
        id: "match",
        label: "Подбор кредита",
        badge: "Все банки Узбекистана",
        title: "Узнайте, где вам реально одобрят кредит!",
        text: "Ответьте на вопросы о доходе, цели и кредитной истории — мы проверим условия банков и покажем ставку, платёж и шансы на одобрение.",
        cta: { to: "/match", label: "Подобрать кредит" },
    },
    {
        id: "ai",
        label: "AI-помощник",
        badge: "Работает 24/7",
        title: "Задайте любой вопрос о кредите простыми словами!",
        text: "AI-консультант объяснит термины из договора, поможет посчитать переплату и подскажет, как не попасться мошенникам.",
        cta: { to: "/assistant", label: "Спросить AI" },
    },
];

const partners = ["Kapitalbank", "Hamkorbank", "NBU", "Agrobank", "Anorbank", "SQB"];

function HeroVisual({ quiz }) {
    const bars = [34, 58, 22, 40, 72, 30, 64, 46];
    return (
        <div className="relative mx-auto h-[420px] w-full max-w-[460px] sm:h-[460px]">
            <div
                className="absolute left-[4%] top-[26%] h-[250px] w-[190px] rounded-[22px] bg-linear-to-br from-neutral-700 to-neutral-900 shadow-2xl"
                style={{ transform: "rotate(-24deg)" }}
            >
                <div className="absolute left-6 top-10 text-2xl font-black italic text-neutral-600" style={{ transform: "rotate(90deg)", transformOrigin: "left" }}>
                    UZCARD
                </div>
            </div>
            <div
                className="absolute left-[16%] top-[14%] h-[260px] w-[200px] rounded-[22px] bg-linear-to-br from-neutral-600 to-neutral-800 shadow-2xl"
                style={{ transform: "rotate(-12deg)" }}
            >
                <div className="absolute left-7 top-7 flex">
                    <span className="h-7 w-7 rounded-full bg-neutral-900/70" />
                    <span className="-ml-3 h-7 w-7 rounded-full bg-neutral-900/50" />
                </div>
                <div className="absolute bottom-8 left-7 text-xs text-neutral-400">Срок: 24 мес.</div>
            </div>

            <div className="card-gold animate-float absolute right-[6%] top-0 h-[300px] w-[230px] rounded-[22px] p-6 text-ink shadow-[0_30px_60px_-20px_rgba(245,215,110,0.35)] sm:w-[250px]">
                <div className="flex items-start justify-between">
                    <span className="text-2xl font-black italic tracking-tight">HUMO</span>
                    <span className="-mr-10 grid h-10 w-12 place-items-center rounded-xl bg-ink text-white">
                        <WifiHighIcon size={18} weight="bold" className="rotate-90" />
                    </span>
                </div>
                <div className="absolute bottom-[92px] left-6 right-6">
                    <div className="mb-1 flex gap-3 text-[17px] font-semibold tracking-wide">
                        <span>9860</span><span>2101</span><span>••••</span><span>2751</span>
                    </div>
                    <div className="text-sm">BankMatch Client</div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[62px] rounded-b-[22px] bg-[#d9b54a]/60">
                    <div className="pt-5 text-center text-xs font-medium">Ставка от 16% годовых</div>
                </div>
            </div>

            <div className="glass absolute bottom-[4%] left-[10%] w-[150px] rounded-2xl p-3" style={{ transform: "rotate(-8deg)" }}>
                <div className="mb-2 text-[13px] font-medium">Индекс готовности</div>
                <div className="mb-3 flex h-[52px] items-end gap-[6px] px-1">
                    {bars.map((h, i) => (
                        <span key={i} className="w-[5px] rounded-full bg-neutral-500" style={{ height: `${h}%`, background: i === 4 ? "#fff" : undefined }} />
                    ))}
                </div>
                <Link to="/match" className="block rounded-xl bg-white py-2 text-center text-[12px] font-medium text-ink">
                    Узнать свой
                </Link>
            </div>

            {/* виджет «Грамотность» */}
            <div className="glass absolute bottom-[18%] right-0 w-[150px] rounded-2xl p-3" style={{ transform: "rotate(10deg)" }}>
                <div className="mb-2 flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-700">
                        <WalletIcon size={16} />
                    </span>
                    <span className="text-[12px] leading-tight">Фин.<br />грамотность</span>
                </div>
                <div className="text-lg font-semibold">{quiz ? `${Math.round(quiz.score * 100)} / 100` : "— / 100"}</div>
                <div className="mb-2 text-[10px] text-neutral-400">{quiz ? `${quiz.correct} из ${quiz.total} верно` : "пройдите тест"}</div>
                <Link to="/quiz" className="block rounded-xl bg-white py-2 text-center text-[12px] font-medium text-ink">
                    {quiz ? "Пройти снова" : "Начать тест"}
                </Link>
            </div>
        </div>
    );
}

const steps = [
    { icon: ExamIcon, title: "Пройдите тест", text: "Проверьте знания о кредитах и узнайте, на что смотреть в договоре." },
    { icon: CalculatorIcon, title: "Ответьте о себе", text: "Доход, цель, срок и кредитная история — всё анонимно, без паспорта." },
    { icon: BankIcon, title: "Сравните банки", text: "Ставка, платёж, переплата и шансы на одобрение в 12 банках." },
    { icon: ShieldCheckIcon, title: "Подайте заявку", text: "Оставьте контакты — мы поможем подготовиться к визиту в банк." },
];

function Home() {
    const [active, setActive] = useState(tabs[0].id);
    const tab = tabs.find((t) => t.id === active);
    const quiz = useSelector((s) => s.app.quiz);

    return (
        <>
            <section className="px-6 pb-10 pt-8 sm:px-12 lg:px-[114px]">
                <div className="mb-12 flex justify-center">
                    <div className="flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-panel p-1.5" role="tablist">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                role="tab"
                                aria-selected={t.id === active}
                                onClick={() => setActive(t.id)}
                                className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-[14px] transition-colors ${
                                    t.id === active ? "bg-panel-2 text-white shadow" : "text-muted hover:text-neutral-300"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
                    <div key={tab.id} className="animate-fade-up">
                        <span className="mb-5 inline-block rounded-full bg-[#2a2614] px-4 py-1.5 text-[12px] text-gold">{tab.badge}</span>
                        <h1 className="mb-6 text-[34px] font-medium leading-[1.15] sm:text-[44px]">{tab.title}</h1>
                        <p className="mb-10 max-w-[440px] text-[16px] leading-relaxed text-muted">{tab.text}</p>
                        <div className="flex flex-wrap gap-3">
                            <Link to={tab.cta.to} className="btn-gold flex items-center gap-2 rounded-2xl px-10 py-4 text-[15px] font-medium transition-transform hover:-translate-y-0.5">
                                {tab.cta.label} <ArrowDownRightIcon size={16} weight="bold" />
                            </Link>
                            <Link to="/banks" className="rounded-2xl bg-panel-2 px-8 py-4 text-[15px] transition-colors hover:bg-neutral-800">
                                Смотреть банки
                            </Link>
                        </div>
                    </div>
                    <HeroVisual quiz={quiz} />
                </div>

                <div className="mt-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-4 text-[15px]">Банки в сравнении</div>
                        <div className="flex flex-wrap gap-x-7 gap-y-2 text-lg font-bold italic text-neutral-600">
                            {partners.map((p) => (
                                <span key={p}>{p}</span>
                            ))}
                        </div>
                    </div>
                    <a href="#how" className="flex items-center gap-2 text-[14px] hover:text-gold">
                        Как это работает <ArrowDownIcon size={14} />
                    </a>
                </div>
            </section>

            <section id="how" className="px-6 py-16 sm:px-12 lg:px-[114px]">
                <h2 className="mb-2 text-3xl font-medium">Как это работает</h2>
                <p className="mb-10 text-muted">Четыре шага от «хочу кредит» до осознанного решения.</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((s, i) => (
                        <div key={s.title} className="rounded-3xl bg-panel p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-panel-2 text-gold">
                                    <s.icon size={22} />
                                </span>
                                <span className="text-sm text-muted">0{i + 1}</span>
                            </div>
                            <h3 className="mb-2 text-lg font-medium">{s.title}</h3>
                            <p className="text-sm leading-relaxed text-muted">{s.text}</p>
                        </div>
                    ))}
                </div>

                <div className="card-gold mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl p-8 text-ink sm:flex-row sm:items-center">
                    <div>
                        <h3 className="mb-1 text-2xl font-semibold">Правило 50% от ЦБ Узбекистана</h3>
                        <p className="max-w-xl text-sm text-neutral-800">
                            Банк не выдаст кредит, если все ваши ежемесячные платежи превысят половину дохода. Проверьте свою нагрузку заранее.
                        </p>
                    </div>
                    <Link to="/match" className="shrink-0 rounded-2xl bg-ink px-7 py-4 text-sm font-medium text-white">
                        Рассчитать нагрузку
                    </Link>
                </div>
            </section>
        </>
    );
}

export default Home;
