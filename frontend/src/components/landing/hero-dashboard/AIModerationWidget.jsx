import { ShieldCheck, BrainCircuit } from "lucide-react";
import AnimatedProgressRing from "./AnimatedProgressRing";

const AIModerationWidget = () => {
  return (
    <div className="absolute -right-8 top-16 bg-base-100/90 backdrop-blur-md rounded-2xl shadow-2xl shadow-primary/10 border border-primary/20 p-4 w-56 z-30 animate-float-delayed hover:scale-105 transition-transform duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <BrainCircuit className="w-4 h-4 text-primary animate-pulse-glow" />
          </div>
          <span className="text-xs font-bold">AI Moderation</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-success font-medium bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
          <ShieldCheck className="w-3 h-3" /> Safe
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-2">
        <AnimatedProgressRing percentage={98} colorClass="text-primary" size={42} strokeWidth={4} />
        <div>
          <div className="text-[10px] text-base-content/60 font-medium">Confidence Score</div>
          <div className="text-xs font-bold">Analyzing live...</div>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-base-200/50 flex justify-between text-[10px]">
        <span className="text-base-content/50">Latency: 12ms</span>
        <span className="text-primary font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> Active
        </span>
      </div>
    </div>
  );
};

export default AIModerationWidget;
