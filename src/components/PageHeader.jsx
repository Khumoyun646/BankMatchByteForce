function PageHeader({ badge, title, children }) {
    return (
        <div className="mb-10 max-w-2xl">
            {badge && <span className="mb-4 inline-block rounded-full bg-[#2a2614] px-4 py-1.5 text-[12px] text-gold">{badge}</span>}
            <h1 className="mb-3 text-3xl font-medium leading-tight sm:text-4xl">{title}</h1>
            {children && <p className="leading-relaxed text-muted">{children}</p>}
        </div>
    );
}

export default PageHeader;
