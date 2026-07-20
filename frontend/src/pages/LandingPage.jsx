import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import TechStack from "../components/landing/TechStack";
import FeatureGrid from "../components/landing/FeatureGrid";
import WhyPaso from "../components/landing/WhyPaso";
import HowItWorks from "../components/landing/HowItWorks";
import ArchitecturePreview from "../components/landing/ArchitecturePreview";
import BenefitsSection from "../components/landing/BenefitsSection";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans overflow-x-hidden">
      <LandingNavbar />
      
      <main className="flex-1">
        <HeroSection />
        <TechStack />
        <FeatureGrid />
        <WhyPaso />
        <HowItWorks />
        <ArchitecturePreview />
        <BenefitsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
