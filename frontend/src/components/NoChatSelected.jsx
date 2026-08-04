import { MessageSquare, Users, Sparkles, ShieldCheck, Lock } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatSelected = () => {
  const { setSelectedUser, users } = useChatStore();

  // Quick helper to select the AI bot if available in users list
  const handleSelectAI = () => {
    const aiUser = users.find((u) => u.isAI || u.fullName?.toLowerCase().includes("ai"));
    if (aiUser) setSelectedUser(aiUser);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 sm:p-12 bg-base-100 relative overflow-hidden select-none">
      
      {/* Background Subtle Grid Accent */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`, 
          backgroundSize: "24px 24px" 
        }} 
      />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Animated Brand Emblem */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-3 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition duration-700"></div>
            
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-base-100 flex items-center justify-center border border-primary/20 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary/40">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              
              <div className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-base-100 border border-base-300 shadow-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-warning animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-2.5">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-base-content">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent">
              PASO
            </span>
          </h2>
          <p className="text-base-content/60 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
            Select a conversation from the sidebar to start messaging friends or collaborating with AI.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-base-200/80">
          <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-base-200/30 border border-base-200 hover:bg-base-200/70 hover:border-primary/30 transition-all duration-200 cursor-default group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-base-content/70">Group Chats</span>
          </div>

          <button
            onClick={handleSelectAI}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-base-200/30 border border-base-200 hover:bg-base-200/70 hover:border-warning/40 transition-all duration-200 group cursor-pointer"
            title="Chat with AI"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-base-content/70">AI Assistant</span>
          </button>

          <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-base-200/30 border border-base-200 hover:bg-base-200/70 hover:border-success/30 transition-all duration-200 cursor-default group">
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center transition-transform group-hover:scale-110">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-base-content/70">Protected</span>
          </div>
        </div>

      </div>

      {/* Security Footer Badge */}
      <div className="absolute bottom-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-200/40 border border-base-300/60 text-base-content/50 hover:text-base-content/80 transition-colors">
        <Lock className="w-3.5 h-3.5 text-success" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          End-to-End Encrypted
        </span>
      </div>

    </div>
  );
};

export default NoChatSelected;