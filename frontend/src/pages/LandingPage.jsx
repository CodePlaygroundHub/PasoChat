import { lazy, Suspense } from "react";
import { MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";

const ProductShowcase = lazy(
  () => import("../components/landing/ProductShowcase")
);
const FeaturesSection = lazy(
  () => import("../components/landing/FeaturesSection")
);
const CTASection = lazy(() => import("../components/landing/CTASection"));
const LandingFooter = lazy(
  () => import("../components/landing/LandingFooter")
);

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FAFAFA] text-zinc-950 antialiased selection:bg-zinc-900 selection:text-white dark:bg-[#100F0F] dark:text-zinc-50 dark:selection:bg-zinc-100 dark:selection:text-zinc-950">
        {/* Top Scroll Progress Hairline */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX }}
          className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-zinc-950 dark:bg-zinc-50"
        />

        <LandingNavbar />

        <main className="relative overflow-x-clip">
          {/* Above-the-fold: Eagerly loaded */}
          <HeroSection />

          {/* Below-the-fold: Code-split */}
          <Suspense fallback={<div className="min-h-[40vh]" />}>
            {/* <ProductShowcase /> */}
            <FeaturesSection />
            <CTASection />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <LandingFooter />
        </Suspense>
      </div>
    </MotionConfig>
  );
};

export default LandingPage;