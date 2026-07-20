import { CheckCircle2 } from "lucide-react";
const BenefitsSection = () => {
  const benefits = [
    "Lightning Fast Performance",
    "End-to-end Secure Messaging",
    "Horizontally Scalable Architecture",
    "AI-first Moderation built-in",
    "Modern, Responsive UX",
    "Enterprise Ready out of the box"
  ];

  return (
    <section className="py-24 bg-base-200/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-6">
              Experience the Future of Enterprise Communication
            </h2>
            <p className="text-base-content/70 text-lg mb-8">
              PASO delivers a feature-rich environment that empowers your teams to collaborate efficiently, securely, and seamlessly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-base-content font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            {/* Abstract UI Representation */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-2xl border border-base-200 relative overflow-hidden animate-soft-tilt hover-glow card-anim">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex flex-col gap-4 relative z-10">
                {/* Header Mock */}
                <div className="flex justify-between items-center pb-4 border-b border-base-200">
                  <div className="w-32 h-6 bg-base-200 rounded animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-base-200 rounded-full animate-pulse"></div>
                    <div className="w-8 h-8 bg-base-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Content Mock */}
                <div className="flex gap-4">
                  {/* Sidebar Mock */}
                  <div className="w-1/3 flex flex-col gap-3">
                    <div className="w-full h-10 bg-base-200 rounded-lg animate-pulse"></div>
                    <div className="w-full h-10 bg-base-200 rounded-lg animate-pulse"></div>
                    <div className="w-full h-10 bg-base-200 rounded-lg animate-pulse"></div>
                  </div>
                  
                  {/* Main Area Mock */}
                  <div className="w-2/3 flex flex-col gap-4">
                    <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                      <div className="w-3/4 h-4 bg-primary/30 rounded mb-2"></div>
                      <div className="w-1/2 h-4 bg-primary/20 rounded"></div>
                    </div>
                    <div className="bg-base-200 rounded-xl p-4 self-end w-3/4">
                      <div className="w-full h-4 bg-base-300 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-base-300 rounded"></div>
                    </div>
                    
                    {/* Input Mock */}
                    <div className="w-full h-12 bg-base-200 rounded-full mt-4 flex items-center px-4">
                       <div className="w-1/3 h-4 bg-base-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
