import { useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import {
  ArrowUpRight,
  ChevronDown,
  Instagram,
  Menu,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import { BrandLogo } from './ui/BrandLogo';
import {
  AGENCY_CONTACT_CONFIG,
  buildWhatsAppUrl,
  NAV_LINKS,
  SERVICES,
  ServiceItem,
} from '../data/agencyData';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onSelectService: (service: ServiceItem) => void;
}

export function Navbar({ onNavigate, onSelectService }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-28% 0px -58% 0px',
        threshold: [0.1, 0.25, 0.5],
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    id: string
  ) => {
    e.preventDefault();
    setActiveId(id);
    setMobileOpen(false);
    setServicesMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/92 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_12px_rgba(15,23,42,0.04)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] bg-[#1E40AF] origin-left z-50"
          style={{ scaleX: prefersReducedMotion ? 0 : scaleX }}
          aria-hidden="true"
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-[72px] flex items-center justify-between gap-3">
          {/* Left: Brand Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, 'home')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-md py-1 shrink-0"
            aria-label="QUBEX TECH SOLUTIONS Home"
          >
            <BrandLogo variant="dark" />
          </a>

          {/* Center: Desktop Navigation with interactive Services menu */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center gap-2.5 2xl:gap-4"
          >
            {NAV_LINKS.map((item) => {
              const isActive = activeId === item.id;

              if (item.id === 'services') {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setServicesMenuOpen(true)}
                    onMouseLeave={() => setServicesMenuOpen(false)}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.id)}
                      aria-expanded={servicesMenuOpen}
                      className={`relative inline-flex items-center gap-1 py-2 text-[12.5px] 2xl:text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-sm ${
                        isActive
                          ? 'text-[#0F172A]'
                          : 'text-slate-600 hover:text-[#0F172A]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-150 ${
                          servicesMenuOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                      {isActive && (
                        <motion.span
                          layoutId="navActiveUnderline"
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 34,
                          }}
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E40AF] rounded-full"
                        />
                      )}
                    </a>

                    <AnimatePresence>
                      {servicesMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-0 top-full pt-2 z-50 w-72"
                        >
                          <div className="rounded-xl border border-slate-200 bg-white shadow-xl p-2">
                            {SERVICES.map((svc) => (
                              <button
                                key={svc.id}
                                type="button"
                                onClick={() => {
                                  setServicesMenuOpen(false);
                                  onSelectService(svc);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1E40AF] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                              >
                                <span className="truncate">{svc.title}</span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {svc.number}
                                </span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.id)}
                  className={`relative py-2 text-[12.5px] 2xl:text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] rounded-sm ${
                    isActive
                      ? 'text-[#0F172A]'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="navActiveUnderline"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 34,
                      }}
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E40AF] rounded-full"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right: Call Now + Get a Free Quote CTA + Mobile Menu Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={AGENCY_CONTACT_CONFIG.phoneHref}
              aria-label={`Call ${AGENCY_CONTACT_CONFIG.phoneDisplay}`}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white/90 text-[#0F172A] text-[12.5px] font-semibold whitespace-nowrap shrink-0 hover:border-slate-400 hover:bg-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]"
            >
              <Phone className="w-3.5 h-3.5 text-[#1E40AF]" aria-hidden="true" />
              <span>Call Now</span>
            </a>

            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, 'contact')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F172A] text-white text-[13px] font-semibold whitespace-nowrap shrink-0 hover:bg-[#1E40AF] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
            >
              <span>Get a Free Quote</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="xl:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 bg-white/85 text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] cursor-pointer"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Animated Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-16 z-40 xl:hidden bg-white border-b border-slate-200 shadow-lg max-h-[80vh] overflow-y-auto"
          >
            <nav
              aria-label="Mobile Navigation"
              className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1"
            >
              {NAV_LINKS.map((item, index) => {
                const isActive = activeId === item.id;
                return (
                  <motion.a
                    key={item.id}
                    href={item.href}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.16 }}
                    onClick={(e) => handleLinkClick(e, item.id)}
                    className={`flex items-center justify-between min-h-[44px] px-3 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-[#1E40AF]'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="text-xs font-mono text-[#1E40AF]">
                        Active
                      </span>
                    )}
                  </motion.a>
                );
              })}
              <div className="pt-3 mt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={AGENCY_CONTACT_CONFIG.phoneHref}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 text-[#0F172A] text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#1E40AF]" aria-hidden="true" />
                  <span>Call Now</span>
                </a>
                <a
                  href="#contact"
                  onClick={(e) => handleLinkClick(e, 'contact')}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E40AF] transition-colors"
                >
                  <span>Get a Free Quote</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={AGENCY_CONTACT_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#1E40AF]" aria-hidden="true" />
                  <span>Instagram</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
