import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Droplets, Moon, Target, Zap } from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { ShiftCard } from "../components/ShiftCard";
import { useProducts } from "../hooks/useProducts";

export function Home() {
  const { products } = useProducts();

  const featuredLines = ["CORE", "START", "FLOW", "END"] as const;
  const featuredProducts = featuredLines
    .map((line) => products.find((product) => product.line === line))
    .filter(Boolean);

  return (
    <div className="flex flex-col bg-brand-bg">
      <section className="relative overflow-hidden pt-28 md:pt-40 pb-24">
        <div className="absolute left-1/4 top-10 h-80 w-80 rounded-full bg-brand-green/15 blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-brand-orange/15 blur-[80px]" />

        <div className="section-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl"
          >
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.35em] text-brand-text/45">24 SHIFT | Marca + Conversão</p>
            <h1 className="text-premium-headline mb-8 text-brand-text">
              Performance <br />
              <span className="bg-gradient-to-r from-brand-green to-brand-orange bg-clip-text text-transparent">
                corpo + mente
              </span>
            </h1>
            <p className="mx-auto mb-12 max-w-3xl text-premium-subheadline">
              Suplementos premium para rotina integrada: base diária, ativação inteligente, hidratação contínua e recuperação noturna.
            </p>
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Link to="/shop" className="btn-primary w-full sm:w-auto">
                Comprar agora <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="btn-outline w-full sm:w-auto">
                Conhecer a tese da marca
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-brand-text py-24 text-white">
        <div className="section-container text-center">
          <h2 className="mb-7 text-4xl font-display font-extrabold uppercase tracking-tight md:text-6xl">
            Sua rotina muda.
            <br />
            Sua performance também.
          </h2>
          <p className="mx-auto max-w-3xl text-lg font-light leading-relaxed text-white/70 md:text-xl">
            A 24 SHIFT traduz uma arquitetura de dia inteiro: não vendemos pico isolado, vendemos consistência elegante.
          </p>
        </div>
      </section>

      <section className="section-container py-24">
        <div className="mb-14 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">Arquitetura de linhas</p>
          <h2 className="mt-4 text-4xl font-display font-extrabold uppercase tracking-tight md:text-6xl">CORE / START / FLOW / END</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ShiftCard title="SHIFT CORE" subtitle="Base diária" desc="Constância e fundamento com creatina monohidratada." color="bg-white" />
          <ShiftCard title="SHIFT START" subtitle="Energia + foco" desc="Ativação inteligente para começar forte." color="bg-brand-text text-white" />
          <ShiftCard title="SHIFT FLOW" subtitle="Hidratação" desc="Eletrólitos para manter ritmo e desempenho contínuo." color="bg-brand-copper text-white" />
          <ShiftCard title="SHIFT END" subtitle="Recuperação" desc="Fechamento noturno para reiniciar o ciclo com qualidade." color="bg-brand-green text-white" />
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="section-container">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-green">Portfólio ativo</p>
              <h2 className="mt-4 text-4xl font-display font-extrabold uppercase tracking-tight md:text-6xl">5 SKUs em operação</h2>
            </div>
            <Link to="/shop" className="btn-outline w-full sm:w-auto">
              Ver catálogo completo
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 rounded-[2rem] border border-black/10 bg-brand-bg p-6 md:p-9">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-orange">Combo de entrada</p>
                <h3 className="mt-3 text-3xl font-display font-extrabold uppercase tracking-tight">SHIFT DAY STACK</h3>
                <p className="mt-2 text-sm font-medium text-brand-text/65">Creatina + Magnésio com economia para começar pela base e fechar o dia com recuperação.</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/combo" className="btn-primary">Conhecer combo</Link>
                <Link to="/checkout" className="btn-secondary">Ir para checkout</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-display font-extrabold uppercase tracking-tight md:text-5xl">Como usar na rotina</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <RoutineCard icon={<Target className="h-5 w-5" />} moment="Manhã" title="CORE" desc="Creatina para base de performance física e mental." />
          <RoutineCard icon={<Zap className="h-5 w-5" />} moment="Início do dia" title="START" desc="Focus & Energia para ativação inteligente." />
          <RoutineCard icon={<Droplets className="h-5 w-5" />} moment="Durante o dia" title="FLOW" desc="Electrolytes+ para hidratação e ritmo contínuo." />
          <RoutineCard icon={<Moon className="h-5 w-5" />} moment="Noite" title="END" desc="Magnésio Blend para recuperação e fechamento do ciclo." />
        </div>
      </section>

      <section className="border-t border-black/10 py-28 text-center">
        <div className="section-container">
          <h2 className="mb-10 text-5xl font-display font-extrabold uppercase tracking-tight md:text-7xl">
            Comece pela base.
            <br />
            Evolua pela rotina.
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/product/creatine" className="btn-primary w-full sm:w-auto">Comprar Creatina</Link>
            <Link to="/combo" className="btn-secondary w-full sm:w-auto">Conhecer Combo</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function RoutineCard({
  icon,
  moment,
  title,
  desc,
}: {
  icon: ReactNode;
  moment: string;
  title: string;
  desc: string;
}) {
  return (
    <article className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-text text-white">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-orange">{moment}</p>
      <h3 className="mt-3 text-2xl font-display font-extrabold uppercase tracking-tight">SHIFT {title}</h3>
      <p className="mt-2 text-sm font-medium leading-relaxed text-brand-text/65">{desc}</p>
    </article>
  );
}
