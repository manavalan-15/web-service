import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, X } from 'lucide-react';
import { ServiceItem } from '../data/agencyData';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onEnquireService: (serviceTitle: string) => void;
}

export function ServiceDetailModal({
  service,
  onClose,
  onEnquireService,
}: ServiceDetailModalProps) {
  useEffect(() => {
    if (!service) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [service, onClose]);

  return (
    <AnimatePresence>
      {service && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="relative aspect-[16/8] w-full bg-slate-100 shrink-0 overflow-hidden">
              <ImageWithFallback
                src={service.image}
                alt={service.imageAlt}
                fallbackTitle={service.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close service details"
                className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-white/95 text-slate-900 flex items-center justify-center shadow-sm hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-mono text-[#1E40AF] mb-2">
                <span>{service.number}</span>
                <span aria-hidden="true">/</span>
                <span>{service.tags.join(' · ')}</span>
              </div>

              <h3
                id="service-modal-title"
                className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-3"
              >
                {service.title}
              </h3>

              <p className="text-sm sm:text-base leading-[1.65] text-slate-600 mb-6">
                {service.fullDesc}
              </p>

              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 mb-3">
                  Core Deliverables
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {service.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <Check
                        className="w-4 h-4 text-[#1E40AF] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Ideal for: </span>
                  {service.idealFor}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onEnquireService(service.title);
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold whitespace-nowrap shrink-0 hover:bg-[#1E40AF] transition-colors cursor-pointer"
                >
                  <span>Enquire Now</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
