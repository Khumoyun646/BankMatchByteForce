import { useEffect, useState } from "react";
import { CheckCircleIcon, WarningCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { api } from "../lib/api";

function describe(status) {
    if (!status) return "Проверяем AI…";
    if (status.reachable) return `AI доступен · ${status.model || "Gemini"}`;
    if (status.reason === "missing_key") return "AI не настроен: отсутствует API key";
    if (status.reason === "invalid_key") return "AI недоступен: проверьте API key";
    if (status.reason === "rate_limit") return "AI временно ограничен по квоте/частоте запросов";
    if (status.reason === "timeout") return "AI не ответил вовремя";
    return "AI не удалось проверить: проверьте интернет на сервере";
}

export default function AiStatus({ className = "" }) {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        let alive = true;
        api.aiStatus().then((value) => {
            if (alive) setStatus(value);
        }).catch(() => {
            if (alive) setStatus({ reachable: false, reason: "network_or_api" });
        });
        return () => { alive = false; };
    }, []);

    const ok = status?.reachable;
    const waiting = status == null;
    const Icon = waiting ? CircleNotchIcon : ok ? CheckCircleIcon : WarningCircleIcon;

    return (
        <div className={`inline-flex items-center gap-2 rounded-full border border-line bg-panel-2 px-3 py-1.5 text-xs ${className}`}>
            <Icon size={15} className={`${ok ? "text-emerald-400" : "text-gold"} ${waiting ? "animate-spin" : ""}`} />
            <span className="text-neutral-300">{describe(status)}</span>
        </div>
    );
}
