import { Mic, Video, PhoneOff } from "lucide-react";

const VoiceCallWidget = () => {
  return (
    <div className="absolute right-4 -top-6 bg-base-300/80 backdrop-blur-xl rounded-full shadow-2xl border border-base-content/10 p-2 pr-4 z-40 animate-float-delayed flex items-center gap-3 hover:scale-105 transition-transform duration-300">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 animate-ping opacity-50"></div>
        <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="caller" className="w-8 h-8 rounded-full" />
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-bold">Daily Standup</span>
        <span className="text-[9px] text-primary flex items-center gap-1 font-mono">
          <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span> 14:02
        </span>
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        <div className="w-6 h-6 rounded-full bg-base-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-base-200">
          <Mic className="w-3 h-3 text-base-content" />
        </div>
        <div className="w-6 h-6 rounded-full bg-base-100 flex items-center justify-center shadow-sm cursor-pointer hover:bg-base-200">
          <Video className="w-3 h-3 text-base-content" />
        </div>
        <div className="w-7 h-7 rounded-full bg-error flex items-center justify-center shadow-md cursor-pointer hover:bg-error/90 hover:scale-110 transition-transform">
          <PhoneOff className="w-3.5 h-3.5 text-error-content" />
        </div>
      </div>
    </div>
  );
};

export default VoiceCallWidget;
