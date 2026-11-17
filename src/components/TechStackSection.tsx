import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  TECH_CATEGORIES,
  TechCategory,
  TECHNOLOGIES,
} from '../data/agencyData';
import { TechLogoMark } from './ui/TechLogoMark';

export function TechStackSection() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<'All' | TechCategory>(
    'All'
  );

  const filteredTechnologies =
    selectedCategory === 'All'
      ? TECHNOLOGIES
      : TECHNOLOGIES.filter((tech) => tech.category === selectedCategory);

  return (
    <section
      id="technologies"
      className="py-20 sm:py-24 lg:py-28 bg-[#F8F9FA] border-b border-slate-200/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div>
            <p className="text-[13px] font-semibold tracking-[0.06em] text-[#1E40AF] mb-3">
              OUR TECHNOLOGY STACK
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.025em] text-[#0F172A] text-balance">
              Powered by the Right Technology.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-md leading-[1.65]">
            Battle-tested frontend, backend, database, and DevOps technologies
            selected for performance, security, and maintainability.
          </p>
        </motion.div>
      </div>

      {/* Part A: Smooth Continuous Horizontal Technology Marquee */}
      <div
        className="relative marquee-container select-none mb-16"
        aria-label="Technology Stack Continuous Showcase"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#F8F9FA] to-transparent z-10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#F8F9FA] to-transparent z-10"
          aria-hidden="true"
        />

        {!prefersReducedMotion && (
          <div className="animate-marquee flex items-center">
            {[0, 1].map((copyIndex) => (
              <div
                key={copyIndex}
                className="flex items-center gap-4 pr-4 shrink-0"
                aria-hidden={copyIndex === 1}
              >
                {TECHNOLOGIES.map((tech) => (
                  <div
                    key={`${copyIndex}-${tech.id}`}
                    className="flex items-center gap-3.5 px-5 py-3.5 rounded-xl border border-slate-200/90 bg-white min-w-[186px] transition-colors duration-150 hover:border-[#1E40AF]/40"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <TechLogoMark id={tech.id} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A] whitespace-nowrap">
                        {tech.name}
                      </div>
                      <div className="text-[11px] text-slate-500 whitespace-nowrap">
                        {tech.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Part B: Category-Based Technology Logo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Interactive Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div
            role="tablist"
            aria-label="Filter technologies by category"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start"
          >
            {(['All', ...TECH_CATEGORIES] as const).map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Showing {filteredTechnologies.length} technologies
          </span>
        </div>

        {/* Technology Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTechnologies.map((tech, index) => (
            <motion.div
              key={tech.id}
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{
                duration: 0.35,
                delay: prefersReducedMotion ? 0 : (index % 5) * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 bg-white transition-all duration-150 hover:border-[#1E40AF]/50 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105">
                <TechLogoMark id={tech.id} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#0F172A] truncate">
                  {tech.name}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {tech.category}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
