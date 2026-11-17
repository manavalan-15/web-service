import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
} from 'lucide-react';
import {
  AGENCY_CONTACT_CONFIG,
  buildWhatsAppUrl,
  SERVICES,
} from '../data/agencyData';
import {
  EnquiryApiError,
  EnquirySubmissionResult,
  ProjectEnquiryPayload,
  submitProjectEnquiry,
  validateEnquiryForm,
} from '../utils/enquiryService';

interface ContactSectionProps {
  preselectedService: string;
}

const INITIAL_FORM: ProjectEnquiryPayload = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  serviceRequired: '',
};

function formatDisplayDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function ContactSection({ preselectedService }: ContactSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState<ProjectEnquiryPayload>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectEnquiryPayload, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<EnquirySubmissionResult | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({ ...prev, serviceRequired: preselectedService }));
      setErrors((prev) => ({ ...prev, serviceRequired: undefined }));
    }
  }, [preselectedService]);

  const handleChange = (
    field: keyof ProjectEnquiryPayload,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(AGENCY_CONTACT_CONFIG.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateEnquiryForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitProjectEnquiry(formData);
      setSubmissionResult(result);
      setErrors({});
    } catch (err) {
      if (err instanceof EnquiryApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
      }
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to submit your enquiry right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSubmitError(null);
    setSubmissionResult(null);
  };

  const whatsappSummaryMessage = `Hello Qubex Tech Solutions, I just submitted an enquiry${
    submissionResult ? ` (${submissionResult.referenceId})` : ''
  }. Name: ${formData.fullName || '[Name]'}, Service: ${
    formData.serviceRequired || '[Service]'
  }.`;

  return (
    <section
      id="contact"
      className="py-20 sm:py-24 lg:py-28 bg-[#F8F9FA] border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-14"
        >
          <p className="text-[13px] font-semibold tracking-[0.06em] text-[#1E40AF] mb-3">
            GET IN TOUCH
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-[-0.025em] text-[#0F172A] text-balance">
            Let&apos;s Start a Conversation.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Configurable Contact Details */}
          <motion.div
            id="contact-details"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0F172A] tracking-tight mb-1">
                  Contact Information
                </h3>
                <p className="text-sm text-slate-600">
                  Reach our team directly by email, phone, or WhatsApp during
                  business hours.
                </p>
              </div>

              <div className="space-y-5 pt-2 border-t border-slate-100">
                {/* Email */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-500">
                        Email
                      </div>
                      <a
                        href={`mailto:${AGENCY_CONTACT_CONFIG.email}`}
                        className="text-sm font-semibold text-[#0F172A] hover:text-[#1E40AF] transition-colors break-words"
                      >
                        {AGENCY_CONTACT_CONFIG.email}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    aria-label="Copy email address"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:text-[#0F172A] hover:border-slate-300 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check
                          className="w-3.5 h-3.5 text-emerald-600"
                          aria-hidden="true"
                        />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Phone
                    </div>
                    <a
                      href={AGENCY_CONTACT_CONFIG.phoneHref}
                      className="text-sm font-semibold text-[#0F172A] hover:text-[#1E40AF] transition-colors"
                    >
                      {AGENCY_CONTACT_CONFIG.phoneDisplay}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      WhatsApp
                    </div>
                    <a
                      href={buildWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#0F172A] hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{AGENCY_CONTACT_CONFIG.whatsappDisplay} · Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Instagram
                    </div>
                    <a
                      href={AGENCY_CONTACT_CONFIG.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#0F172A] hover:text-[#1E40AF] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Follow Qubex Tech Solutions on Instagram</span>
                    </a>
                  </div>
                </div>

                {/* Office Location */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Office Location
                    </div>
                    <div className="text-sm font-semibold text-[#0F172A]">
                      {AGENCY_CONTACT_CONFIG.location}
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 text-[#1E40AF] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      Business Hours
                    </div>
                    <div className="text-sm font-semibold text-[#0F172A]">
                      {AGENCY_CONTACT_CONFIG.businessHours}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Social & Messaging Actions */}
              <div className="pt-5 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>WhatsApp Chat</span>
                  </a>
                  <a
                    href={AGENCY_CONTACT_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-[#1E40AF]" aria-hidden="true" />
                    <span>Instagram</span>
                  </a>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">
                    Social Channels
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {AGENCY_CONTACT_CONFIG.socials.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-slate-700 hover:text-[#1E40AF] transition-colors underline-offset-4 hover:underline"
                      >
                        {social.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Validated Backend-Persisted Enquiry Form */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
              {submissionResult ? (
                <div
                  className="py-6 text-center sm:text-left"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-5 mx-auto sm:mx-0">
                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="text-xs font-mono text-emerald-700 font-semibold mb-1.5 tabular-nums">
                    Reference · {submissionResult.referenceId}
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#0F172A] tracking-tight mb-3">
                    Project Enquiry Received
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-[1.65] mb-6 max-w-xl">
                    {submissionResult.message}
                  </p>

                  <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4 mb-6 text-left text-xs text-slate-600 space-y-1.5">
                    <div>
                      <span className="font-semibold text-slate-900">Name: </span>
                      {formData.fullName}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Service: </span>
                      {formData.serviceRequired}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">
                        Submitted:{' '}
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatDisplayDateTime(submissionResult.submittedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={buildWhatsAppUrl(whatsappSummaryMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E40AF] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      <span>Continue via WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {submitError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                      <AlertCircle
                        className="w-4 h-4 text-red-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="enquiry-full-name"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="enquiry-full-name"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          handleChange('fullName', e.target.value)
                        }
                        placeholder="Alex Morgan"
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={
                          errors.fullName ? 'error-full-name' : undefined
                        }
                        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                          errors.fullName
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:border-[#1E40AF] focus:ring-blue-100'
                        }`}
                      />
                      {errors.fullName && (
                        <p
                          id="error-full-name"
                          className="text-xs text-red-600 mt-1.5"
                        >
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-email"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="enquiry-email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="alex@company.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? 'error-email' : undefined
                        }
                        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                          errors.email
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:border-[#1E40AF] focus:ring-blue-100'
                        }`}
                      />
                      {errors.email && (
                        <p
                          id="error-email"
                          className="text-xs text-red-600 mt-1.5"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-phone"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="enquiry-phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={
                          errors.phone ? 'error-phone' : undefined
                        }
                        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                          errors.phone
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:border-[#1E40AF] focus:ring-blue-100'
                        }`}
                      />
                      {errors.phone && (
                        <p
                          id="error-phone"
                          className="text-xs text-red-600 mt-1.5"
                        >
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-company"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Company Name
                      </label>
                      <input
                        id="enquiry-company"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={(e) =>
                          handleChange('companyName', e.target.value)
                        }
                        placeholder="Your Organization"
                        aria-invalid={Boolean(errors.companyName)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-blue-100 transition-colors"
                      />
                      {errors.companyName && (
                        <p className="text-xs text-red-600 mt-1.5">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="enquiry-service"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Service Required <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="enquiry-service"
                        name="serviceRequired"
                        required
                        value={formData.serviceRequired}
                        onChange={(e) =>
                          handleChange('serviceRequired', e.target.value)
                        }
                        aria-invalid={Boolean(errors.serviceRequired)}
                        aria-describedby={
                          errors.serviceRequired ? 'error-service' : undefined
                        }
                        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border bg-white text-sm text-[#0F172A] focus:outline-none focus:ring-2 transition-colors ${
                          errors.serviceRequired
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:border-[#1E40AF] focus:ring-blue-100'
                        }`}
                      >
                        <option value="">Select a service...</option>
                        {SERVICES.map((svc) => (
                          <option key={svc.id} value={svc.title}>
                            {svc.title}
                          </option>
                        ))}
                        <option value="Multiple Services / Consultation">
                          Multiple Services / Consultation
                        </option>
                      </select>
                      {errors.serviceRequired && (
                        <p
                          id="error-service"
                          className="text-xs text-red-600 mt-1.5"
                        >
                          {errors.serviceRequired}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarClock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>
                      Submission date and time will be recorded automatically when you submit.
                    </span>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 min-h-[46px] px-7 py-3 rounded-lg bg-[#0F172A] text-white text-sm font-semibold whitespace-nowrap hover:bg-[#1E40AF] disabled:opacity-70 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            className="w-4 h-4 animate-spin"
                            aria-hidden="true"
                          />
                          <span>Sending Enquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Project Enquiry</span>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>

                    <a
                      href={buildWhatsAppUrl(whatsappSummaryMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#1E40AF] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" aria-hidden="true" />
                      <span>Or chat via WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
