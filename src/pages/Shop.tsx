import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

const FILTERS = ["TODOS", "CORE", "START", "FLOW", "END", "COMBO"] as const;
type Filter = (typeof FILTERS)[number];

export function Shop() {
  const [filter, setFilter] = useState<Filter>("TODOS");
  const { products, loading } = useProducts();

  const filteredProducts = useMemo(() => {
    if (filter === "TODOS") {
      return products;
    }
    return products.filter((product) => product.line === filter);
  }, [products, filter]);

  return (
    <div className="min-h-screen bg-brand-bg">
      <section className="section-container py-20 md:py-28">
        <div className="mb-12 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">Catálogo oficial</p>
            <h1 className="mt-4 text-5xl font-display font-extrabold uppercase tracking-tight md:text-7xl">Shop</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-brand-text/60 md:text-base">
              Portfólio completo com os 5 SKUs da arquitetura diária da 24 SHIFT.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full border px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  filter === value
                    ? "border-brand-text bg-brand-text text-white"
                    : "border-black/10 bg-white text-brand-text/50 hover:text-brand-text"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-sm font-medium text-brand-text/60">
            Carregando catálogo...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-sm font-medium text-brand-text/60">
            Nenhum produto encontrado para o filtro selecionado.
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
