import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PromoBanner } from "./PromoBanner";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text font-sans">
      <PromoBanner />
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
