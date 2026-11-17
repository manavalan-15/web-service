import { motion, useReducedMotion } from 'motion/react';
import {
  Building2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Rocket,
  ShoppingBag,
  Truck,
  Utensils,
} from 'lucide-react';
import { INDUSTRIES, IndustryItem } from '../data/agencyData';

const ICON_MAP: Record<IndustryItem['iconName'], React.ElementType> = {
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Building2,
  Utensils,
  Truck,
  Landmark,
  Rocket,
};

export function IndustriesSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="industries"
      className="py-20 sm:py-24 lg:py-28 bg-white border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14"
        >
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold tracking-[0.06em] text-[#1E40AF] mb-3">
              INDUSTRIES WE SERVE
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-[-0.025em] text-[#0F172A] text-balance">
              Digital Solutions Across Every Industry.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-md leading-[1.65]">
            Industry-adapted architecture, compliance awareness, and user
            experiences built for how your sector works.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {INDUSTRIES.map((industry, index) => {
            const Icon = ICON_MAP[industry.iconName];
            return (
              <motion.article
                key={industry.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.45,
                  delay: prefersReducedMotion ? 0 : (index % 4) * 0.055,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-[#F8F9FA] p-6 transition-all duration-200 hover:bg-white hover:border-slate-300"
              >
                {/* Clean geometric visual accent in corner */}
                <div
                  className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full border border-slate-200/80 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between gap-3 mb-5">
                  <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 text-[#1E40AF] flex items-center justify-center transition-colors duration-200 group-hover:bg-[#1E40AF] group-hover:text-white group-hover:border-[#1E40AF]">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {industry.accentLabel}
                  </span>
                </div>

                <h3 className="relative font-display text-lg font-bold text-[#0F172A] tracking-tight mb-2">
                  {industry.title}
                </h3>

                <p className="relative text-sm leading-[1.6] text-slate-600">
                  {industry.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
