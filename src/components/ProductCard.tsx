import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../../shared/types";
import { formatCurrencyBRL } from "../lib/currency";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col"
    >
      <Link
        to={product.slug === "combo" ? "/combo" : `/product/${product.slug}`}
        className="relative mb-7 aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full rounded-[1.5rem] object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute left-6 top-6 rounded-full border border-black/10 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/70">
          SHIFT {product.line}
        </div>
        {product.provisional && (
          <div className="absolute bottom-6 right-6 rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
            Provisório
          </div>
        )}
      </Link>

      <div className="space-y-3 px-1">
        <h3 className="text-2xl font-display font-extrabold uppercase tracking-tight leading-tight">{product.name}</h3>
        <p className="text-sm font-medium leading-relaxed text-brand-text/65">{product.shortDescription}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-display font-extrabold">{formatCurrencyBRL(product.priceCents)}</span>
          <Link
            to={product.slug === "combo" ? "/combo" : `/product/${product.slug}`}
            className="inline-flex items-center gap-2 border-b-2 border-brand-text pb-1 text-xs font-bold uppercase tracking-widest transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            Ver produto <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
