import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES, ServiceItem } from '../data/agencyData';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="py-20 sm:py-24 lg:py-28 bg-[#0B0E14] text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14"
        >
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold tracking-[0.06em] text-blue-400 mb-3">
              OUR SERVICES
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-[-0.025em] text-white text-balance">
              Everything Your Business Needs to Grow Digitally.
            </h2>
          </div>
          <p className="text-sm sm:text-base leading-[1.65] text-slate-300 max-w-md">
            Eight specialized capabilities engineered to take your organization
            from initial concept to scalable digital execution.
          </p>
        </motion.div>

        {/* Eight Image-Based Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((service, index) => (
            <motion.article
              key={service.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.45,
                delay: prefersReducedMotion ? 0 : (index % 4) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group flex flex-col rounded-xl border border-slate-800/90 bg-[#111622] overflow-hidden transition-colors duration-200 hover:border-slate-700 hover:bg-[#151B29]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                <ImageWithFallback
                  src={service.image}
                  alt={service.imageAlt}
                  fallbackTitle={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111622]/75 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>

              <div className="flex flex-col flex-1 p-5 sm:p-6">
                <div className="font-mono text-xs font-medium text-blue-400 tabular-nums mb-2">
                  {service.number}
                </div>

                <h3 className="font-display text-lg font-bold tracking-tight text-white mb-2">
                  {service.title}
                </h3>

                <p className="text-sm leading-[1.6] text-slate-300 mb-4 flex-1">
                  {service.shortDesc}
                </p>

                <div className="text-xs text-slate-400 mb-5 pt-3 border-t border-slate-800/80 leading-relaxed">
                  {service.tags.join(' · ')}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectService(service)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white hover:text-blue-300 transition-colors duration-150 self-start min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-sm cursor-pointer"
                >
                  <span>Explore Service</span>
                  <ArrowUpRight
                    className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
