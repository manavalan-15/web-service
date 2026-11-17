import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface LegalModalProps {
  docType: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export function LegalModal({ docType, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!docType) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docType, onClose]);

  return (
    <AnimatePresence>
      {docType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
              <div>
                <p className="text-xs font-mono text-[#1E40AF] mb-1">
                  QUBEX TECH SOLUTIONS
                </p>
                <h2
                  id="legal-modal-title"
                  className="font-display text-2xl font-bold text-[#0F172A] tracking-tight"
                >
                  {docType === 'privacy'
                    ? 'Privacy Policy'
                    : 'Terms & Conditions'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close legal notice"
                className="w-10 h-10 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {docType === 'privacy' ? (
              <div className="space-y-4 text-sm leading-[1.7] text-slate-600">
                <p>
                  This Privacy Policy placeholder outlines how QUBEX TECH SOLUTIONS
                  collects, uses, and safeguards contact details submitted
                  through our project enquiry forms.
                </p>
                <p>
                  <strong className="text-[#0F172A]">Information Collected:</strong>{' '}
                  When you submit a project enquiry, we collect your name,
                  email address, optional phone number, company name, and
                  project requirements solely to evaluate and respond to your
                  request.
                </p>
                <p>
                  <strong className="text-[#0F172A]">Data Usage &amp; Retention:</strong>{' '}
                  We do not sell or lease client contact details to third
                  parties. Enquiries are retained only as long as necessary for
                  business correspondence or active project delivery.
                </p>
                <p>
                  <strong className="text-[#0F172A]">Your Rights:</strong> You
                  may request access, correction, or deletion of your submitted
                  contact data at any time via our listed studio email.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-sm leading-[1.7] text-slate-600">
                <p>
                  These Terms &amp; Conditions govern general use of the QUBEX TECH
                  SOLUTIONS website and preliminary project enquiries.
                </p>
                <p>
                  <strong className="text-[#0F172A]">Project Scopes &amp; Estimates:</strong>{' '}
                  Displayed pricing tiers and delivery timelines serve as
                  structural planning references. Final deliverables, rates,
                  and schedules are confirmed in a written Statement of Work
                  agreed upon by both parties.
                </p>
                <p>
                  <strong className="text-[#0F172A]">Intellectual Property:</strong>{' '}
                  All original branding, interface designs, and source code
                  commissioned by a client are governed by the IP ownership
                  clauses specified in the executed project agreement.
                </p>
                <p>
                  <strong className="text-[#0F172A]">Configurable Template Notice:</strong>{' '}
                  Agency contact placeholders and sample testimonials should be
                  updated with verified company legal details prior to public
                  launch.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
