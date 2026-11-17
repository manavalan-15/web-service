import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import { PROCESS_STEPS } from '../data/agencyData';

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 65%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <section
      id="process"
      ref={containerRef}
      className="py-20 sm:py-24 lg:py-28 bg-[#0B0E14] text-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16"
        >
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold tracking-[0.06em] text-blue-400 mb-3">
              OUR PROCESS
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-[-0.025em] text-white text-balance">
              From Concept to Reality, Step by Step.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-300 max-w-md leading-[1.65]">
            A structured seven-step development lifecycle built to keep scope
            transparent, milestones on track, and quality verified.
          </p>
        </motion.div>

        {/* Desktop Connected Progression Timeline */}
        <div className="hidden lg:block relative">
          <div className="relative mb-10">
            <div
              className="absolute top-6 left-[12%] right-[12%] h-[2px] bg-slate-800"
              aria-hidden="true"
            >
              <motion.div
                className="h-full bg-blue-500 origin-left"
                style={{
                  scaleX: prefersReducedMotion ? 1 : smoothProgress,
                }}
              />
            </div>

            <div className="grid grid-cols-4 gap-5 relative z-10">
              {PROCESS_STEPS.slice(0, 4).map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 18 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.45,
                    delay: prefersReducedMotion ? 0 : index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#111622] border border-blue-500/40 text-blue-400 font-mono text-sm font-semibold flex items-center justify-center mb-6 tabular-nums shadow-sm">
                    {step.number}
                  </div>
                  <div className="rounded-xl border border-slate-800/90 bg-[#111622] p-6 flex-1 hover:border-slate-700 transition-colors">
                    <h3 className="font-display text-lg font-bold text-white tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-[1.6] text-slate-300 mb-4">
                      {step.description}
                    </p>
                    <div className="text-xs font-mono text-slate-400 pt-3 border-t border-slate-800/80">
                      {step.output}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative pt-4">
            <div
              className="absolute top-10 left-[16%] right-[16%] h-[2px] bg-slate-800"
              aria-hidden="true"
            >
              <motion.div
                className="h-full bg-blue-500 origin-left"
                style={{
                  scaleX: prefersReducedMotion ? 1 : smoothProgress,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-5 max-w-5xl mx-auto relative z-10">
              {PROCESS_STEPS.slice(4).map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 18 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.45,
                    delay: prefersReducedMotion ? 0 : (index + 4) * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#111622] border border-blue-500/40 text-blue-400 font-mono text-sm font-semibold flex items-center justify-center mb-6 tabular-nums shadow-sm">
                    {step.number}
                  </div>
                  <div className="rounded-xl border border-slate-800/90 bg-[#111622] p-6 flex-1 hover:border-slate-700 transition-colors">
                    <h3 className="font-display text-lg font-bold text-white tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-[1.6] text-slate-300 mb-4">
                      {step.description}
                    </p>
                    <div className="text-xs font-mono text-slate-400 pt-3 border-t border-slate-800/80">
                      {step.output}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Vertical Timeline */}
        <div className="lg:hidden relative pl-10">
          <div
            className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-800"
            aria-hidden="true"
          >
            <motion.div
              className="w-full h-full bg-blue-500 origin-top"
              style={{
                scaleY: prefersReducedMotion ? 1 : smoothProgress,
              }}
            />
          </div>

          <div className="space-y-6">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.4,
                  delay: prefersReducedMotion ? 0 : index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                <div className="absolute -left-10 top-4 w-10 h-10 rounded-lg bg-[#111622] border border-blue-500/50 text-blue-400 font-mono text-xs font-semibold flex items-center justify-center tabular-nums">
                  {step.number}
                </div>

                <div className="rounded-xl border border-slate-800/90 bg-[#111622] p-5">
                  <h3 className="font-display text-lg font-bold text-white tracking-tight mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-[1.6] text-slate-300 mb-3">
                    {step.description}
                  </p>
                  <div className="text-xs font-mono text-slate-400 pt-2.5 border-t border-slate-800/80">
                    {step.output}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
