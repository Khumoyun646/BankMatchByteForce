import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const RootLayout = () => {
    return (
        <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
                <Navbar />
                <main className="rounded-t-[28px] bg-ink">
                    <Outlet />
                    <Footer />
                </main>
            </div>
            <ScrollRestoration />
        </div>
    );
};

export default RootLayout;
