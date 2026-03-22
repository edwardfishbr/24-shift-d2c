import { Link } from "react-router-dom";

export function Shipping() {
  return (
    <div className="bg-brand-bg">
      <section className="section-container max-w-4xl py-20 md:py-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">Política operacional</p>
        <h1 className="mt-4 text-5xl font-display font-extrabold uppercase tracking-tight md:text-7xl">
          Frete e entregas
        </h1>

        <div className="mt-10 space-y-6 rounded-[2rem] border border-black/10 bg-white p-7 text-sm font-medium leading-relaxed text-brand-text/70 md:p-10">
          <p>
            Trabalhamos com envio nacional e regra comercial padrão do projeto:
            <strong className="text-brand-text"> frete fixo </strong>
            com
            <strong className="text-brand-text"> frete grátis acima de R$299</strong>.
          </p>
          <p>
            O cálculo final é aplicado no checkout Stripe conforme os parâmetros ativos da operação.
          </p>
          <p>
            Após confirmação de pagamento, você recebe acompanhamento de pedido e atualizações da jornada de entrega.
          </p>
          <p>
            Para questões logísticas específicas, acione nosso atendimento pela página de contato.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link to="/checkout" className="btn-primary w-full sm:w-auto">
            Ir para checkout
          </Link>
          <Link to="/returns" className="btn-outline w-full sm:w-auto">
            Ver trocas e devoluções
          </Link>
        </div>
      </section>
    </div>
  );
}
