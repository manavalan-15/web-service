import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { FAQS } from '../data/agencyData';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReducedMotion = useReducedMotion();

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-20 sm:py-24 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="text-[13px] font-semibold tracking-[0.06em] text-[#1E40AF] mb-3">
            FAQ
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-[-0.025em] text-[#0F172A] text-balance">
            Frequently Asked Questions.
          </h2>
        </motion.div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-button-${item.id}`;

            return (
              <div key={item.id} className="py-1">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(index)}
                    className="w-full min-h-[56px] py-5 flex items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md cursor-pointer group"
                  >
                    <span className="font-display text-base sm:text-lg font-semibold text-[#0F172A] group-hover:text-[#1E40AF] transition-colors">
                      {item.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-[#0F172A] border-[#0F172A] text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 group-hover:border-slate-300'
                      }`}
                      aria-hidden="true"
                    >
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, height: 0 }
                      }
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, height: 0 }
                      }
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-sm sm:text-[15px] leading-[1.7] text-slate-600">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
