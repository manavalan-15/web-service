import { Instagram, MessageCircle } from 'lucide-react';
import {
  AGENCY_CONTACT_CONFIG,
  buildWhatsAppUrl,
  SERVICES,
  ServiceItem,
} from '../data/agencyData';
import { BrandLogo } from './ui/BrandLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onSelectService: (service: ServiceItem) => void;
  onOpenLegal: (docType: 'privacy' | 'terms') => void;
}

export function Footer({
  onNavigate,
  onSelectService,
  onOpenLegal,
}: FooterProps) {
  const quickLinks = [
    { label: 'About Us', id: 'about' },
    { label: 'Our Process', id: 'process' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Industries', id: 'industries' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <footer className="bg-[#0B0E14] text-slate-300 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Logo, Description, Social Media */}
          <div className="lg:col-span-4 space-y-5">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md"
            >
              <BrandLogo variant="light" />
            </a>

            <p className="text-sm leading-[1.7] text-slate-400 max-w-sm">
              We transform innovative ideas into powerful digital solutions
              that help businesses grow, operate smarter and stay ahead in a
              connected world.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href={AGENCY_CONTACT_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-blue-400 transition-colors"
              >
                <Instagram className="w-4 h-4" aria-hidden="true" />
                <span>Instagram</span>
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
              {AGENCY_CONTACT_CONFIG.socials
                .filter(
                  (s) =>
                    s.name !== 'Instagram' &&
                    s.name !== 'GitHub' &&
                    s.name !== 'X / Twitter'
                )
                .map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    {social.name}
                  </a>
                ))}
            </div>
          </div>

          {/* Column 2: All Services */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-bold text-white tracking-tight mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => onSelectService(service)}
                    className="text-left text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {service.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company Links */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-sm font-bold text-white tracking-tight mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.id);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Details & Social Links */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-sm font-bold text-white tracking-tight mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a
                  href={`mailto:${AGENCY_CONTACT_CONFIG.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {AGENCY_CONTACT_CONFIG.email}
                </a>
              </li>
              <li>
                <a
                  href={AGENCY_CONTACT_CONFIG.phoneHref}
                  className="hover:text-white transition-colors"
                >
                  {AGENCY_CONTACT_CONFIG.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>WhatsApp: {AGENCY_CONTACT_CONFIG.whatsappDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={AGENCY_CONTACT_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>{AGENCY_CONTACT_CONFIG.location}</li>
              <li className="pt-1 flex flex-wrap items-center gap-3 text-xs">
                {AGENCY_CONTACT_CONFIG.socials
                  .filter(
                    (s) => s.name !== 'GitHub' && s.name !== 'X / Twitter'
                  )
                  .map((social) => (
                    <a
                      key={`footer-col4-${social.name}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {social.name}
                    </a>
                  ))}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>Copyright © 2026 Qubex Tech Solutions. All Rights Reserved.</p>

          <div className="flex items-center gap-6">
            <a
              href="/admin-dashboard"
              className="hover:text-white transition-colors"
            >
              Admin Dashboard
            </a>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
