import { Monitor, Server, Database, Activity, Cpu, ArrowRight } from "lucide-react";

const ArchitecturePreview = () => {
  return (
    <section id="architecture" className="py-24 bg-base-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-base-content mb-4">System Architecture</h2>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            A high-level view of how PASO components interact to deliver a seamless real-time experience.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
            
            {/* Client Tier */}
            <div className="flex flex-col items-center w-full lg:w-1/4 z-10">
              <div className="bg-base-200 w-full p-6 rounded-2xl border border-base-300 text-center relative overflow-hidden group animate-soft-tilt hover-glow card-anim">
                <div className="absolute inset-0 bg-primary/5 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Monitor className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-base-content mb-1">Frontend</h3>
                <p className="text-xs text-base-content/60">React + Vite + Tailwind</p>
                <div className="mt-4 flex gap-2 justify-center">
                  <span className="badge badge-sm badge-outline">Zustand</span>
                  <span className="badge badge-sm badge-outline">Socket.IO Client</span>
                </div>
              </div>
            </div>

            <ArrowRight className="hidden lg:block w-8 h-8 text-base-300 flex-shrink-0" />
            <div className="lg:hidden w-1 h-8 bg-base-300 my-2"></div>

            {/* Application Tier */}
            <div className="flex flex-col gap-4 w-full lg:w-1/3 z-10">
              <div className="bg-base-200 w-full p-6 rounded-2xl border border-primary/30 text-center relative overflow-hidden group animate-soft-tilt-reverse hover-glow-reverse card-anim">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                <Server className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-base-content mb-1">Express API & WebSocket</h3>
                <p className="text-xs text-base-content/60">Node.js Main Service</p>
                <div className="mt-4 flex gap-2 justify-center">
                  <span className="badge badge-sm badge-outline">REST APIs</span>
                  <span className="badge badge-sm badge-outline">Auth</span>
                </div>
              </div>
            </div>

            <ArrowRight className="hidden lg:block w-8 h-8 text-base-300 flex-shrink-0" />
            <div className="lg:hidden w-1 h-8 bg-base-300 my-2"></div>

            {/* Data & ML Tier */}
            <div className="flex flex-col gap-4 w-full lg:w-1/3 z-10">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full">
                <div className="bg-base-200 w-full p-5 rounded-2xl border border-base-300 text-center animate-soft-tilt hover-glow-accent card-anim">
                  <Database className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <h3 className="font-bold text-sm text-base-content">MongoDB & Redis</h3>
                  <p className="text-[10px] text-base-content/60">Persistent Storage & Pub/Sub</p>
                </div>
                <div className="bg-base-200 w-full p-5 rounded-2xl border border-base-300 text-center animate-soft-tilt-reverse hover-glow-accent card-anim">
                  <Cpu className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h3 className="font-bold text-sm text-base-content">FastAPI ML Pipeline</h3>
                  <p className="text-[10px] text-base-content/60">Python AI Service</p>
                </div>
              </div>
            </div>

          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full text-sm text-base-content/80 font-medium">
              <Activity className="w-4 h-4 text-success" /> External Integrations: Cloudinary (Media), ZegoCloud (WebRTC), Groq (LLM)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitecturePreview;
