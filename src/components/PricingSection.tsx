import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { PRICING_PLANS, PricingPlan } from '../data/agencyData';

interface PricingSectionProps {
  onSelectPlan: (plan: PricingPlan) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="pricing"
      className="py-20 sm:py-24 lg:py-28 bg-[#F8F9FA] border-b border-slate-200/80"
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
              OUR PRICING
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-[-0.025em] text-[#0F172A] text-balance">
              Choose the Right Solution for Your Business.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-md leading-[1.65]">
            Flexible packages structured for clarity. All pricing fields are
            editable placeholders aligned to your project requirements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
          {PRICING_PLANS.map((plan, index) => {
            const isRecommended = Boolean(plan.recommended);
            return (
              <motion.article
                key={plan.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.45,
                  delay: prefersReducedMotion ? 0 : index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`flex flex-col rounded-2xl p-6 sm:p-7 transition-colors duration-200 ${
                  isRecommended
                    ? 'bg-[#0F172A] text-white border border-[#0F172A] shadow-[0_20px_50px_-15px_rgba(15,23,42,0.28)]'
                    : 'bg-white text-[#0F172A] border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isRecommended ? 'text-blue-400' : 'text-[#1E40AF]'
                    }`}
                  >
                    {plan.code} · {plan.name}
                  </span>
                  {isRecommended && (
                    <span className="text-[11px] font-semibold tracking-wide text-blue-300">
                      Recommended
                    </span>
                  )}
                </div>

                <div className="mb-2">
                  <div className="font-display text-2xl sm:text-[28px] font-bold tracking-tight tabular-nums">
                    {plan.pricePlaceholder}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isRecommended ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {plan.billingNote}
                  </div>
                </div>

                <p
                  className={`text-sm leading-[1.6] mt-3 pb-5 border-b ${
                    isRecommended
                      ? 'text-slate-300 border-slate-800'
                      : 'text-slate-600 border-slate-200'
                  }`}
                >
                  {plan.description}
                </p>

                <ul className="space-y-3 py-6 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm leading-snug"
                    >
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isRecommended ? 'text-blue-400' : 'text-[#1E40AF]'
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={
                          isRecommended ? 'text-slate-200' : 'text-slate-700'
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer ${
                    isRecommended
                      ? 'bg-[#2563EB] text-white hover:bg-blue-500 focus-visible:ring-blue-400 focus-visible:ring-offset-[#0F172A]'
                      : 'bg-[#0F172A] text-white hover:bg-[#1E40AF] focus-visible:ring-[#1E40AF] focus-visible:ring-offset-white'
                  }`}
                >
                  <span>{plan.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
