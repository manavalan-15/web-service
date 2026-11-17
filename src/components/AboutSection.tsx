import { motion, useReducedMotion } from 'motion/react';
import { Handshake, ShieldCheck, Sparkles, Target } from 'lucide-react';
import {
  ABOUT_METRICS,
  ABOUT_WORKSPACE_IMAGE,
  WHY_CHOOSE_BENEFITS,
} from '../data/agencyData';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { ImageWithFallback } from './ui/ImageWithFallback';

const BENEFIT_ICONS = {
  Sparkles,
  Target,
  ShieldCheck,
  Handshake,
};

export function AboutSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="about"
      className="py-20 sm:py-24 lg:py-28 bg-white border-t border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Asymmetric Story + Studio Workspace Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch mb-16">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div>
              <p className="text-[13px] font-semibold tracking-[0.06em] text-[#1E40AF] mb-3">
                WHY CHOOSE QUBEX TECH SOLUTIONS
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-[-0.025em] text-[#0F172A] text-balance mb-6">
                Your Vision. Our Technology. One Powerful Partnership.
              </h2>
              <p className="text-base sm:text-[17px] leading-[1.7] text-slate-600 mb-5">
                Qubex Tech Solutions is a modern digital solutions startup
                built with a clear mission: turning complex business challenges
                into reliable, human-centered software and digital platforms.
              </p>
              <p className="text-base leading-[1.7] text-slate-600">
                Our vision is to bridge ambitious business goals with practical
                engineering—helping startups launch faster, small and medium
                businesses automate operations, and enterprises scale with
                dependable architecture.
              </p>
            </div>

            {/* Animated Achievement Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 mt-8 border-t border-slate-200">
              {ABOUT_METRICS.map((metric) => (
                <div key={metric.label}>
                  <div className="font-display text-2xl sm:text-[28px] font-bold text-[#0F172A] tracking-tight">
                    <AnimatedCounter
                      target={metric.target}
                      suffix={metric.suffix}
                    />
                  </div>
                  <div className="text-xs leading-snug text-slate-600 mt-1">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Studio Workspace Visual */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="group relative h-full min-h-[300px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <ImageWithFallback
                src={ABOUT_WORKSPACE_IMAGE}
                alt="Qubex Tech Solutions engineering and design team collaborating in a modern studio"
                fallbackTitle="Qubex Tech Solutions Studio"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs font-mono text-slate-200">
                  Smart Solutions · Better Business
                </p>
                <p className="text-sm sm:text-base font-semibold tracking-tight mt-0.5">
                  Engineered for real business reliability and growth.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Four Benefit Cards: Why Choose Qubex Tech Solutions */}
        <div id="why-choose-qubex" className="scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.06em] text-[#1E40AF] mb-1.5">
                OUR CORE ADVANTAGES
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#0F172A]">
                Why Choose Qubex Tech Solutions
              </h3>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Built around clarity, engineering quality, and ongoing support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_CHOOSE_BENEFITS.map((benefit, index) => {
            const Icon = BENEFIT_ICONS[benefit.iconName];
            return (
              <motion.article
                key={benefit.number}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.45,
                  delay: prefersReducedMotion ? 0 : index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group rounded-xl border border-slate-200 bg-[#F8F9FA] p-6 transition-colors duration-200 hover:bg-white hover:border-slate-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-[#1E40AF] flex items-center justify-center transition-colors duration-200 group-hover:bg-[#1E40AF] group-hover:text-white group-hover:border-[#1E40AF]">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">
                    {benefit.number}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#0F172A] tracking-tight mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-[1.6] text-slate-600">
                  {benefit.description}
                </p>
              </motion.article>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
