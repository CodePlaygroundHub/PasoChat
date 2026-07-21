import { useNavigate } from "react-router-dom";

const SyllabusCTA = () => {
  const navigate = useNavigate();

  const handleProvision = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  return (
    <section id="cta-form" className="py-24 px-4 md:px-8 relative overflow-hidden">
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(116,128,255,0.08) 0%, transparent 70%)' }}
      />
      
      <div className="max-w-2xl mx-auto relative">
        <div className="text-center mb-12">
          <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.25em] block mb-3">
            Your First Step
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-base-content font-semibold leading-tight mb-4">
            Provision Your <span className="italic font-light opacity-70">Workspace</span>
          </h2>
          <p className="text-base-content/50 text-sm max-w-md mx-auto">
            Create your admin account. Thirty seconds. A secure chat infrastructure built for your team.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden bg-base-200/70 border border-primary/20 backdrop-blur-xl shadow-2xl">
          {/* Progress Bar top border */}
          <div className="h-1 w-full bg-primary/10">
            <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 transition-all duration-500"></div>
          </div>
          
          <div className="p-8 md:p-10">
            <form onSubmit={handleProvision} className="animate-message-appear">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-xl text-base-content font-semibold">Step 1 of 2</h3>
                <span className="text-base-content/40 text-xs">Admin Details</span>
              </div>
              
              <div className="mb-6">
                <label className="text-base-content/60 text-xs font-medium uppercase tracking-wider block mb-3">
                  Workspace Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Nova Tech Internal" 
                  className="w-full rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-base-100/80 border border-primary/20 text-base-content placeholder-base-content/30"
                  required 
                />
              </div>
              
              <div className="mb-8">
                <label className="text-base-content/60 text-xs font-medium uppercase tracking-wider block mb-3">
                  Admin Email
                </label>
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  className="w-full rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-base-100/80 border border-primary/20 text-base-content placeholder-base-content/30"
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full btn btn-primary rounded-full h-14 font-semibold text-sm transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(116,128,255,0.2)]"
              >
                Continue →
              </button>
            </form>
          </div>
        </div>
        
        <p className="text-center mt-6 text-base-content/40 text-xs">
          Not ready to commit? <a href="#" className="text-primary underline underline-offset-4 hover:text-base-content transition-colors">Read the Documentation</a> and explore the APIs.
        </p>
      </div>
    </section>
  );
};

export default SyllabusCTA;
