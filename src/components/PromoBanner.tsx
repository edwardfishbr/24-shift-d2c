import { useState } from "react";
import { Tag, Truck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function PromoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50 overflow-hidden bg-brand-text px-4 py-2 text-white"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-orange/20 via-transparent to-brand-green/20" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-center">
          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
            <span className="flex items-center gap-2">
              <Tag size={13} className="text-brand-orange" />
              Primeira compra 10% OFF
            </span>
            <span className="hidden h-4 w-px bg-white/20 md:block" />
            <span className="hidden items-center gap-2 md:flex">
              <Truck size={13} className="text-brand-green" />
              Frete grátis acima de R$299
            </span>
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute right-0 rounded-full p-1 text-white/65 hover:text-white"
            aria-label="Fechar banner"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
