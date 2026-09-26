import { InstagramLogoIcon, TelegramLogoIcon } from "@phosphor-icons/react"

const team = [
    { name: "Якубов Руслан", phone: "+998905541685" },
    { name: "Шарипов Хумойиддин", phone: "+998905531988" },
    { name: "Абдулайев Дониёр", phone: "+998907400905" },
    { name: "Джалолов Хумоюн", phone: "+998906909991" },
]

function Footer() {
    return (
        <footer className="border-t border-line px-6 py-12 sm:px-12 lg:px-[114px]">
            <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                    <h3 className="text-xl font-semibold">Команда ByteForce</h3>
                    <p className="text-sm text-muted">Сервис финансовой грамотности и подбора кредитов в Узбекистане</p>
                </div>
                <p className="text-xs text-muted">© {new Date().getFullYear()} BankMatch. Не является банком.</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {team.map((m) => (
                    <li key={m.phone} className="rounded-2xl bg-panel p-5">
                        <div className="mb-3 font-medium">{m.name}</div>
                        <a href={`tel:${m.phone}`} className="mb-3 block text-sm text-neutral-300 hover:text-gold">
                            {m.phone}
                        </a>
                        <div className="flex gap-3 text-neutral-400">
                            <span className="flex items-center gap-1.5 text-xs"><InstagramLogoIcon size={18} /> Instagram</span>
                            <span className="flex items-center gap-1.5 text-xs"><TelegramLogoIcon size={18} /> Telegram</span>
                        </div>
                    </li>
                ))}
            </ul>
        </footer>
    )
}
export default Footer
