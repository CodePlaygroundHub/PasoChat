import { Network, Database, Layers, ShieldCheck, Code, Settings } from "lucide-react";

const WhyPaso = () => {
  const strengths = [
    {
      icon: <Network className="w-8 h-8 text-primary" />,
      title: "Distributed Architecture",
      description: "Built for resilience. Node.js services handle connections while Redis manages cross-node communication."
    },
    {
      icon: <Database className="w-8 h-8 text-secondary" />,
      title: "Redis Horizontal Scaling",
      description: "Scale seamlessly beyond a single server. Redis Pub/Sub ensures real-time events reach every instance."
    },
    {
      icon: <Layers className="w-8 h-8 text-accent" />,
      title: "Microservice Ready",
      description: "Separation of concerns between the core chat API and the Python-based FastAPI machine learning pipeline."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-success" />,
      title: "Enterprise Security",
      description: "Comprehensive JWT validation, rate limiting, and robust input sanitization protect your platform."
    },
    {
      icon: <Code className="w-8 h-8 text-info" />,
      title: "Developer Experience",
      description: "Clean folder structure, intuitive React patterns, and reusable DaisyUI components accelerate development."
    },
    {
      icon: <Settings className="w-8 h-8 text-warning" />,
      title: "Production Ready",
      description: "Designed with deployment in mind. Integrated monitoring, logging, and environment management."
    }
  ];

  return (
    <section id="why-paso" className="py-24 bg-base-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/3">
            <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-6 leading-tight">
              Engineering <span className="text-primary">Excellence</span>
            </h2>
            <p className="text-base-content/70 text-lg mb-8">
              PASO isn't just another chat app. It's a robust, distributed system designed to handle thousands of concurrent connections while maintaining lightning-fast performance and ensuring high availability.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-medium text-base-content">100K+ concurrent users</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-medium text-base-content">AI integrated into message pipeline</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center text-success">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="font-medium text-base-content">CI/CD ready architecture</span>
              </li>
            </ul>
          </div>

          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {strengths.map((item, index) => (
                <div 
                  key={index} 
                  className={`bg-base-200/50 p-6 rounded-2xl border border-base-200 card-anim ${index % 2 === 0 ? 'animate-soft-tilt-reverse hover-glow-reverse' : 'animate-soft-tilt hover-glow'}`}
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-base-content mb-2">{item.title}</h3>
                  <p className="text-base-content/70 text-sm leading-relaxed">{item.description}</p>
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
