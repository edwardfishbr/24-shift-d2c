import { CheckCircle2 } from "lucide-react";

const principles = [
  "Performance elegante para a vida real.",
  "Arquitetura diária por momento de uso (CORE/START/FLOW/END).",
  "Comunicação responsável sem promessas terapêuticas.",
  "Operação D2C com experiência direta e controle de margem.",
];

const notUs = [
  "Não é linguagem maromba agressiva.",
  "Não é suplemento genérico de prateleira.",
  "Não é promessa vazia ou exagero de claim.",
  "Não é ruído visual com cara de marketplace comum.",
];

export function About() {
  return (
    <div className="bg-brand-bg">
      <section className="section-container py-20 md:py-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">Sobre a marca</p>
        <h1 className="mt-4 text-5xl font-display font-extrabold uppercase tracking-tight md:text-7xl">
          24 SHIFT
        </h1>
        <p className="mt-6 max-w-3xl text-base font-medium leading-relaxed text-brand-text/65 md:text-lg">
          A 24 SHIFT nasceu para acompanhar a performance ao longo do dia inteiro. O foco é rotina integrada: base,
          ativação, hidratação e recuperação dentro de uma estética clean premium funcional.
        </p>
      </section>

      <section className="border-y border-black/10 bg-white py-20">
        <div className="section-container grid grid-cols-1 gap-8 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-black/10 bg-brand-bg p-7">
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight">O que defendemos</h2>
            <ul className="mt-6 space-y-3">
              {principles.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium leading-relaxed text-brand-text/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-green" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[2rem] border border-black/10 bg-brand-text p-7 text-white">
            <h2 className="text-2xl font-display font-extrabold uppercase tracking-tight">O que não somos</h2>
            <ul className="mt-6 space-y-3">
              {notUs.map((item) => (
                <li key={item} className="text-sm font-medium leading-relaxed text-white/75">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section-container py-20">
        <h2 className="text-3xl font-display font-extrabold uppercase tracking-tight md:text-4xl">
          Tese da marca
        </h2>
        <p className="mt-4 max-w-4xl text-base font-medium leading-relaxed text-brand-text/65">
          Nem todo dia pede a mesma energia. O site e os produtos da 24 SHIFT foram desenhados para caber na rotina
          real: dia intenso de trabalho, treino, recuperação e constância no longo prazo.
        </p>
      </section>
    </div>
  );
}
