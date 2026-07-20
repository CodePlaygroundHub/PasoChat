import { Users, Phone } from "lucide-react";

const OnlineUsersWidget = () => {
  return (
    <div className="absolute -left-6 top-32 bg-base-100/90 backdrop-blur-md rounded-2xl shadow-xl border border-base-200 p-3 w-40 z-20 animate-float-delayed hover:scale-105 transition-transform duration-300">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-bold flex items-center gap-1">
          <Users className="w-3 h-3 text-primary" /> Team
        </div>
        <div className="flex items-center gap-1 text-[9px] text-success font-medium">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span> 12 Online
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          <div className="avatar border-2 border-base-100 rounded-full w-6 h-6"><img src="https://i.pravatar.cc/150?u=1" alt="user" className="rounded-full" /></div>
          <div className="avatar border-2 border-base-100 rounded-full w-6 h-6"><img src="https://i.pravatar.cc/150?u=2" alt="user" className="rounded-full" /></div>
          <div className="avatar border-2 border-base-100 rounded-full w-6 h-6"><img src="https://i.pravatar.cc/150?u=3" alt="user" className="rounded-full" /></div>
          <div className="avatar placeholder border-2 border-base-100 rounded-full w-6 h-6 bg-neutral text-neutral-content flex items-center justify-center text-[8px] font-bold">+9</div>
        </div>
        
        <div className="bg-primary/10 rounded-full p-1.5 animate-pulse-glow">
          <Phone className="w-3 h-3 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default OnlineUsersWidget;
