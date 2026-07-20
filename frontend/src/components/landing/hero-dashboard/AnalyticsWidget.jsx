import { BarChart3, TrendingUp } from "lucide-react";
import MiniChart from "./MiniChart";

const AnalyticsWidget = () => {
  return (
    <div className="absolute left-4 -top-8 bg-base-100/90 backdrop-blur-md rounded-2xl shadow-xl border border-base-200 p-4 w-48 z-10 animate-float hover:scale-105 transition-transform duration-300">
      <div className="flex justify-between items-center mb-2">
        <div className="bg-secondary/10 p-1.5 rounded-lg">
          <BarChart3 className="w-4 h-4 text-secondary" />
        </div>
        <div className="text-[10px] text-success font-medium flex items-center gap-1 bg-success/10 px-1.5 py-0.5 rounded">
          <TrendingUp className="w-2.5 h-2.5" /> +24%
        </div>
      </div>
      
      <div className="mt-2 mb-1 text-xs text-base-content/60 font-medium">Messages Today</div>
      <div className="text-xl font-bold text-base-content mb-3">124,592</div>
      
      <MiniChart colorClass="bg-secondary" />
    </div>
  );
};

export default AnalyticsWidget;
