import {
  LandingNavbar,
  LandingHero,
  LandingFeatures,
  LandingPricing,
  LandingTestimonials,
  LandingCTA,
  LandingFooter,
} from '@/components/landing';

/** Landing page pública de StockFlow Pro. */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
