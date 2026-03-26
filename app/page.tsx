import { HeroSection } from "@/features/landing/components/HeroSection";
import { EstablishmentCarousel } from "@/features/landing/components/EstablishmentCarousel";
import { HighlightsSection } from "@/features/landing/components/HighlightsSection";
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection";
import { ContactCta } from "@/features/landing/components/ContactCta";

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <EstablishmentCarousel />
      <HighlightsSection />
      <TestimonialsSection />
      <ContactCta />
    </main>
  );
}
