import { Link } from "react-router-dom";

export function Returns() {
  return (
    <div className="bg-brand-bg">
      <section className="section-container max-w-4xl py-20 md:py-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">Política operacional</p>
        <h1 className="mt-4 text-5xl font-display font-extrabold uppercase tracking-tight md:text-7xl">
          Trocas e devoluções
        </h1>

        <div className="mt-10 space-y-6 rounded-[2rem] border border-black/10 bg-white p-7 text-sm font-medium leading-relaxed text-brand-text/70 md:p-10">
          <p>
            Aceitamos devoluções e tratamos cada solicitação com análise de elegibilidade conforme prazo legal,
            condição do produto e motivo informado.
          </p>
          <p>
            Itens com violação de lacre, uso indevido ou fora de prazo podem não ser elegíveis para reembolso.
          </p>
          <p>
            Solicitações devem ser abertas pelo canal de contato com número do pedido e descrição do caso.
          </p>
          <p>
            Em caso de avaria no transporte, informe imediatamente com fotos da embalagem e do produto.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link to="/contact" className="btn-primary w-full sm:w-auto">
            Abrir atendimento
          </Link>
          <Link to="/faq" className="btn-outline w-full sm:w-auto">
            Ver FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
