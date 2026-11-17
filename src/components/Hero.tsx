import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Cpu,
  Globe,
  Layers,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { AGENCY_CONTACT_CONFIG, HERO_HIGHLIGHTS } from '../data/agencyData';

interface HeroProps {
  onNavigate: (sectionId: string) => void;
}

const HEADLINE_WORDS = [
  "Building",
  "Tomorrow's",
  'Digital',
  'Experiences,',
  'Today.',
];

export function Hero({ onNavigate }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-1rem)] flex items-center overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 bg-[#F8F9FA]"
    >
      {/* Subtle architectural dot matrix & animated gradient lighting */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.42]"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />
      <motion.div
        aria-hidden="true"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, 26, -14, 0],
                y: [0, -20, 14, 0],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -top-24 right-[-8%] w-[560px] h-[560px] rounded-full bg-gradient-to-br from-blue-100/75 via-slate-200/40 to-transparent blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, -18, 16, 0],
                y: [0, 18, -14, 0],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -bottom-32 left-[-8%] w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-slate-200/60 via-blue-50/55 to-transparent blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Headline & Proposition */}
          <div className="lg:col-span-6">
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-[13px] font-semibold tracking-[0.06em] text-[#1E40AF] mb-5"
            >
              QUBEX TECH SOLUTIONS · DIGITAL ENGINEERING STUDIO
            </motion.p>

            <h1 className="font-display text-[clamp(2.35rem,4.3vw,3.85rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[#0F172A] text-balance mb-6">
              {HEADLINE_WORDS.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 18 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: prefersReducedMotion ? 0 : 0.08 + index * 0.065,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block mr-[0.26em]"
                >
                  {word === 'Digital' || word === 'Experiences,' ? (
                    <span className="text-[#1E40AF]">{word}</span>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: prefersReducedMotion ? 0 : 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-base sm:text-[17px] leading-[1.68] text-slate-600 max-w-xl mb-8"
            >
              We transform innovative ideas into powerful digital solutions
              that help businesses grow, operate smarter and stay ahead in a
              connected world.
            </motion.p>

            {/* Primary & Secondary CTA Buttons */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: prefersReducedMotion ? 0 : 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-wrap items-center gap-3.5 mb-12"
            >
              <motion.button
                type="button"
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                onClick={() => onNavigate('services')}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 rounded-lg bg-[#0F172A] text-white text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-[#1E40AF] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 cursor-pointer"
              >
                <span>Explore Our Services</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </motion.button>

              <motion.a
                href={AGENCY_CONTACT_CONFIG.phoneHref}
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 rounded-lg bg-white border border-slate-300 text-[#0F172A] text-sm font-semibold whitespace-nowrap shrink-0 hover:border-slate-400 hover:bg-slate-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
              >
                <Phone className="w-4 h-4 text-[#1E40AF]" aria-hidden="true" />
                <span>Call Now</span>
              </motion.a>
            </motion.div>

            {/* Three Company Highlights */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: prefersReducedMotion ? 0 : 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-slate-200/90 max-w-xl"
            >
              {HERO_HIGHLIGHTS.map((item) => (
                <div key={item.title}>
                  <div className="font-display text-sm sm:text-[15px] font-bold text-[#0F172A] tracking-tight">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 leading-snug">
                    {item.detail}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Animated Technology Dashboard + Abstract Isometric 3D Geometry */}
          <div className="lg:col-span-6">
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 20, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.65,
                delay: prefersReducedMotion ? 0 : 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative mx-auto max-w-[560px] lg:max-w-none"
            >
              {/* Subtle Isometric Abstract 3D Architectural Accent Behind Frame */}
              <motion.svg
                viewBox="0 0 180 180"
                className="pointer-events-none hidden sm:block absolute -top-8 -right-6 w-36 h-36 opacity-80 z-0"
                aria-hidden="true"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -8, 0], rotate: [0, 3, 0] }
                }
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <defs>
                  <linearGradient id="isoTop" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                  <linearGradient id="isoLeft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3A8A" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                </defs>
                <polygon points="90,18 152,52 90,86 28,52" fill="url(#isoTop)" opacity="0.24" />
                <polygon points="28,52 90,86 90,152 28,118" fill="url(#isoLeft)" opacity="0.18" />
                <polygon points="152,52 90,86 90,152 152,118" fill="#1E40AF" opacity="0.12" />
                <polyline
                  points="90,18 152,52 152,118 90,152 28,118 28,52 90,18"
                  fill="none"
                  stroke="#2563EB"
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                />
              </motion.svg>

              {/* Main Dashboard Frame */}
              <div className="relative z-10 rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-sm p-4 sm:p-6 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.09)]">
                {/* Website & Product Preview Window */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200/80">
                    <div className="flex items-center gap-1.5" aria-hidden="true">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <Globe className="w-3 h-3 text-[#1E40AF]" aria-hidden="true" />
                      <span>client-platform.qubextech</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      Product Suite
                    </span>
                  </div>

                  <div className="p-5 grid grid-cols-12 gap-4 bg-gradient-to-b from-white to-slate-50/70">
                    {/* Top Inside Bar */}
                    <div className="col-span-12 flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#0F172A] flex items-center justify-center">
                          <Layers className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          Enterprise Growth Platform
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#1E40AF] font-medium">
                        Release Ready
                      </span>
                    </div>

                    {/* Analytics Spline Panel */}
                    <div className="col-span-12 sm:col-span-7 rounded-lg border border-slate-200/90 bg-white p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-[#1E40AF]" aria-hidden="true" />
                          Digital Efficiency
                        </span>
                        <span className="text-xs font-mono font-semibold text-[#0F172A] tabular-nums">
                          +42.0%
                        </span>
                      </div>

                      <svg
                        viewBox="0 0 240 84"
                        className="w-full h-20 overflow-visible"
                        aria-label="Analytics growth curve preview"
                      >
                        <defs>
                          <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="20" x2="240" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="0" y1="45" x2="240" y2="45" stroke="#F1F5F9" strokeWidth="1" />
                        <line x1="0" y1="70" x2="240" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                        <path
                          d="M0 68 C 35 64, 54 50, 85 48 C 118 46, 134 30, 165 26 C 195 22, 212 12, 240 8 L 240 80 L 0 80 Z"
                          fill="url(#heroChartFill)"
                        />
                        <motion.path
                          d="M0 68 C 35 64, 54 50, 85 48 C 118 46, 134 30, 165 26 C 195 22, 212 12, 240 8"
                          fill="none"
                          stroke="#1E40AF"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          initial={prefersReducedMotion ? false : { pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />
                        <circle cx="165" cy="26" r="3.5" fill="#FFFFFF" stroke="#1E40AF" strokeWidth="2" />
                        <circle cx="240" cy="8" r="3.5" fill="#1E40AF" />
                      </svg>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
                        <span>Sprint 1</span>
                        <span>Sprint 2</span>
                        <span>Sprint 3</span>
                        <span>Launch</span>
                      </div>
                    </div>

                    {/* Engineering Pipeline Card */}
                    <div className="col-span-12 sm:col-span-5 rounded-lg border border-slate-200/90 bg-[#0F172A] text-white p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                            System Delivery
                          </span>
                          <span className="text-[11px] font-mono text-blue-300">
                            Verified
                          </span>
                        </div>
                        <div className="space-y-2.5 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                              <span>Frontend &amp; UX</span>
                              <span className="font-mono tabular-nums">100%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                              <motion.div
                                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.9, delay: 0.55 }}
                                className="h-full bg-blue-500 origin-left rounded-full"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                              <span>API &amp; Security</span>
                              <span className="font-mono tabular-nums">96%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                              <motion.div
                                initial={prefersReducedMotion ? false : { scaleX: 0 }}
                                animate={{ scaleX: 0.96 }}
                                transition={{ duration: 0.9, delay: 0.7 }}
                                className="h-full bg-emerald-400 origin-left rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span>Scalable architecture</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating UI Component Strip */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <motion.div
                    animate={
                      prefersReducedMotion ? undefined : { y: [0, -5, 0] }
                    }
                    transition={{
                      duration: 5.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#0F172A]">
                        Security &amp; Performance
                      </div>
                      <div className="text-[11px] text-slate-500">
                        React · Python · Docker
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={
                      prefersReducedMotion ? undefined : { y: [0, 5, 0] }
                    }
                    transition={{
                      duration: 6.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center shrink-0">
                        <Cpu className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0F172A]">
                          Workflow Automation
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Web · Mobile · Cloud
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#1E40AF] tabular-nums">
                      99/100
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
