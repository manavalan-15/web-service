import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { TechStackSection } from './components/TechStackSection';
import { IndustriesSection } from './components/IndustriesSection';
import { PricingSection } from './components/PricingSection';
import { ProcessSection } from './components/ProcessSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CTASection } from './components/CTASection';
import { ContactSection } from './components/ContactSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ServiceItem } from './data/agencyData';

function isAdminDashboardPath(pathname: string): boolean {
  return pathname.replace(/\/+$/, '') === '/admin-dashboard';
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() =>
    isAdminDashboardPath(window.location.pathname)
  );

  useEffect(() => {
    const onPopState = () => {
      setIsAdminRoute(isAdminDashboardPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.title = isAdminRoute
      ? 'Qubex Tech Solutions · Admin Dashboard'
      : 'Qubex Tech Solutions';
  }, [isAdminRoute]);

  const [selectedServiceModal, setSelectedServiceModal] =
    useState<ServiceItem | null>(null);
  const [legalDocModal, setLegalDocModal] = useState<
    'privacy' | 'terms' | null
  >(null);
  const [preselectedService, setPreselectedService] = useState('');

  const handleNavigate = useCallback((sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleEnquireService = useCallback(
    (serviceTitle: string) => {
      setPreselectedService(serviceTitle);
      handleNavigate('contact');
    },
    [handleNavigate]
  );

  const handleSelectPricingPlan = useCallback(() => {
    handleNavigate('contact');
    setTimeout(() => {
      const nameInput = document.getElementById('enquiry-full-name');
      nameInput?.focus({ preventScroll: true });
    }, 550);
  }, [handleNavigate]);

  const handleStartProjectFocus = useCallback(() => {
    handleNavigate('contact');
    setTimeout(() => {
      const nameInput = document.getElementById('enquiry-full-name');
      nameInput?.focus({ preventScroll: true });
    }, 550);
  }, [handleNavigate]);

  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#0F172A]">
        {/* 01. Navigation */}
        <Navbar
          onNavigate={handleNavigate}
          onSelectService={setSelectedServiceModal}
        />

        <main className="flex-1">
          {/* 02. Hero Section */}
          <Hero onNavigate={handleNavigate} />
          {/* 03. Why Choose Us */}
          <AboutSection />
          {/* 04. Services */}
          <ServicesSection onSelectService={setSelectedServiceModal} />
          {/* 05. Technologies */}
          <TechStackSection />
          {/* 06. Industries */}
          <IndustriesSection />
          {/* 07. Pricing */}
          <PricingSection onSelectPlan={handleSelectPricingPlan} />
          {/* 08. Development Process */}
          <ProcessSection />
          {/* 09. Testimonials */}
          <TestimonialsSection />
          {/* 10. Call To Action */}
          <CTASection
            onStartProject={handleStartProjectFocus}
            onContactTeam={() => handleNavigate('contact-details')}
          />
          {/* 11. Contact */}
          <ContactSection preselectedService={preselectedService} />
          {/* 12a. FAQ */}
          <FAQSection />
        </main>

        {/* 12b. Footer */}
        <Footer
          onNavigate={handleNavigate}
          onSelectService={setSelectedServiceModal}
          onOpenLegal={setLegalDocModal}
        />

        <ServiceDetailModal
          service={selectedServiceModal}
          onClose={() => setSelectedServiceModal(null)}
          onEnquireService={handleEnquireService}
        />

        <LegalModal
          docType={legalDocModal}
          onClose={() => setLegalDocModal(null)}
        />
      </div>
    </MotionConfig>
  );
}
