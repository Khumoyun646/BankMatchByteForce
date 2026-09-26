import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRightIcon, CheckCircleIcon, XCircleIcon, LightbulbIcon } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { setQuizResult } from "../redux/AppSlice";
import PageHeader from "../components/PageHeader";

function Quiz() {
    const dispatch = useDispatch();
    const saved = useSelector((s) => s.app.quiz);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState("");
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [feedback, setFeedback] = useState(null); // { correct, correctAnswer, explanation }
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);
    const [started, setStarted] = useState(!saved);

    useEffect(() => {
        api.quiz().then((d) => setQuestions(d.questions)).catch((e) => setError(e.message));
    }, []);

    const q = questions[index];
    const selected = q ? answers[q.id] : undefined;

    async function choose(i) {
        if (feedback || checking) return;
        setAnswers((a) => ({ ...a, [q.id]: i }));
        setChecking(true);
        try {
            setFeedback(await api.checkAnswer(q.id, i));
        } catch (e) {
            setError(e.message);
        } finally {
            setChecking(false);
        }
    }

    async function next() {
        setFeedback(null);
        if (index < questions.length - 1) return setIndex(index + 1);
        try {
            const r = await api.submitQuiz(answers);
            setResult(r);
            dispatch(setQuizResult(r));
        } catch (e) {
            setError(e.message);
        }
    }

    function restart() {
        setIndex(0);
        setAnswers({});
        setFeedback(null);
        setResult(null);
        setStarted(true);
    }

    const shown = result || (!started && saved);

    return (
        <section className="px-6 py-10 sm:px-12 lg:px-[114px]">
            <PageHeader badge="Финансовая грамотность" title="Тест: готовы ли вы к кредиту?">
                После каждого ответа вы увидите объяснение. Результат учитывается в индексе готовности при подборе кредита.
            </PageHeader>

            {error && <div className="mb-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">{error}</div>}

            {shown ? (
                <Result result={shown} onRestart={restart} />
            ) : !q ? (
                !error && <div className="h-64 animate-pulse rounded-3xl bg-panel" />
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    <div key={q.id} className="animate-fade-up rounded-3xl bg-panel p-6 sm:p-8">
                        <div className="mb-6 flex items-center justify-between text-sm text-muted">
                            <span className="rounded-full bg-panel-2 px-3 py-1 text-gold">{q.topic}</span>
                            <span>
                                {index + 1} / {questions.length}
                            </span>
                        </div>
                        <h2 className="mb-6 text-xl font-medium leading-snug sm:text-2xl">{q.question}</h2>
                        <div className="grid gap-3">
                            {q.options.map((opt, i) => {
                                let style = "border-line bg-panel-2 hover:border-neutral-500";
                                if (feedback) {
                                    if (i === feedback.correctAnswer) style = "border-emerald-500 bg-emerald-500/10";
                                    else if (i === selected) style = "border-red-500 bg-red-500/10";
                                    else style = "border-line bg-panel-2 opacity-60";
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => choose(i)}
                                        disabled={Boolean(feedback) || checking}
                                        className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${style}`}
                                    >
                                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-xs text-muted">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {feedback && (
                            <div className="animate-fade-up mt-6 rounded-2xl bg-ink p-5">
                                <div className={`mb-2 flex items-center gap-2 font-medium ${feedback.correct ? "text-emerald-400" : "text-red-400"}`}>
                                    {feedback.correct ? <CheckCircleIcon size={20} weight="fill" /> : <XCircleIcon size={20} weight="fill" />}
                                    {feedback.correct ? "Верно!" : "Не совсем так"}
                                </div>
                                <p className="mb-5 text-sm leading-relaxed text-neutral-300">{feedback.explanation}</p>
                                <button onClick={next} className="btn-gold flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium">
                                    {index < questions.length - 1 ? "Следующий вопрос" : "Узнать результат"} <ArrowRightIcon size={14} weight="bold" />
                                </button>
                            </div>
                        )}
                    </div>

                    <aside className="h-fit rounded-3xl bg-panel p-6">
                        <div className="mb-3 text-sm text-muted">Прогресс</div>
                        <div className="mb-5 h-2 overflow-hidden rounded-full bg-panel-2">
                            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {questions.map((x, i) => (
                                <span
                                    key={x.id}
                                    className={`grid h-8 place-items-center rounded-lg text-xs ${
                                        i === index ? "bg-gold text-ink" : answers[x.id] !== undefined ? "bg-neutral-700" : "bg-panel-2 text-muted"
                                    }`}
                                >
                                    {i + 1}
                                </span>
                            ))}
                        </div>
                        <div className="mt-6 flex gap-2 rounded-2xl bg-panel-2 p-4 text-xs leading-relaxed text-neutral-400">
                            <LightbulbIcon size={18} className="shrink-0 text-gold" />
                            Для «зачёта» нужно 70% верных ответов.
                        </div>
                    </aside>
                </div>
            )}
        </section>
    );
}

function Result({ result, onRestart }) {
    const score = Math.round(result.score * 100);
    return (
        <div className="animate-fade-up grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="card-gold rounded-3xl p-8 text-ink">
                <div className="mb-2 text-sm font-medium">Ваш результат</div>
                <div className="mb-1 text-6xl font-semibold">{score}</div>
                <div className="mb-6 text-sm">
                    {result.correct} из {result.total} верных ответов
                </div>
                <div className="rounded-2xl bg-ink/90 px-4 py-3 text-sm text-white">
                    {result.passed ? "Зачёт! Вы готовы осознанно выбирать кредит." : "Пока не зачёт — повторите слабые темы."}
                </div>
            </div>
            <div className="rounded-3xl bg-panel p-8">
                <h3 className="mb-4 text-xl font-medium">
                    {result.weakTopics?.length ? "Темы, которые стоит повторить" : "Отличная работа — ошибок нет"}
                </h3>
                {result.weakTopics?.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2">
                        {result.weakTopics.map((t) => (
                            <span key={t} className="rounded-full bg-panel-2 px-4 py-2 text-sm text-neutral-300">
                                {t}
                            </span>
                        ))}
                    </div>
                )}
                <p className="mb-8 text-sm text-muted">
                    Вопросы по слабым темам можно задать AI-помощнику. А теперь проверим, какие банки готовы выдать вам кредит.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link to="/match" className="btn-gold flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-medium">
                        Перейти к подбору <ArrowRightIcon size={14} weight="bold" />
                    </Link>
                    <button onClick={onRestart} className="rounded-2xl bg-panel-2 px-8 py-4 text-sm hover:bg-neutral-800">
                        Пройти ещё раз
                    </button>
                    <Link to="/assistant" className="rounded-2xl bg-panel-2 px-8 py-4 text-sm hover:bg-neutral-800">
                        Спросить AI
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Quiz;
