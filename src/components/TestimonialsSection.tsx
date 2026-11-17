import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data/agencyData';

export function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === TESTIMONIALS.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section
      id="testimonials"
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
              CLIENT TESTIMONIALS
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-[-0.025em] text-[#0F172A] text-balance">
              What Our Clients Say About Us.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-slate-600 max-w-sm leading-[1.6]">
              Editable sample testimonial cards structured for verified client
              reviews.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-lg border border-slate-200 bg-[#F8F9FA] text-slate-700 flex items-center justify-center hover:bg-white hover:border-slate-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-lg border border-slate-200 bg-[#F8F9FA] text-slate-700 flex items-center justify-center hover:bg-white hover:border-slate-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 3 Cards Grid (highlights active slide on carousel interaction) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, index) => {
            const isHighlighted = index === activeIndex;
            return (
              <motion.article
                key={item.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.45,
                  delay: prefersReducedMotion ? 0 : index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => setActiveIndex(index)}
                className={`group flex flex-col justify-between rounded-2xl border p-6 sm:p-8 transition-all duration-200 cursor-pointer ${
                  isHighlighted
                    ? 'border-[#1E40AF]/40 bg-white shadow-[0_12px_32px_-12px_rgba(30,64,175,0.12)] -translate-y-0.5'
                    : 'border-slate-200 bg-[#F8F9FA] hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <span className="text-xs font-medium text-[#1E40AF]">
                      {item.projectCategory}
                    </span>
                    <Quote
                      className={`w-5 h-5 transition-colors ${
                        isHighlighted
                          ? 'text-[#1E40AF]'
                          : 'text-slate-300 group-hover:text-[#1E40AF]'
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  <blockquote className="text-[15px] leading-[1.7] text-slate-700 mb-6">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="pt-5 border-t border-slate-200">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-full bg-[#0F172A] text-white font-mono text-xs font-semibold flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-[#0F172A] truncate">
                        {item.clientName}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {item.role} · {item.companyName}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-3">
                    {item.outcome}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
