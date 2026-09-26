import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import logo from "../Img/Subtract.svg";

const links = [
    { to: "/", label: "Главная" },
    { to: "/quiz", label: "Тест" },
    { to: "/match", label: "Подбор кредита" },
    { to: "/banks", label: "Банки" },
    { to: "/assistant", label: "AI-помощник" },
    { to: "/ai-tools", label: "AI-инструменты" },
];

function NavItem({ to, label, onClick }) {
    return (
        <NavLink
            to={to}
            end={to === "/"}
            onClick={onClick}
            className={({ isActive }) =>
                `relative rounded-xl px-4 py-2 text-[14px] font-medium transition-colors ${
                    isActive ? "bg-gold-soft text-ink" : "text-neutral-800 hover:bg-neutral-100"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <span className="absolute left-1/2 top-0 h-[3px] w-8 -translate-x-1/2 -translate-y-[1px] rounded-b-full bg-gold" />
                    )}
                    {label}
                </>
            )}
        </NavLink>
    );
}

function Navbar() {
    const [open, setOpen] = useState(false);
    const quiz = useSelector((s) => s.app.quiz);

    return (
        <header className="relative bg-white text-ink">
            <div className="flex h-[68px] items-center justify-between px-5 sm:px-10">
                <Link to="/" className="flex items-center gap-2.5" aria-label="BankMatch — на главную">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-gold text-[13px] font-bold">B</span>
                    <img src={logo} alt="BankMatch" className="h-[18px] invert" />
                </Link>

                <nav className="hidden items-center gap-1 lg:flex">
                    {links.map((l) => (
                        <NavItem key={l.to} {...l} />
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-gold-soft to-amber text-sm font-bold">
                        {quiz ? Math.round(quiz.score * 100) : "?"}
                    </div>
                    <div className="leading-tight">
                        <div className="text-[13px] font-semibold">Фин. грамотность</div>
                        <div className="text-[11px] text-neutral-500">
                            {quiz ? (quiz.passed ? "Тест пройден" : "Можно лучше") : "Тест не пройден"}
                        </div>
                    </div>
                </div>

                <button
                    className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 lg:hidden"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Меню"
                    aria-expanded={open}
                >
                    {open ? <XIcon size={20} /> : <ListIcon size={20} />}
                </button>
            </div>

            {open && (
                <nav className="flex flex-col gap-1 border-t border-neutral-100 px-5 pb-5 pt-3 lg:hidden">
                    {links.map((l) => (
                        <NavItem key={l.to} {...l} onClick={() => setOpen(false)} />
                    ))}
                </nav>
            )}
        </header>
    );
}

export default Navbar;
