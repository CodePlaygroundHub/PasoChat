import { Search, MoreVertical, Paperclip, Send, Smile, Hash, MessageCircle, Bell } from "lucide-react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

const ChatWindow = () => {
  return (
    <div className="absolute inset-0 bg-base-100 rounded-2xl border border-primary/20 flex z-10 shadow-2xl overflow-hidden hover:border-primary/40 transition-colors duration-500">
      
      {/* Mini Sidebar */}
      <div className="hidden sm:flex flex-col w-16 md:w-32 bg-base-200/50 border-r border-base-200">
        <div className="h-14 flex items-center justify-center border-b border-base-200">
          <div className="w-8 h-8 rounded bg-primary text-primary-content flex items-center justify-center font-bold shadow-sm shadow-primary/30">P</div>
        </div>
        <div className="flex-1 py-4 flex flex-col gap-2 px-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-base-300 text-base-content font-medium text-xs cursor-pointer">
            <Hash className="w-3.5 h-3.5 text-base-content/70" />
            <span className="hidden md:inline">engineering</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg text-base-content/60 hover:bg-base-200 font-medium text-xs cursor-pointer transition-colors">
            <Hash className="w-3.5 h-3.5" />
            <span className="hidden md:inline">product</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg text-base-content/60 hover:bg-base-200 font-medium text-xs cursor-pointer transition-colors">
            <Hash className="w-3.5 h-3.5" />
            <span className="hidden md:inline">design</span>
          </div>
          <div className="mt-4 flex items-center gap-2 p-2 rounded-lg text-base-content/60 hover:bg-base-200 font-medium text-xs cursor-pointer transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Direct msgs</span>
          </div>
        </div>
        <div className="h-14 flex items-center justify-center border-t border-base-200 text-base-content/40 hover:text-base-content cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="h-14 border-b border-base-200 flex items-center justify-between px-4 bg-base-200/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="avatar online hidden sm:block">
              <div className="w-8 rounded-full border border-base-300">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="channel" />
              </div>
            </div>
            <div>
              <div className="font-bold text-sm text-base-content flex items-center gap-1">
                <Hash className="w-4 h-4 sm:hidden text-base-content/50" /> engineering-team
              </div>
              <div className="text-[10px] sm:text-xs text-base-content/60 font-medium">12 online • Incident #492</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 text-base-content/60">
            <button className="hover:bg-base-300 p-1.5 rounded-lg transition-colors"><Search className="w-4 h-4" /></button>
            <button className="hover:bg-base-300 p-1.5 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>
        
        {/* Body */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-end gap-2 bg-base-100 relative overflow-hidden">
          
          <ChatMessage 
            type="text" 
            name="Sarah Chen" 
            time="14:02 PM" 
            avatar="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
            content="Deploying hotfix for the WebSocket memory leak to production now. 🚀"
            delayClass="[animation-delay:0ms]"
          />
          
          <ChatMessage 
            type="code" 
            name="David K." 
            time="14:03 PM" 
            avatar="https://i.pravatar.cc/150?u=23"
            delayClass="[animation-delay:400ms]"
            reaction="👀"
          />
          
          <ChatMessage 
            type="text" 
            isSelf={true}
            name="You" 
            time="14:04 PM" 
            content="I'm monitoring the Redis instances. Latency dropped back to normal levels."
            delayClass="[animation-delay:800ms]"
          />
          
          <ChatMessage 
            type="voice" 
            name="Sarah Chen" 
            time="14:06 PM" 
            avatar="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
            delayClass="[animation-delay:1200ms]"
            reaction="✅"
          />

          <div className="mt-1 animate-message-appear [animation-delay:2000ms] opacity-0 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
              <img src="https://i.pravatar.cc/150?u=44" alt="alex" />
            </div>
            <TypingIndicator />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-3 border-t border-base-200 bg-base-100/95 backdrop-blur z-10">
          <div className="bg-base-200 rounded-xl h-10 flex items-center px-3 gap-2 border border-base-300">
            <button className="text-base-content/40 hover:text-primary transition-colors"><Paperclip className="w-4 h-4" /></button>
            <div className="flex-1 text-xs text-base-content/40 font-medium">Message #engineering...</div>
            <button className="text-base-content/40 hover:text-primary transition-colors"><Smile className="w-4 h-4" /></button>
            <button className="bg-primary text-primary-content p-1.5 rounded-lg shadow-sm shadow-primary/20 hover:scale-105 transition-transform"><Send className="w-3 h-3 ml-0.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
