import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import HeroDashboard from "./hero-dashboard/HeroDashboard";

const HeroSection = () => {
  const { authUser } = useAuthStore();

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
              v2.0 is now live
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-base-content mb-6 leading-tight">
              Enterprise-Grade <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI-Powered</span><br />
              Real-Time Communication
            </h1>
            
            <p className="text-lg sm:text-xl text-base-content/70 mb-8 max-w-2xl mx-auto lg:mx-0">
              Production-ready distributed chat platform featuring AI moderation, voice & video calls, real-time messaging, intelligent automation, and enterprise-grade scalability.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {authUser ? (
                <Link to="/chat" className="btn btn-primary btn-lg rounded-full px-8 w-full sm:w-auto">
                  Open Application <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg rounded-full px-8 w-full sm:w-auto">
                    Get Started <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg rounded-full px-8 w-full sm:w-auto">
                    Login
                  </Link>
                </>
              )}
            </div>
            
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-base-content/60 font-medium">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-success" /> End-to-End Secure
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" /> Sub-50ms Latency
              </div>
            </div>
          </div>

          {/* Visual Illustration */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative mt-10 lg:mt-0">
            <HeroDashboard />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
