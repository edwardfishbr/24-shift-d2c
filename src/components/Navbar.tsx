import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import logo from "../assets/logo.png";
import { useCart } from "../context/CartContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-xs font-bold tracking-widest uppercase transition-colors ${isActive ? "text-brand-text" : "text-brand-text/55 hover:text-brand-text"}`;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-brand-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center">
            <img src={logo} alt="24 SHIFT" className="h-11 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/shop" className={navLinkClass}>
              Shop
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              Sobre
            </NavLink>
            <NavLink to="/faq" className={navLinkClass}>
              FAQ
            </NavLink>
            <NavLink to="/shipping" className={navLinkClass}>
              Frete
            </NavLink>
            <NavLink to="/returns" className={navLinkClass}>
              Trocas
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contato
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/checkout"
            className="relative rounded-full p-2.5 transition-colors hover:bg-black/5"
            aria-label="Abrir checkout"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-black">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="rounded-full p-2.5 transition-colors hover:bg-black/5 md:hidden"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -16, height: 0 }}
            className="overflow-hidden border-t border-black/5 bg-brand-bg md:hidden"
          >
            <div className="space-y-8 p-6">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-text/35">Produtos</h3>
                <div className="grid grid-cols-2 gap-3 text-sm font-bold uppercase">
                  <Link to="/product/creatine" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-black/10 bg-white p-4">CORE</Link>
                  <Link to="/product/start-focus-energy" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-black/10 bg-white p-4">START</Link>
                  <Link to="/product/flow-electrolytes-plus" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-black/10 bg-white p-4">FLOW</Link>
                  <Link to="/product/magnesium" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-black/10 bg-white p-4">END</Link>
                </div>
                <Link
                  to="/combo"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl bg-brand-text p-4 text-center text-sm font-bold uppercase tracking-wide text-white"
                >
                  SHIFT DAY STACK
                </Link>
              </div>

              <div className="space-y-4 border-t border-black/10 pt-5 text-lg font-display font-bold uppercase tracking-tight">
                <Link to="/shop" onClick={() => setMobileOpen(false)} className="block">
                  Shop
                </Link>
                <Link to="/about" onClick={() => setMobileOpen(false)} className="block">
                  Sobre
                </Link>
                <Link to="/faq" onClick={() => setMobileOpen(false)} className="block">
                  FAQ
                </Link>
                <Link to="/shipping" onClick={() => setMobileOpen(false)} className="block">
                  Frete e Entregas
                </Link>
                <Link to="/returns" onClick={() => setMobileOpen(false)} className="block">
                  Trocas e Devoluções
                </Link>
                <Link to="/contact" onClick={() => setMobileOpen(false)} className="block">
                  Contato
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
