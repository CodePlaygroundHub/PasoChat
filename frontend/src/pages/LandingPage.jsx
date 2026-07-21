import LandingNavbar from "../components/landing/LandingNavbar";
import SyllabusHero from "../components/landing/SyllabusHero";
import FeatureMarquee from "../components/landing/FeatureMarquee";
import WhyPaso from "../components/landing/WhyPaso";
import HowItWorks from "../components/landing/HowItWorks";
import ArchitecturePreview from "../components/landing/ArchitecturePreview";
import ComparisonTable from "../components/landing/ComparisonTable";
import UseCaseQuiz from "../components/landing/UseCaseQuiz";
import Testimonials from "../components/landing/Testimonials";
import SyllabusCTA from "../components/landing/SyllabusCTA";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans overflow-x-hidden">
      {/* Glow Blobs for ambient Syllabus styling */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[700px] h-[700px] bg-primary/5 rounded-full blur-[100px] -top-[200px] -left-[200px]"></div>
        <div className="absolute w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -bottom-[100px] -right-[100px]"></div>
        <div className="absolute w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10">
        <LandingNavbar />
        
        <main className="flex-1">
          <SyllabusHero />
          <FeatureMarquee />
          
          {/* PASO Technical Sections retained from previous layout */}
          <WhyPaso />
          <HowItWorks />
          <ArchitecturePreview />
          
          {/* Syllabus-inspired sections */}
          <ComparisonTable />
          <UseCaseQuiz />
          <Testimonials />
          <SyllabusCTA />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
