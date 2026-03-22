import { Accordion } from "../components/Accordion";

export function FAQ() {
  return (
    <div className="bg-brand-bg">
      <section className="section-container max-w-4xl py-20 md:py-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">FAQ do site</p>
        <h1 className="mt-4 text-5xl font-display font-extrabold uppercase tracking-tight md:text-7xl">
          Perguntas frequentes
        </h1>
        <p className="mt-4 text-sm font-medium leading-relaxed text-brand-text/60 md:text-base">
          Dúvidas sobre produtos, compra, logística e políticas da operação D2C da 24 SHIFT.
        </p>

        <div className="mt-12 rounded-[2rem] border border-black/10 bg-white px-6 py-2 md:px-10">
          <Accordion
            title="Qual produto comprar primeiro?"
            content="Para começar, use a base CORE + END com o SHIFT DAY STACK (Creatina + Magnésio). Se quiser ampliar a rotina, adicione START e FLOW."
            defaultOpen
          />
          <Accordion
            title="Os produtos podem ser usados juntos?"
            content="Sim. A arquitetura da marca foi desenhada para uso complementar ao longo do dia: CORE, START, FLOW e END."
          />
          <Accordion
            title="START e FLOW já estão disponíveis?"
            content="Sim. Estão ativos como SKUs provisórios vendáveis, com estrutura pronta para evolução de fórmula e posicionamento."
          />
          <Accordion
            title="Como funciona frete e prazo?"
            content="Frete fixo com regra de frete grátis acima de R$299. Prazo final é exibido no checkout conforme endereço."
          />
          <Accordion
            title="Como funcionam trocas e devoluções?"
            content="Temos página dedicada de política com prazos e critérios de devolução. Se necessário, use a página de contato para abrir atendimento."
          />
          <Accordion
            title="Quais formas de pagamento são aceitas?"
            content="Checkout Stripe com cartão e métodos habilitados na conta Stripe do projeto."
          />
        </div>
      </section>
    </div>
  );
}
