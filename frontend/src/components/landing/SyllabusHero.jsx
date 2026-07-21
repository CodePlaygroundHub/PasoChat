import { ChevronDown } from "lucide-react";


const SyllabusHero = () => {
  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden" 
      aria-label="Hero — Welcome to Paso"
    >
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(116,128,255,0.12) 0%, transparent 70%)' }}
      />
      
      <div className="relative w-full max-w-5xl mx-auto flex items-end justify-center gap-4 md:gap-6 mb-16 h-[340px] md:h-[420px]">
        {/* Left Panel */}
        <div className="relative w-[180px] md:w-[240px] h-[280px] md:h-[360px] bg-base-200/50 backdrop-blur-md rounded-2xl overflow-hidden flex-shrink-0 self-end border border-primary/20 shadow-xl -rotate-3 hover:-rotate-1 hover:-translate-y-4 hover:shadow-[0_0_40px_rgba(116,128,255,0.3)] transition-all duration-500 z-0 hover:z-20 cursor-pointer group">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Team collaborating" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px] saturate-50 group-hover:opacity-50 group-hover:blur-[1px] group-hover:saturate-100 transition-all duration-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-base-300/40 to-base-300/90 group-hover:from-primary/10 transition-colors duration-500"></div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group-hover:translate-y-1 transition-transform duration-500">
            <div className="relative flex items-center justify-center w-14 h-14 bg-base-100/80 rounded-lg border border-primary/30 shadow-lg group-hover:border-primary/60 transition-colors duration-500">
              <span className="text-base-content font-semibold text-sm">12k+</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse border-2 border-base-100 shadow-[0_0_10px_rgba(0,255,0,0.5)]"></div>
            </div>
            <span className="text-[10px] text-primary font-medium tracking-wider uppercase group-hover:text-primary-focus transition-colors duration-500">Active Users</span>
          </div>
        </div>

        {/* Center Panel */}
        <div className="relative w-[260px] md:w-[360px] h-[320px] md:h-[420px] bg-base-200/80 backdrop-blur-lg rounded-2xl overflow-hidden flex-shrink-0 z-10 border border-primary/30 shadow-[0_0_30px_rgba(116,128,255,0.1)] hover:-translate-y-6 hover:shadow-[0_0_60px_rgba(116,128,255,0.4)] transition-all duration-500 cursor-pointer group">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Chat interface on laptop" className="absolute inset-0 w-full h-full object-cover opacity-25 blur-[1px] saturate-50 group-hover:opacity-40 group-hover:blur-0 group-hover:saturate-100 transition-all duration-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-base-300/95 group-hover:from-primary/20 transition-colors duration-500"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center group-hover:-translate-y-2 transition-transform duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 bg-success/10 border border-success/30 shadow-[0_0_15px_rgba(0,255,0,0.1)] group-hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-shadow duration-500">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              <span className="text-[10px] text-success font-medium tracking-widest uppercase">System Online</span>
            </div>
            <h2 className="font-display text-base-content text-xl md:text-2xl font-semibold leading-snug">Connected.</h2>
            <p className="text-primary text-xs mt-1 font-medium group-hover:animate-pulse">Your workspace is ready ↓</p>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end group-hover:translate-y-1 transition-transform duration-500">
            <div>
              <div className="text-base-content text-lg font-display font-semibold group-hover:text-primary transition-colors duration-500">100ms</div>
              <div className="text-base-content/50 text-[10px] uppercase tracking-wider">Avg Latency</div>
            </div>
            <div className="text-right">
              <div className="text-base-content text-lg font-display font-semibold group-hover:text-success transition-colors duration-500">0%</div>
              <div className="text-base-content/50 text-[10px] uppercase tracking-wider">Packet Loss</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="relative w-[180px] md:w-[240px] h-[260px] md:h-[340px] bg-base-200/50 backdrop-blur-md rounded-2xl overflow-hidden flex-shrink-0 self-end border border-secondary/20 shadow-xl rotate-3 hover:rotate-1 hover:-translate-y-4 hover:shadow-[0_0_40px_rgba(255,105,180,0.3)] transition-all duration-500 z-0 hover:z-20 cursor-pointer group">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Person analyzing data" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px] saturate-50 group-hover:opacity-50 group-hover:blur-[1px] group-hover:saturate-100 transition-all duration-500" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-base-300/40 to-base-300/90 group-hover:from-secondary/10 transition-colors duration-500"></div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group-hover:translate-y-1 transition-transform duration-500">
            <div className="relative flex flex-col items-center justify-center w-14 h-14 bg-base-100/80 rounded-full border-2 border-secondary/30 shadow-lg group-hover:border-secondary/60 group-hover:shadow-[0_0_20px_rgba(255,105,180,0.4)] transition-all duration-500">
              <span className="text-base-content font-semibold text-xs">99.9%</span>
            </div>
            <span className="text-[10px] text-secondary font-medium tracking-wider uppercase">Uptime</span>
          </div>
        </div>
      </div>
      
      <div className="relative text-center max-w-4xl mx-auto z-10 mt-12 md:mt-24">
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-base-content font-semibold leading-tight tracking-tight mb-6">
          Next-Gen Chat. Here's <span className="italic font-light opacity-80">Everything</span><br/>
          Your Team Can <span className="relative inline-block bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">Achieve.</span>
        </h1>
        <p className="text-base-content/60 text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed mb-10">
          From real-time WebRTC voice calls to AI-powered moderation, PASO provides the infrastructure you need to connect your global workforce without the clutter.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#comparison" className="btn btn-primary rounded-full px-8 h-14 min-h-14 font-semibold inline-flex items-center gap-2">
            Explore What’s Inside
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </a>
          <a href="#quiz" className="btn btn-outline btn-secondary rounded-full px-8 h-14 min-h-14 font-medium">
            Find My Ideal Setup
          </a>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
        <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
};

export default SyllabusHero;
