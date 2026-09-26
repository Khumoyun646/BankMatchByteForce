import { useEffect, useRef, useState } from "react";
import { PaperPlaneRightIcon, RobotIcon, SparkleIcon } from "@phosphor-icons/react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import AiStatus from "../components/AiStatus";

const suggestions = [
    "Чем аннуитет отличается от дифференцированного платежа?",
    "Как узнать свою кредитную историю в Узбекистане?",
    "Что выгоднее при досрочном погашении?",
    "Как распознать мошенников, которые звонят «из банка»?",
];

const greeting = {
    role: "assistant",
    text: "Здравствуйте! Я AI-помощник BankMatch. Спросите меня о ставках, платежах, кредитной истории или о том, как не переплатить по кредиту.",
};

function Assistant() {
    const [messages, setMessages] = useState([greeting]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    async function send(text) {
        const content = text.trim();
        if (!content || loading) return;
        const next = [...messages, { role: "user", text: content }];
        setMessages(next);
        setInput("");
        setLoading(true);
        try {
            const { reply } = await api.chat(next.slice(1));
            setMessages((m) => [...m, { role: "assistant", text: reply }]);
        } catch (e) {
            setMessages((m) => [...m, { role: "assistant", text: e.message, error: true }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="px-6 py-10 sm:px-12 lg:px-[114px]">
            <PageHeader badge="AI-помощник" title="Спросите о кредитах простыми словами">
                Помощник объясняет, но не принимает решений за вас. Никогда не сообщайте ему данные карт и коды из SMS.
            </PageHeader>
            <div className="mb-5"><AiStatus /></div>

            <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl bg-panel">
                <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                            {m.role === "assistant" && (
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold text-ink">
                                    <RobotIcon size={18} />
                                </span>
                            )}
                            <div
                                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                                    m.role === "user" ? "bg-gold-soft text-ink" : m.error ? "bg-red-950/40 text-red-300" : "bg-panel-2 text-neutral-200"
                                }`}
                            >
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-ink">
                                <RobotIcon size={18} />
                            </span>
                            <div className="flex items-center gap-1 rounded-2xl bg-panel-2 px-4 py-3">
                                {[0, 1, 2].map((d) => (
                                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 px-5 pb-4 sm:px-7">
                        {suggestions.map((s) => (
                            <button key={s} onClick={() => send(s)} className="flex items-center gap-1.5 rounded-xl bg-panel-2 px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800">
                                <SparkleIcon size={12} className="text-gold" /> {s}
                            </button>
                        ))}
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        send(input);
                    }}
                    className="flex gap-2 border-t border-line p-3 sm:p-4"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Например: нужен кредит без залога — на что обратить внимание?"
                        maxLength={2000}
                        className="flex-1 rounded-xl bg-panel-2 px-4 py-3 outline-none placeholder:text-muted focus:ring-1 focus:ring-gold"
                    />
                    <button disabled={loading || !input.trim()} className="btn-gold grid w-14 place-items-center rounded-xl disabled:opacity-50" aria-label="Отправить">
                        <PaperPlaneRightIcon size={18} weight="fill" />
                    </button>
                </form>
            </div>
        </section>
    );
}

export default Assistant;
