import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleAlert, CircleCheckBig, LoaderCircle } from "lucide-react";
import type { OrderSummary } from "../../shared/types";
import { useCart } from "../context/CartContext";
import { fetchOrderSummary } from "../lib/api";
import { formatCurrencyBRL } from "../lib/currency";

const STATUS_TEXT: Record<OrderSummary["paymentStatus"], string> = {
  paid: "Pagamento aprovado",
  unpaid: "Pagamento pendente",
  no_payment_required: "Pagamento nao necessario",
  unknown: "Status em processamento",
};

export function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasClearedCart = useRef(false);

  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!sessionId) {
        setError("Sessao de checkout nao encontrada.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetchOrderSummary(sessionId);
        if (!mounted) return;
        setOrder(response);
        if (!hasClearedCart.current) {
          clearCart();
          hasClearedCart.current = true;
        }
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError instanceof Error ? requestError.message : "Falha ao carregar pedido.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="section-container py-24">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-black/10 bg-white px-6 py-12 text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-brand-text/45" />
          <p className="mt-4 text-sm font-medium text-brand-text/60">Buscando os dados reais do pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="section-container py-24">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-200 bg-red-50 px-6 py-12 text-center">
          <CircleAlert className="mx-auto h-8 w-8 text-red-600" />
          <h1 className="mt-4 text-2xl font-display font-extrabold uppercase tracking-tight">Nao foi possivel carregar</h1>
          <p className="mt-3 text-sm font-medium text-red-700">
            {error ?? "Pedido nao encontrado para esta sessao de checkout."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/checkout" className="btn-outline">
              Voltar ao checkout
            </Link>
            <Link to="/contact" className="btn-primary">
              Falar com atendimento
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg">
      <section className="section-container py-20 md:py-28">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-green">Pos-compra</p>
                <h1 className="mt-4 text-4xl font-display font-extrabold uppercase tracking-tight md:text-6xl">
                  Pedido confirmado
                </h1>
                <p className="mt-3 text-sm font-medium text-brand-text/60">
                  Sessao: <span className="font-bold text-brand-text">{order.sessionId}</span>
                </p>
              </div>
              <div className="rounded-xl bg-brand-green/10 px-4 py-3 text-sm font-bold text-brand-green">
                <CircleCheckBig className="mr-2 inline-block h-4 w-4" />
                {STATUS_TEXT[order.paymentStatus]}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-black/10 bg-brand-bg p-5 md:grid-cols-3">
              <SummaryCell label="Subtotal" value={formatCurrencyBRL(order.subtotalCents)} />
              <SummaryCell
                label="Frete"
                value={order.shippingCents === 0 ? "Gratis" : formatCurrencyBRL(order.shippingCents)}
              />
              <SummaryCell label="Total" value={formatCurrencyBRL(order.totalCents)} strong />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-black/10 bg-brand-bg p-5 md:grid-cols-2">
              <SummaryCell label="Cliente" value={order.customerName ?? "Nao informado"} />
              <SummaryCell label="E-mail" value={order.customerEmail ?? "Nao informado"} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-8 md:p-10">
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight">Itens do pedido</h2>
            <div className="mt-6 space-y-3">
              {order.items.map((item) => (
                <article
                  key={`${item.productId}-${item.slug}`}
                  className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-brand-bg p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange">SHIFT {item.line}</p>
                    <h3 className="mt-1 text-lg font-display font-extrabold uppercase tracking-tight">{item.name}</h3>
                    <p className="text-sm font-medium text-brand-text/55">
                      {item.quantity}x {formatCurrencyBRL(item.unitPriceCents)}
                    </p>
                  </div>
                  <p className="text-lg font-display font-extrabold">{formatCurrencyBRL(item.totalPriceCents)}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/shop" className="btn-primary">
                Continuar comprando
              </Link>
              <Link to="/contact" className="btn-outline">
                Preciso de ajuda
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/40">{label}</p>
      <p className={strong ? "mt-1 text-2xl font-display font-extrabold" : "mt-1 text-sm font-bold"}>{value}</p>
    </div>
  );
}
