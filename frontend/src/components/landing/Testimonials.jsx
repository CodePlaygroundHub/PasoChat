import { Users, ShieldCheck, Headphones } from "lucide-react";

const Testimonials = () => {
  return (
    <section className="py-24 px-4 md:px-8 relative">
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(ellipse 50% 30% at 50% 100%, rgba(116,128,255,0.06) 0%, transparent 70%)' }}
      />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.25em] block mb-3">
            Versatile Infrastructure
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-base-content font-semibold leading-tight">
            One Core. <span className="italic font-light opacity-70">Endless Possibilities.</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Use Case 1 */}
          <div className="rounded-2xl p-6 flex flex-col bg-base-200/50 border border-primary/10 hover:border-primary/30 transition-colors backdrop-blur-sm animate-message-appear [animation-delay:100ms] opacity-0 fill-mode-forwards">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full self-start mb-5 bg-primary/10 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Internal Operations</span>
            </div>
            <p className="text-base-content/70 text-sm leading-relaxed flex-1 mb-6">
              Built for startups and enterprises needing reliable, real-time chat infrastructure. PASO scales effortlessly from 10 to 10,000 concurrent users without requiring complex backend rewrites.
            </p>
            <div className="flex gap-4 mb-5 pb-5 border-b border-primary/10">
              <div>
                <div className="text-base-content font-semibold text-sm">Redis</div>
                <div className="text-base-content/40 text-[10px] uppercase tracking-wider">backed scale</div>
              </div>
              <div>
                <div className="text-base-content font-semibold text-sm">Zero</div>
                <div className="text-base-content/40 text-[10px] uppercase tracking-wider">friction</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-base-300 border border-base-100">
                <Users className="w-5 h-5 text-base-content/70" />
              </div>
              <div>
                <div className="text-base-content font-medium text-sm">Team Collaboration</div>
                <div className="text-base-content/50 text-xs">For modern remote teams</div>
              </div>
            </div>
          </div>

          {/* Use Case 2 */}
          <div className="rounded-2xl p-6 flex flex-col bg-base-200/50 border border-secondary/10 hover:border-secondary/30 transition-colors backdrop-blur-sm animate-message-appear [animation-delay:300ms] opacity-0 fill-mode-forwards mt-0 md:mt-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full self-start mb-5 bg-secondary/10 border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Public Forums</span>
            </div>
            <p className="text-base-content/70 text-sm leading-relaxed flex-1 mb-6">
              Managing large-scale, open communities can be chaotic. PASO's built-in AI moderation tools automatically filter out toxicity, keeping your public channels safe and highly engaging.
            </p>
            <div className="flex gap-4 mb-5 pb-5 border-b border-secondary/10">
              <div>
                <div className="text-base-content font-semibold text-sm">Automated</div>
                <div className="text-base-content/40 text-[10px] uppercase tracking-wider">AI Filtering</div>
              </div>
              <div>
                <div className="text-base-content font-semibold text-sm">High</div>
                <div className="text-base-content/40 text-[10px] uppercase tracking-wider">concurrency</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-base-300 border border-base-100">
                <ShieldCheck className="w-5 h-5 text-base-content/70" />
              </div>
              <div>
                <div className="text-base-content font-medium text-sm">Global Communities</div>
                <div className="text-base-content/50 text-xs">For gamers & open source</div>
              </div>
            </div>
          </div>

          {/* Use Case 3 */}
          <div className="rounded-2xl p-6 flex flex-col bg-base-200/50 border border-accent/10 hover:border-accent/30 transition-colors backdrop-blur-sm animate-message-appear [animation-delay:500ms] opacity-0 fill-mode-forwards mt-0 md:mt-16">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full self-start mb-5 bg-accent/10 border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Client Support</span>
            </div>
            <p className="text-base-content/70 text-sm leading-relaxed flex-1 mb-6">
              Enterprise clients expect instant resolutions. Seamlessly escalate a standard text conversation into a high-quality WebRTC voice call directly within the browser interface.
            </p>
            <div className="flex gap-4 mb-5 pb-5 border-b border-accent/10">
              <div>
                <div className="text-base-content font-semibold text-sm">WebRTC</div>
                <div className="text-base-content/40 text-[10px] uppercase tracking-wider">voice calls</div>
              </div>
              <div>
                <div className="text-base-content font-semibold text-sm">&lt;50ms</div>
                <div className="text-base-content/40 text-[10px] uppercase tracking-wider">audio latency</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-base-300 border border-base-100">
                <Headphones className="w-5 h-5 text-base-content/70" />
              </div>
              <div>
                <div className="text-base-content font-medium text-sm">Customer Success</div>
                <div className="text-base-content/50 text-xs">For premium support lines</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Testimonials;
