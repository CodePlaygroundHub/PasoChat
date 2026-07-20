import { Rocket, X } from "lucide-react";

const NotificationToast = () => {
  return (
    <div className="absolute right-[-20px] bottom-24 bg-base-100 rounded-xl shadow-xl shadow-base-content/5 border border-base-200 p-3 w-64 z-50 animate-slide-in-toast hover:scale-[1.02] transition-transform cursor-default">
      <div className="flex gap-3 items-start">
        <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-0.5">
          <Rocket className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-base-content">Deployment Success</h4>
            <span className="text-[9px] text-base-content/50">Just now</span>
          </div>
          <p className="text-[10px] text-base-content/70 mt-1 leading-snug">
            API v2.0 endpoints have been successfully deployed to production.
          </p>
        </div>
        <button className="text-base-content/40 hover:text-base-content mt-0.5">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
