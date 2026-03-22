import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-brand-text py-20 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2 space-y-6">
          <Link to="/" className="inline-flex">
            <img src={logo} alt="24 SHIFT" className="h-11 w-auto invert" />
          </Link>
          <h2 className="text-3xl font-display font-extrabold uppercase leading-[0.9] tracking-tight">
            Performance corpo + mente
            <br />
            ao longo do dia.
          </h2>
          <p className="max-w-md text-sm font-medium leading-relaxed text-white/65">
            Marca premium funcional com arquitetura diária em cinco SKUs ativos: CORE, START, FLOW, END e SHIFT DAY STACK.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Produtos</h3>
          <ul className="space-y-3 text-sm font-medium text-white/85">
            <li><Link to="/product/creatine" className="hover:text-brand-orange">Creatina CORE</Link></li>
            <li><Link to="/product/start-focus-energy" className="hover:text-brand-orange">START Focus & Energia</Link></li>
            <li><Link to="/product/flow-electrolytes-plus" className="hover:text-brand-orange">FLOW Electrolytes+</Link></li>
            <li><Link to="/product/magnesium" className="hover:text-brand-orange">Magnésio END</Link></li>
            <li><Link to="/combo" className="hover:text-brand-orange">SHIFT DAY STACK</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Operação</h3>
          <ul className="space-y-3 text-sm font-medium text-white/85">
            <li><Link to="/shop" className="hover:text-brand-orange">Shop</Link></li>
            <li><Link to="/shipping" className="hover:text-brand-orange">Frete e Entregas</Link></li>
            <li><Link to="/returns" className="hover:text-brand-orange">Trocas e Devoluções</Link></li>
            <li><Link to="/faq" className="hover:text-brand-orange">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-brand-orange">Contato</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/15 px-4 pt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40 sm:px-6 md:flex-row lg:px-8">
        <span>© {new Date().getFullYear()} 24 SHIFT</span>
        <div className="flex items-center gap-6">
          <span>D2C próprio</span>
          <span>Checkout Stripe</span>
          <span>Supabase</span>
        </div>
      </div>
    </footer>
  );
}
