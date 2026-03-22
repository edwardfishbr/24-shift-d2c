import { motion } from "motion/react";

interface ShiftCardProps {
  title: string;
  subtitle: string;
  desc: string;
  color: string;
}

export function ShiftCard({ title, subtitle, desc, color }: ShiftCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`p-10 rounded-[2rem] flex flex-col justify-between h-80 ${color} shadow-lg shadow-black/5`}
    >
      <div>
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 opacity-50">{title}</div>
        <h3 className="text-3xl font-display font-extrabold leading-tight uppercase">{subtitle}</h3>
      </div>
      <p className="text-sm opacity-80 font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}
