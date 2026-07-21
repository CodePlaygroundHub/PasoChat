import { Network, Database, Layers, ShieldCheck, Code, Settings } from "lucide-react";

const WhyPaso = () => {
  const strengths = [
    {
      icon: <Network className="w-6 h-6 text-primary" />,
      title: "Distributed Architecture",
      description: "Built for resilience. Node.js services handle connections while Redis manages cross-node communication."
    },
    {
      icon: <Database className="w-6 h-6 text-secondary" />,
      title: "Redis Horizontal Scaling",
      description: "Scale seamlessly beyond a single server. Redis Pub/Sub ensures real-time events reach every instance."
    },
    {
      icon: <Layers className="w-6 h-6 text-accent" />,
      title: "Microservice Ready",
      description: "Separation of concerns between the core chat API and the Python-based FastAPI machine learning pipeline."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-success" />,
      title: "Enterprise Security",
      description: "Comprehensive JWT validation, rate limiting, and robust input sanitization protect your platform."
    },
    {
      icon: <Code className="w-6 h-6 text-info" />,
      title: "Developer Experience",
      description: "Clean folder structure, intuitive React patterns, and reusable DaisyUI components accelerate development."
    },
    {
      icon: <Settings className="w-6 h-6 text-warning" />,
      title: "Production Ready",
      description: "Designed with deployment in mind. Integrated monitoring, logging, and environment management."
    }
  ];

  return (
    <section id="why-paso" className="py-24 relative overflow-hidden">
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(ellipse 60% 50% at 0% 50%, rgba(116,128,255,0.05) 0%, transparent 70%)' }}
      />
      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/3">
            <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.25em] block mb-3">
              Engineering Excellence
            </span>
            <h2 className="font-display text-3xl md:text-5xl text-base-content font-semibold leading-tight mb-6">
              Built For <span className="italic font-light opacity-70">Scale.</span>
            </h2>
            <p className="text-base-content/50 text-sm mb-8 leading-relaxed">
              PASO isn't just another chat app. It's a robust, distributed system designed to handle thousands of concurrent connections while maintaining lightning-fast performance and ensuring high availability.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-medium text-sm text-base-content/80">100K+ concurrent users</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-medium text-sm text-base-content/80">AI integrated into message pipeline</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-medium text-sm text-base-content/80">CI/CD ready architecture</span>
              </li>
            </ul>
          </div>

          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {strengths.map((item, index) => (
                <div 
                  key={index} 
                  className={`bg-base-200/50 p-6 rounded-2xl border border-primary/10 hover:border-primary/30 backdrop-blur-sm transition-all duration-300 card-anim ${index % 2 === 0 ? 'animate-soft-tilt-reverse' : 'animate-soft-tilt'}`}
                >
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-base-100/50 border border-base-300 shadow-sm">{item.icon}</div>
                  <h3 className="text-sm font-semibold text-base-content mb-1.5">{item.title}</h3>
                  <p className="text-base-content/50 text-xs leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default WhyPaso;
