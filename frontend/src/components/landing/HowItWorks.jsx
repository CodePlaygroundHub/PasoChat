import { UserPlus, FolderPlus, MessageSquare, ShieldAlert, LineChart } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-6 h-6 text-primary-content" />,
    title: "Create Account",
    description: "Sign up in seconds and authenticate securely via JWT."
  },
  {
    icon: <FolderPlus className="w-6 h-6 text-primary-content" />,
    title: "Create Workspace",
    description: "Set up your environment and invite team members."
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-primary-content" />,
    title: "Start Messaging",
    description: "Experience real-time, low-latency communication."
  },
  {
    icon: <ShieldAlert className="w-6 h-6 text-primary-content" />,
    title: "AI Moderation",
    description: "Automatic background checks ensure a safe environment."
  },
  {
    icon: <LineChart className="w-6 h-6 text-primary-content" />,
    title: "Enterprise Analytics",
    description: "Monitor usage and health through the admin dashboard."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-base-200/30 border-y border-base-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-base-content mb-4">How It Works</h2>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            From sign up to enterprise-scale deployment in minutes.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-primary/20 transform md:-translate-x-1/2 rounded-full hidden sm:block"></div>
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className={`relative flex flex-col sm:flex-row items-center ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                
                {/* Connector Dot */}
                <div className="hidden sm:flex absolute left-8 md:left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-primary items-center justify-center border-4 border-base-100 z-10 shadow-lg shadow-primary/30">
                  {step.icon}
                </div>

                {/* Content Card */}
                <div className={`w-full sm:w-1/2 p-4 ${index % 2 === 0 ? 'sm:pr-12 md:pr-16 md:text-right' : 'sm:pl-12 md:pl-16 md:text-left'}`}>
                  <div className={`bg-base-100 p-6 rounded-2xl border border-base-200 card-anim ${index % 2 === 0 ? 'ml-12 sm:ml-0 animate-soft-tilt hover-glow' : 'ml-12 sm:ml-0 animate-soft-tilt-reverse hover-glow-reverse'}`}>
                    <div className="sm:hidden w-10 h-10 rounded-full bg-primary flex items-center justify-center mb-4">
                       {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-base-content mb-2">{step.title}</h3>
                    <p className="text-base-content/70">{step.description}</p>
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
