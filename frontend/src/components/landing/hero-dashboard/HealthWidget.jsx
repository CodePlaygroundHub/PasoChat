import { Activity } from "lucide-react";
import AnimatedProgressRing from "./AnimatedProgressRing";

const HealthWidget = () => {
  return (
    <div className="absolute -left-12 bottom-12 bg-base-100/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-success/5 border border-success/20 p-4 w-48 z-30 animate-float hover:scale-105 transition-transform duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-success/10 p-1.5 rounded-lg">
          <Activity className="w-4 h-4 text-success" />
        </div>
        <span className="text-xs font-bold">System Health</span>
      </div>
      
      <div className="flex items-center gap-3">
        <AnimatedProgressRing percentage={99} colorClass="text-success" size={36} strokeWidth={3} />
        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between items-center text-[9px] font-medium text-base-content/70">
            <span>Redis</span>
            <span className="text-success flex items-center gap-1"><span className="w-1 h-1 bg-success rounded-full"></span>OK</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-medium text-base-content/70">
            <span>MongoDB</span>
            <span className="text-success flex items-center gap-1"><span className="w-1 h-1 bg-success rounded-full"></span>OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthWidget;
