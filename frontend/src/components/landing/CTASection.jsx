import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const CTASection = () => {
  const { authUser } = useAuthStore();

  return (
    <section className="py-24 bg-base-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-primary/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto bg-base-200/80 backdrop-blur-sm rounded-3xl p-8 md:p-16 border border-base-300 shadow-xl text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-base-content mb-6">
            Ready to experience enterprise communication?
          </h2>
          <p className="text-lg md:text-xl text-base-content/70 mb-10 max-w-2xl mx-auto">
            Join thousands of developers and teams building the next generation of real-time applications with PASO.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {authUser ? (
              <Link to="/chat" className="btn btn-primary btn-lg rounded-full px-10 w-full sm:w-auto shadow-lg shadow-primary/30">
                Go to Dashboard <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg rounded-full px-10 w-full sm:w-auto shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                  Create Account
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg rounded-full px-10 w-full sm:w-auto hover:bg-base-300">
                  Login
                </Link>
              </>
            )}
          </div>
          
          <p className="mt-8 text-sm text-base-content/50">
            Free forever for small teams. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
