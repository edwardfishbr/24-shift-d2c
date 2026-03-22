import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShieldCheck, Truck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Accordion } from "../components/Accordion";

export function ProductCreatine() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="bg-brand-bg min-h-screen">
      <div className="section-container py-12 md:py-32">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left: Images */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 space-y-8"
          >
            <div className="relative aspect-square rounded-[3rem] bg-brand-core/30 p-12 md:p-20 flex items-center justify-center overflow-hidden group shadow-2xl shadow-black/5">
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md text-brand-text text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full shadow-sm z-10 border border-black/5">
                SHIFT CORE
              </div>
              <motion.img 
                src="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2070&auto=format&fit=crop" 
                alt="Creatina Monohidratada 300g" 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full object-cover rounded-[2rem] drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="aspect-square rounded-[2rem] bg-brand-core/20 p-8 flex items-center justify-center overflow-hidden border border-black/5">
                <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl opacity-80" referrerPolicy="no-referrer" />
              </div>
              <div className="aspect-square rounded-[2rem] bg-brand-core/20 p-8 flex items-center justify-center overflow-hidden border border-black/5">
                <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl opacity-80" referrerPolicy="no-referrer" />
              </div>
            </div>
          </motion.div>

          {/* Right: Info */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="sticky top-32">
              <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-orange mb-6">Fundamento Diário</div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter mb-6 uppercase leading-[0.85]">
                Creatina <br /> Monohidratada
              </h1>
              <p className="text-xl text-brand-text/60 font-medium mb-10 leading-relaxed max-w-lg">
                O pilar da sua performance física e mental. Desenvolvida para ser o alicerce da sua rotina integrada.
              </p>
              
              <div className="flex items-baseline gap-4 mb-12">
                <div className="text-5xl font-display font-extrabold tracking-tighter">
                  R$ 129,90
                </div>
                <div className="text-sm font-bold text-brand-text/30 tracking-widest uppercase">300g | 100 Doses</div>
              </div>

              {/* Add to cart */}
              <div className="flex flex-col gap-6 mb-16">
                <div className="flex items-center gap-6">
                  <div className="flex items-center border-[3px] border-brand-text rounded-full overflow-hidden bg-white h-20 shadow-lg shadow-black/5">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-8 h-full hover:bg-black/5 transition-colors text-2xl font-bold"
                    >-</button>
                    <span className="w-10 text-center font-extrabold text-xl font-display">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-8 h-full hover:bg-black/5 transition-colors text-2xl font-bold"
                    >+</button>
                  </div>
                  <button className="btn-primary flex-1 h-20 text-base shadow-2xl">
                    Adicionar no Shift
                  </button>
                </div>
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-text/40 bg-black/5 py-4 rounded-full border border-black/5">
                  <Truck className="w-4 h-4" /> Frete grátis acima de R$ 299
                </div>
              </div>

              {/* Quick Benefits */}
              <div className="grid grid-cols-3 gap-6 mb-16">
                <BenefitIcon icon={<ShieldCheck className="w-6 h-6 text-brand-green" />} label="100% Pura" />
                <BenefitIcon icon={<Zap className="w-6 h-6 text-brand-orange" />} label="Sem Sabor" />
                <BenefitIcon icon={<Package className="w-6 h-6 text-brand-copper" />} label="Shift Core" />
              </div>

              {/* Accordions */}
              <div className="border-t-[3px] border-black/5">
                <Accordion 
                  title="A Tese" 
                  content="A creatina não é um estimulante momentâneo. É um construtor de base. Desenvolvida para ser o pilar da sua rotina diária, a Creatina 24 SHIFT garante que seu físico e sua mente tenham a reserva de energia necessária para performar com consistência, dia após dia."
                  defaultOpen={true}
                />
                <Accordion 
                  title="Arquitetura de Uso" 
                  content="Misture 3g (1 scoop) em sua bebida preferida, todos os dias. O segredo da linha CORE é a constância: o benefício é cumulativo e deve fazer parte do seu ritual matinal ou pré-performance."
                />
                <Accordion 
                  title="Composição Limpa" 
                  content="Creatina Monohidratada com alto grau de pureza. Sem aditivos, sem conservantes, sem ruído. 100% Funcional."
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cross-sell */}
      <section className="py-32 bg-brand-text text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-brand-green rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="section-container relative z-10">
          <div className="bg-white/5 rounded-[4rem] p-10 md:p-24 flex flex-col lg:flex-row items-center gap-16 border border-white/10 backdrop-blur-sm shadow-2xl">
            <div className="w-full lg:w-2/5 aspect-square rounded-[3rem] overflow-hidden bg-white/10 relative group">
              <img 
                src="https://images.unsplash.com/photo-1622484211148-7182101b0687?q=80&w=2070&auto=format&fit=crop" 
                alt="Magnésio Blend" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-8 left-8 bg-brand-green text-white text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full z-10 border border-white/10">
                SHIFT END
              </div>
            </div>
            <div className="w-full lg:w-3/5 space-y-10 text-center lg:text-left">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter uppercase leading-[0.85]">
                  Feche o Ciclo <br className="hidden md:block" />
                  <span className="text-brand-green italic font-light lowercase">com o Blend END.</span>
                </h2>
                <p className="text-xl text-white/50 font-light max-w-2xl leading-relaxed">
                  A Creatina CORE constrói a base do seu dia. O Magnésio END garante a recuperação inteligente da sua noite. Juntos, eles formam a arquitetura mínima de performance.
                </p>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <Link to="/combo" className="btn-primary bg-white text-brand-text hover:bg-white/90 w-full sm:w-auto">
                  Levar o Combo Inicial
                </Link>
                <Link to="/product/magnesium" className="btn-outline border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                  Ver Magnésio END
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BenefitIcon({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text opacity-60 leading-tight">{label}</span>
    </div>
  );
}
