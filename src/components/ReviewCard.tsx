import { Star, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface ReviewCardProps {
  text: string;
  author: string;
  product: string;
}

export function ReviewCard({ text, author, product }: ReviewCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="p-10 rounded-[2rem] bg-white border border-black/5 flex flex-col justify-between shadow-sm"
    >
      <div>
        <div className="flex gap-1 mb-8">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-brand-orange text-brand-orange" />)}
        </div>
        <p className="text-xl font-medium leading-relaxed mb-10 text-brand-text/90 italic">"{text}"</p>
      </div>
      <div>
        <div className="font-bold text-lg">{author}</div>
        <div className="text-xs font-bold tracking-widest uppercase text-brand-text/40 flex items-center gap-2 mt-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" /> Comprador Verificado • {product}
        </div>
      </div>
    </motion.div>
  );
}
