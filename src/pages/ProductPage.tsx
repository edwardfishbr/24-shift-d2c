import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShoppingBag, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { formatCurrencyBRL } from "../lib/currency";

const lineDescription: Record<string, string> = {
  CORE: "Fundamento diário para constância física e mental.",
  START: "Ativação inteligente para energia e foco nos momentos críticos.",
  FLOW: "Hidratação com eletrólitos para manter ritmo e performance.",
  END: "Recuperação noturna com linguagem conservadora e funcional.",
  COMBO: "Arquitetura mínima da rotina integrada em uma única compra.",
};

export function ProductPage({ forcedSlug }: { forcedSlug?: string } = {}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const resolvedSlug = forcedSlug ?? slug;
  const product = useMemo(() => products.find((entry) => entry.slug === resolvedSlug), [products, resolvedSlug]);
  const related = useMemo(
    () => products.filter((entry) => entry.slug !== resolvedSlug && entry.active).slice(0, 3),
    [products, resolvedSlug],
  );

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product.id, quantity);
  };

  const handleCheckout = () => {
    if (!product) return;
    addItem(product.id, quantity);
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="section-container py-24 text-center text-sm font-medium text-brand-text/60">Carregando produto...</div>
    );
  }

  if (!product) {
    return (
      <div className="section-container py-24 text-center">
        <h1 className="text-3xl font-display font-extrabold uppercase">Produto não encontrado</h1>
        <p className="mt-4 text-sm font-medium text-brand-text/60">Este item não está disponível no catálogo atual.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Voltar para o shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg">
      <section className="section-container py-14 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[2.5rem] border border-black/10 bg-white p-6 shadow-sm md:p-8"
          >
            <img src={product.image} alt={product.name} className="h-full w-full rounded-[2rem] object-cover" referrerPolicy="no-referrer" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">SHIFT {product.line}</p>
              <h1 className="text-4xl font-display font-extrabold uppercase tracking-tight md:text-6xl">{product.name}</h1>
              <p className="text-base font-medium leading-relaxed text-brand-text/65">{product.description}</p>
              <p className="text-sm font-medium text-brand-text/55">{lineDescription[product.line]}</p>
              {product.provisional && (
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                  SKU provisório vendável
                </span>
              )}
            </div>

            <div className="flex items-end gap-4">
              <span className="text-4xl font-display font-extrabold">{formatCurrencyBRL(product.priceCents)}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/35">Preço unitário</span>
            </div>

            <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center overflow-hidden rounded-full border-2 border-brand-text bg-white">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-4 py-2 text-xl font-bold">
                    -
                  </button>
                  <span className="w-10 text-center text-lg font-display font-extrabold">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="px-4 py-2 text-xl font-bold">
                    +
                  </button>
                </div>
                <button type="button" onClick={handleAddToCart} className="btn-outline flex-1 !py-3">
                  <ShoppingBag className="h-4 w-4" /> Adicionar
                </button>
              </div>

              <button type="button" onClick={handleCheckout} className="btn-primary w-full !py-3">
                Ir para checkout <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-2 rounded-xl bg-black/5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/45">
                <Truck className="h-3.5 w-3.5" /> Frete fixo + grátis acima de R$299
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-black/10 bg-white p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-text/40">Por que escolher este produto</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm font-medium text-brand-text/70"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Fórmula com posicionamento clean premium funcional.</li>
                <li className="flex items-start gap-2 text-sm font-medium text-brand-text/70"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Claims conservadores e comunicação responsável.</li>
                <li className="flex items-start gap-2 text-sm font-medium text-brand-text/70"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" /> Integração com checkout Stripe e pós-compra automatizado.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-white py-20">
        <div className="section-container">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-display font-extrabold uppercase tracking-tight">Continue sua rotina</h2>
            <Link to="/shop" className="text-xs font-bold uppercase tracking-[0.2em] text-brand-text/60 hover:text-brand-text">
              Ver shop completo
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {related.map((entry) => (
              <Link
                key={entry.id}
                to={entry.slug === "combo" ? "/combo" : `/product/${entry.slug}`}
                className="rounded-2xl border border-black/10 bg-brand-bg p-4 transition-colors hover:border-black/25"
              >
                <img src={entry.image} alt={entry.name} className="h-36 w-full rounded-xl object-cover" referrerPolicy="no-referrer" />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">SHIFT {entry.line}</p>
                <h3 className="mt-2 text-lg font-display font-extrabold uppercase tracking-tight">{entry.name}</h3>
                <p className="mt-1 text-sm font-medium text-brand-text/60">{entry.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
