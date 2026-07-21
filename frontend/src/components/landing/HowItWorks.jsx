import { UserPlus, FolderPlus, MessageSquare, ShieldAlert, LineChart } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-5 h-5 text-primary" />,
    title: "Create Account",
    description: "Sign up in seconds and authenticate securely via JWT."
  },
  {
    icon: <FolderPlus className="w-5 h-5 text-primary" />,
    title: "Create Workspace",
    description: "Set up your environment and invite team members."
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-primary" />,
    title: "Start Messaging",
    description: "Experience real-time, low-latency communication."
  },
  {
    icon: <ShieldAlert className="w-5 h-5 text-primary" />,
    title: "AI Moderation",
    description: "Automatic background checks ensure a safe environment."
  },
  {
    icon: <LineChart className="w-5 h-5 text-primary" />,
    title: "Enterprise Analytics",
    description: "Monitor usage and health through the admin dashboard."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(ellipse 70% 40% at 100% 50%, rgba(116,128,255,0.06) 0%, transparent 70%)' }}
      />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.25em] block mb-3">
            Onboarding Flow
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-base-content font-semibold leading-tight mb-4">
            From Zero to <span className="italic font-light opacity-70">Production.</span>
          </h2>
          <p className="text-base-content/50 text-sm max-w-lg mx-auto">
            Get your team up and running in minutes, not months.
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 transform md:-translate-x-1/2 hidden sm:block"></div>
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className={`relative flex flex-col sm:flex-row items-center group ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                
                {/* Connector Dot */}
                <div className="hidden sm:flex absolute left-8 md:left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-base-100 items-center justify-center border border-primary/20 z-10 shadow-sm group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
                  {step.icon}
                </div>

                {/* Content Card */}
                <div className={`w-full sm:w-1/2 p-4 ${index % 2 === 0 ? 'sm:pr-12 md:pr-16 md:text-right' : 'sm:pl-12 md:pl-16 md:text-left'}`}>
                  <div className={`bg-base-200/50 p-6 rounded-2xl border border-primary/5 hover:border-primary/20 backdrop-blur-sm transition-colors duration-300 card-anim ${index % 2 === 0 ? 'ml-12 sm:ml-0 animate-soft-tilt' : 'ml-12 sm:ml-0 animate-soft-tilt-reverse'}`}>
                    <div className="sm:hidden w-10 h-10 rounded-full bg-base-100 border border-primary/20 flex items-center justify-center mb-4 shadow-sm">
                       {step.icon}
                    </div>
                    <div className="text-primary font-display text-[10px] font-bold tracking-widest uppercase mb-1">Step 0{index + 1}</div>
                    <h3 className="text-lg font-semibold text-base-content mb-2">{step.title}</h3>
                    <p className="text-base-content/50 text-xs leading-relaxed">{step.description}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
