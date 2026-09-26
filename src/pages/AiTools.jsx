import { useState } from "react";
import { FileTextIcon, ShieldWarningIcon, ChartLineUpIcon, LightbulbIcon, MagnifyingGlassIcon, RobotIcon } from "@phosphor-icons/react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import AiStatus from "../components/AiStatus";

const tools = [
    ["plan", "AI Business Plan", "Бизнес-план по идее, бюджету и городу", LightbulbIcon],
    ["check", "Financial Check-up", "Понятный разбор доходов, долгов и резерва", ChartLineUpIcon],
    ["loan", "AI Loan Explainer", "Объяснение банковских предложений простыми словами", MagnifyingGlassIcon],
    ["doc", "AI-анализ документа", "PDF или скрин условий кредита", FileTextIcon],
    ["scam", "AI Anti-Scam", "Проверка подозрительного сообщения", ShieldWarningIcon],
];

const inputCls = "w-full rounded-xl border border-line bg-panel-2 px-4 py-3 outline-none focus:border-gold";
const labelCls = "mb-2 block text-sm text-neutral-300";

function Field({ label, children }) {
    return <label className="block"><span className={labelCls}>{label}</span>{children}</label>;
}

function ToolShell({ children }) {
    return <div className="rounded-3xl bg-panel p-6 sm:p-8">{children}</div>;
}

function Result({ text }) {
    if (!text) return null;
    return (
        <div className="mt-6 w-full max-w-none break-words whitespace-pre-wrap rounded-2xl border border-line bg-panel-2 p-5 text-sm leading-7 text-neutral-200">
            {text}
        </div>
    );
}

function Button({ loading, children }) {
    return <button disabled={loading} className="btn-gold rounded-xl px-6 py-3 font-medium disabled:opacity-50">{loading ? "AI анализирует…" : children}</button>;
}

function BusinessPlan() {
    const [form, setForm] = useState({ business: "", city: "Ташкент", budget: "150000000" });
    const [reply, setReply] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
    async function submit(e) {
        e.preventDefault(); setLoading(true); setError(""); setReply("");
        try { setReply((await api.businessPlan({ ...form, budget: Number(form.budget) })).reply); } catch (e) { setError(e.message); } finally { setLoading(false); }
    }
    return <ToolShell><h2 className="mb-2 text-2xl font-medium">Генератор бизнес-плана</h2><p className="mb-6 text-sm text-muted">AI строит сценарии и показывает допущения — это не гарантия прибыли.</p>
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2"><Field label="Что хотите открыть?"><textarea required maxLength={500} rows={3} className={inputCls} placeholder="Например: кофейня на 30 посадочных мест" value={form.business} onChange={e=>setForm({...form,business:e.target.value})}/></Field></div>
            <Field label="Город / рынок"><input className={inputCls} value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></Field>
            <Field label="Бюджет, сум"><input required type="number" min="1" className={inputCls} value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></Field>
            <div className="md:col-span-2"><Button loading={loading}>Создать бизнес-план</Button></div>
        </form>{error && <p className="mt-4 text-sm text-red-300">{error}</p>}<Result text={reply}/>
    </ToolShell>;
}

function FinancialCheckup() {
    const [form, setForm] = useState({ income:"8000000", creditBalance:"30000000", payment:"2000000", otherPayments:"0", expenses:"4000000", reserve:"0" });
    const [data, setData] = useState(null); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
    async function submit(e) { e.preventDefault(); setLoading(true); setError(""); setData(null); try { setData(await api.financialCheckup(Object.fromEntries(Object.entries(form).map(([k,v])=>[k,Number(v)])))); } catch(e){setError(e.message)} finally{setLoading(false)} }
    return <ToolShell><h2 className="mb-2 text-2xl font-medium">AI Financial Check-up</h2><p className="mb-6 text-sm text-muted">Математику считаем на сервере, AI только объясняет результат.</p>
        <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Доход / месяц"><input type="number" min="1" className={inputCls} value={form.income} onChange={e=>setForm({...form,income:e.target.value})}/></Field>
            <Field label="Остаток кредита"><input type="number" min="0" className={inputCls} value={form.creditBalance} onChange={e=>setForm({...form,creditBalance:e.target.value})}/></Field>
            <Field label="Платёж по кредиту"><input type="number" min="0" className={inputCls} value={form.payment} onChange={e=>setForm({...form,payment:e.target.value})}/></Field>
            <Field label="Другие платежи"><input type="number" min="0" className={inputCls} value={form.otherPayments} onChange={e=>setForm({...form,otherPayments:e.target.value})}/></Field>
            <Field label="Обязательные расходы"><input type="number" min="0" className={inputCls} value={form.expenses} onChange={e=>setForm({...form,expenses:e.target.value})}/></Field>
            <Field label="Резерв"><input type="number" min="0" className={inputCls} value={form.reserve} onChange={e=>setForm({...form,reserve:e.target.value})}/></Field>
            <div className="sm:col-span-2 lg:col-span-3"><Button loading={loading}>Проверить финансовый профиль</Button></div>
        </form>{error&&<p className="mt-4 text-sm text-red-300">{error}</p>}
        {data&&<><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-panel-2 p-4"><span className="text-xs text-muted">Долговая нагрузка</span><b className="mt-1 block text-2xl">{Math.round(data.metrics.debtRatio*100)}%</b></div><div className="rounded-2xl bg-panel-2 p-4"><span className="text-xs text-muted">Резерв</span><b className="mt-1 block text-2xl">{data.metrics.reserveMonths == null ? "—" : `${data.metrics.reserveMonths} мес.`}</b></div><div className="rounded-2xl bg-panel-2 p-4"><span className="text-xs text-muted">Свободный остаток</span><b className="mt-1 block text-2xl">{data.metrics.freeCash.toLocaleString("ru-RU")} сум</b></div></div><Result text={data.reply}/></>}
    </ToolShell>;
}

function LoanExplainer() {
    const [offers,setOffers]=useState([{bank:"Банк A",amount:"30000000",rate:"24",months:"24",payment:"",conditions:"Досрочное погашение уточнить в договоре"}]);
    const [reply,setReply]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
    const update=(i,k,v)=>setOffers(a=>a.map((o,j)=>j===i?{...o,[k]:v}:o));
    async function submit(e){e.preventDefault();setLoading(true);setError("");try{setReply((await api.loanExplainer({offers:offers.map(o=>({...o,amount:Number(o.amount),rate:Number(o.rate),months:Number(o.months),payment:o.payment?Number(o.payment):undefined}))})).reply)}catch(e){setError(e.message)}finally{setLoading(false)}}
    return <ToolShell><h2 className="mb-2 text-2xl font-medium">AI Loan Explainer</h2><p className="mb-6 text-sm text-muted">Добавьте предложения банков — AI объяснит условия без выбора «победителя».</p>
        <div className="space-y-4">{offers.map((o,i)=><div key={i} className="grid gap-3 rounded-2xl bg-panel-2 p-4 sm:grid-cols-5">
            <input className={inputCls} placeholder="Банк" value={o.bank} onChange={e=>update(i,"bank",e.target.value)}/><input className={inputCls} type="number" placeholder="Сумма" value={o.amount} onChange={e=>update(i,"amount",e.target.value)}/><input className={inputCls} type="number" placeholder="Ставка %" value={o.rate} onChange={e=>update(i,"rate",e.target.value)}/><input className={inputCls} type="number" placeholder="Месяцев" value={o.months} onChange={e=>update(i,"months",e.target.value)}/><input className={inputCls} placeholder="Платёж (необязательно)" value={o.payment} onChange={e=>update(i,"payment",e.target.value)}/>
            <textarea className={`${inputCls} sm:col-span-5`} rows={2} placeholder="Комиссии, страховка, досрочное погашение..." value={o.conditions} onChange={e=>update(i,"conditions",e.target.value)}/>
        </div>)}</div>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={offers.length>=20} onClick={()=>setOffers(a=>[...a,{bank:`Банк ${a.length+1}`,amount:"30000000",rate:"24",months:"24",payment:"",conditions:""}])} className="rounded-xl bg-panel-2 px-4 py-3 text-sm">+ Добавить предложение</button><button onClick={submit} className="btn-gold rounded-xl px-6 py-3 font-medium">{loading?"AI анализирует…":"Объяснить предложения"}</button></div>
        {error&&<p className="mt-4 text-sm text-red-300">{error}</p>}<Result text={reply}/>
    </ToolShell>;
}

function DocumentAnalysis() {
    const [file,setFile]=useState(null); const [reply,setReply]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
    async function submit(e){e.preventDefault();if(!file)return;if(file.size>5*1024*1024){setError("Файл должен быть не больше 5 МБ");return;}setLoading(true);setError("");setReply("");try{const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(",")[1]);r.onerror=reject;r.readAsDataURL(file)});setReply((await api.documentAnalysis({mimeType:file.type,data})).reply)}catch(e){setError(e.message)}finally{setLoading(false)}}
    return <ToolShell><h2 className="mb-2 text-2xl font-medium">AI-анализ документа</h2><p className="mb-6 text-sm text-muted">PDF, PNG, JPG/JPEG или WebP до 5 МБ. Не загружайте паспорт, данные карты или другие секретные документы.</p>
        <form onSubmit={submit} className="space-y-5"><input required type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={e=>setFile(e.target.files?.[0]||null)} className="block w-full rounded-xl border border-line bg-panel-2 p-3 text-sm"/><Button loading={loading}>Проанализировать документ</Button></form>{error&&<p className="mt-4 text-sm text-red-300">{error}</p>}<Result text={reply}/>
    </ToolShell>;
}

function AntiScam() {
    const [message,setMessage]=useState("");const [reply,setReply]=useState("");const [loading,setLoading]=useState(false);const [error,setError]=useState("");
    async function submit(e){e.preventDefault();setLoading(true);setError("");try{setReply((await api.antiScam({message})).reply)}catch(e){setError(e.message)}finally{setLoading(false)}}
    return <ToolShell><h2 className="mb-2 text-2xl font-medium">AI Anti-Scam</h2><p className="mb-6 text-sm text-muted">Вставьте SMS, сообщение мессенджера или текст звонка. Не вставляйте секретные коды.</p>
        <form onSubmit={submit}><textarea required maxLength={5000} rows={7} className={inputCls} placeholder="«Вам одобрен кредит. Назовите код из SMS...»" value={message} onChange={e=>setMessage(e.target.value)}/><div className="mt-4"><Button loading={loading}>Проверить сообщение</Button></div></form>{error&&<p className="mt-4 text-sm text-red-300">{error}</p>}<Result text={reply}/>
    </ToolShell>;
}

function AiTools() {
    const [active,setActive]=useState("plan");
    const Current={plan:BusinessPlan,check:FinancialCheckup,loan:LoanExplainer,doc:DocumentAnalysis,scam:AntiScam}[active];
    return <section className="px-6 py-10 sm:px-12 lg:px-[114px]">
        <PageHeader badge="AI-инструменты" title="Практические AI-инструменты для финансовых решений">
            AI объясняет и структурирует информацию, а расчёты критичных показателей выполняются отдельно. Не передавайте секретные данные.
        </PageHeader>
        <div className="mb-5"><AiStatus /></div>
        <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{tools.map(([id,title,desc,Icon])=><button key={id} onClick={()=>setActive(id)} className={`rounded-2xl p-4 text-left transition-colors ${active===id?"bg-gold text-ink":"bg-panel text-neutral-300 hover:bg-panel-2"}`}><Icon size={22} className="mb-3"/><div className="text-sm font-semibold">{title}</div><div className={`mt-1 text-xs leading-relaxed ${active===id?"text-ink/70":"text-muted"}`}>{desc}</div></button>)}</div>
        <Current/>
        <div className="mt-6 flex gap-3 rounded-2xl border border-[#3a3318] bg-[#1c1a10] p-4 text-xs leading-5 text-neutral-300"><RobotIcon size={18} className="shrink-0 text-gold"/> AI-ответы являются справочной информацией. Для кредита, договора и бизнеса проверяйте исходные условия и официальные документы.</div>
    </section>;
}
export default AiTools;
