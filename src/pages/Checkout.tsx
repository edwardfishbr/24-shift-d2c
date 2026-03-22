import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";
import { createCheckoutSession } from "../lib/api";
import { formatCurrencyBRL } from "../lib/currency";

export function Checkout() {
  const { items, subtotalCents, shippingCents, totalCents, setItemQuantity, removeItem, clearCart } = useCart();
  const { byId } = useProducts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled") === "1";

  const cartRows = useMemo(() => {
    return items
      .map((item) => {
        const product = byId.get(item.productId);
        if (!product) {
          return null;
        }
        return {
          item,
          product,
          rowTotal: product.priceCents * item.quantity,
        };
      })
      .filter(Boolean);
  }, [items, byId]);

  async function handleStartCheckout() {
    if (items.length === 0 || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const payload = await createCheckoutSession({
        items,
        successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/checkout?canceled=1`,
      });

      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Falha ao iniciar checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-brand-bg">
      <section className="section-container py-20 md:py-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">Conversão</p>
        <h1 className="mt-4 text-5xl font-display font-extrabold uppercase tracking-tight md:text-7xl">Checkout</h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-brand-text/60 md:text-base">
          Revisão final do carrinho com regra de frete fixa e redirecionamento para checkout seguro Stripe.
        </p>

        {canceled && (
          <div className="mt-8 rounded-xl border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm font-bold text-brand-text">
            Checkout cancelado. Seu carrinho foi mantido para você retomar quando quiser.
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-black/10 bg-white p-8 text-center">
            <p className="text-sm font-medium text-brand-text/60">Seu carrinho está vazio.</p>
            <Link to="/shop" className="btn-primary mt-6 inline-flex">
              Ir para o shop
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {cartRows.map((row) =>
                row ? (
                  <article
                    key={row.product.id}
                    className="flex flex-col gap-4 rounded-[2rem] border border-black/10 bg-white p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex gap-4">
                      <img
                        src={row.product.image}
                        alt={row.product.name}
                        className="h-20 w-20 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">
                          SHIFT {row.product.line}
                        </p>
                        <h2 className="mt-1 text-lg font-display font-extrabold uppercase tracking-tight">
                          {row.product.name}
                        </h2>
                        <p className="mt-1 text-xs font-medium text-brand-text/55">{row.product.shortDescription}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 md:justify-end">
                      <div className="flex items-center overflow-hidden rounded-full border border-black/15 bg-brand-bg">
                        <button
                          type="button"
                          onClick={() => setItemQuantity(row.product.id, row.item.quantity - 1)}
                          className="px-3 py-1.5"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-9 text-center text-sm font-bold">{row.item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setItemQuantity(row.product.id, row.item.quantity + 1)}
                          className="px-3 py-1.5"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <span className="min-w-24 text-right text-sm font-display font-extrabold">
                        {formatCurrencyBRL(row.rowTotal)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(row.product.id)}
                        className="rounded-full p-2 text-brand-text/45 transition-colors hover:bg-black/5 hover:text-brand-text"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ) : null,
              )}
            </div>

            <aside className="h-fit space-y-4 rounded-[2rem] border border-black/10 bg-white p-6">
              <h2 className="text-xl font-display font-extrabold uppercase tracking-tight">Resumo</h2>
              <SummaryRow label="Subtotal" value={formatCurrencyBRL(subtotalCents)} />
              <SummaryRow label="Frete" value={shippingCents === 0 ? "Grátis" : formatCurrencyBRL(shippingCents)} />
              <div className="border-t border-black/10 pt-4">
                <SummaryRow label="Total" value={formatCurrencyBRL(totalCents)} strong />
              </div>

              <button
                type="button"
                onClick={handleStartCheckout}
                disabled={loading}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Redirecionando..." : "Finalizar no Stripe"}
              </button>

              <button type="button" onClick={clearCart} className="btn-outline w-full">
                Limpar carrinho
              </button>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-brand-text/60">{label}</span>
      <span className={strong ? "text-lg font-display font-extrabold" : "font-display font-bold"}>{value}</span>
    </div>
  );
}
