import { Monitor, Server, Database, Activity, Cpu, ArrowRight } from "lucide-react";

const ArchitecturePreview = () => {
  return (
    <section id="architecture" className="py-24 relative overflow-hidden">
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(116,128,255,0.04) 0%, transparent 70%)' }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.25em] block mb-3">
            System Architecture
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-base-content font-semibold leading-tight mb-4">
            Under The <span className="italic font-light opacity-70">Hood.</span>
          </h2>
          <p className="text-base-content/50 text-sm max-w-lg mx-auto">
            A high-level view of how PASO components interact to deliver a seamless real-time experience.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
            
            {/* Client Tier */}
            <div className="flex flex-col items-center w-full lg:w-1/4 z-10">
              <div className="bg-base-200/50 backdrop-blur-sm w-full p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-colors text-center relative overflow-hidden group animate-soft-tilt card-anim shadow-sm">
                <Monitor className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-sm text-base-content mb-1">Frontend</h3>
                <p className="text-[10px] text-base-content/50 uppercase tracking-wider">React + Vite + Tailwind</p>
                <div className="mt-4 flex flex-col gap-1.5 justify-center items-center">
                  <span className="px-2.5 py-1 rounded-md bg-base-100 border border-base-300 text-[10px] text-base-content/70">Zustand</span>
                  <span className="px-2.5 py-1 rounded-md bg-base-100 border border-base-300 text-[10px] text-base-content/70">Socket.IO Client</span>
                </div>
              </div>
            </div>

            <ArrowRight className="hidden lg:block w-5 h-5 text-base-content/20 flex-shrink-0" />
            <div className="lg:hidden w-px h-8 bg-base-content/10 my-2"></div>

            {/* Application Tier */}
            <div className="flex flex-col gap-4 w-full lg:w-1/3 z-10">
              <div className="bg-base-200/80 backdrop-blur-md w-full p-6 rounded-2xl border border-primary/20 hover:border-primary/40 transition-colors text-center relative overflow-hidden group animate-soft-tilt-reverse card-anim shadow-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                <Server className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-sm text-base-content mb-1">Express API & WebSocket</h3>
                <p className="text-[10px] text-base-content/50 uppercase tracking-wider">Node.js Main Service</p>
                <div className="mt-4 flex flex-col gap-1.5 justify-center items-center">
                  <span className="px-2.5 py-1 rounded-md bg-base-100 border border-base-300 text-[10px] text-base-content/70">REST APIs</span>
                  <span className="px-2.5 py-1 rounded-md bg-base-100 border border-base-300 text-[10px] text-base-content/70">JWT Auth</span>
                </div>
              </div>
            </div>

            <ArrowRight className="hidden lg:block w-5 h-5 text-base-content/20 flex-shrink-0" />
            <div className="lg:hidden w-px h-8 bg-base-content/10 my-2"></div>

            {/* Data & ML Tier */}
            <div className="flex flex-col gap-3 w-full lg:w-1/3 z-10">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full">
                <div className="bg-base-200/50 backdrop-blur-sm w-full p-4 rounded-2xl border border-secondary/10 hover:border-secondary/30 transition-colors text-center animate-soft-tilt card-anim shadow-sm">
                  <Database className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <h3 className="font-semibold text-[13px] text-base-content">MongoDB & Redis</h3>
                  <p className="text-[9px] text-base-content/50 uppercase tracking-wider mt-1">Storage & Pub/Sub</p>
                </div>
                <div className="bg-base-200/50 backdrop-blur-sm w-full p-4 rounded-2xl border border-accent/10 hover:border-accent/30 transition-colors text-center animate-soft-tilt-reverse card-anim shadow-sm">
                  <Cpu className="w-6 h-6 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold text-[13px] text-base-content">FastAPI ML Pipeline</h3>
                  <p className="text-[9px] text-base-content/50 uppercase tracking-wider mt-1">Python AI Service</p>
                </div>
              </div>
            </div>

          </div>
          
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-base-200/50 backdrop-blur-sm border border-primary/10 px-5 py-2.5 rounded-full text-xs text-base-content/70 font-medium shadow-sm">
              <Activity className="w-3.5 h-3.5 text-success animate-pulse" /> External Integrations: Cloudinary (Media), ZegoCloud (WebRTC), Groq (LLM)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitecturePreview;
