import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AccordionProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

export function Accordion({ title, content, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-8 border-b border-black/10 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="font-display font-extrabold text-xl uppercase tracking-tight group-hover:text-brand-green transition-colors">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <ChevronUp className="w-6 h-6 text-brand-text/30" />
          ) : (
            <ChevronDown className="w-6 h-6 text-brand-text/30" />
          )}
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-brand-text/60 font-medium leading-relaxed text-base pt-6">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
