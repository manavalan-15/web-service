import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Instagram, MessageCircle, PhoneCall } from 'lucide-react';
import { AGENCY_CONTACT_CONFIG, buildWhatsAppUrl } from '../data/agencyData';

interface CTASectionProps {
  onStartProject: () => void;
  onContactTeam: () => void;
}

export function CTASection({ onStartProject, onContactTeam }: CTASectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl bg-[#0B0E14] text-white px-6 py-14 sm:px-12 sm:py-20 lg:px-16"
        >
          <motion.div
            aria-hidden="true"
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.45, 0.65, 0.45] }
            }
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -top-24 -right-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#2563EB]/35 via-[#1E40AF]/20 to-transparent blur-3xl"
          />
          <motion.div
            aria-hidden="true"
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }
            }
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -bottom-28 -left-16 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-slate-700/40 via-blue-900/20 to-transparent blur-3xl"
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[48px] font-bold leading-[1.1] tracking-[-0.03em] text-white text-balance mb-5">
              Let&apos;s Build Something Extraordinary Together.
            </h2>

            <p className="text-base sm:text-lg leading-[1.65] text-slate-300 max-w-2xl mx-auto mb-9">
              Have a business idea or digital challenge? Let&apos;s turn your
              vision into a powerful digital solution.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={onStartProject}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 rounded-lg bg-[#2563EB] text-white text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-blue-500 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14] cursor-pointer"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-emerald-500/20 hover:border-emerald-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href={AGENCY_CONTACT_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-lg border border-slate-700 bg-white/5 text-white text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-white/10 hover:border-slate-500 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
              >
                <Instagram className="w-4 h-4" aria-hidden="true" />
                <span>Instagram</span>
              </a>

              <button
                type="button"
                onClick={onContactTeam}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-lg border border-slate-700 bg-white/5 text-white text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-white/10 hover:border-slate-500 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14] cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                <span>Contact Our Team</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
