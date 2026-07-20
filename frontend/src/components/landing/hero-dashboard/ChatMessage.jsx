import { CheckCheck } from "lucide-react";

const ChatMessage = ({ type, isSelf, avatar, name, time, content, reaction, delayClass = "", animate = true }) => {
  return (
    <div className={`chat ${isSelf ? "chat-end" : "chat-start"} ${animate ? 'animate-message-appear' : ''} ${delayClass} opacity-0`}>
      <div className="chat-image avatar">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-sm">
          {avatar ? (
            <img src={avatar} alt={name} />
          ) : (
            <div className="bg-primary flex items-center justify-center text-primary-content text-[10px] sm:text-xs h-full w-full">
              {name.substring(0,2)}
            </div>
          )}
        </div>
      </div>
      <div className="chat-header text-[10px] sm:text-xs opacity-70 mb-1 flex items-center gap-1">
        {!isSelf && <span className="font-bold text-base-content">{name}</span>}
        <time className="text-[9px] sm:text-[10px]">{time}</time>
      </div>
      
      <div className={`chat-bubble relative text-[11px] sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm 
        ${isSelf ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}`}>
        
        {type === "code" ? (
          <div className="font-mono text-[10px] bg-base-300 text-base-content p-2 rounded mt-1 border border-base-content/10">
            <span className="text-secondary">const</span> <span className="text-accent">deploy</span> = <span className="text-info">async</span> () ={'>'} {'{'} <br/>
            &nbsp;&nbsp;await system.upgrade();<br/>
            {'}'};
          </div>
        ) : type === "image" ? (
          <div className="mt-1 rounded overflow-hidden max-w-[120px] sm:max-w-[150px]">
             <div className="bg-base-300 aspect-video flex items-center justify-center">
                <span className="text-[9px] opacity-50">Image.png</span>
             </div>
          </div>
        ) : type === "voice" ? (
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-6 h-6 rounded-full bg-base-content/10 flex items-center justify-center shrink-0">
               <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-base-content border-b-[4px] border-b-transparent ml-0.5"></div>
            </div>
            <div className="flex items-end gap-0.5 h-4">
              {[1, 2, 4, 3, 5, 2, 1, 3, 2, 4, 1].map((bar, i) => (
                <div key={i} className="w-0.5 bg-base-content/40 rounded-full" style={{ height: `${bar * 20}%` }}></div>
              ))}
            </div>
            <span className="text-[9px] ml-1">0:12</span>
          </div>
        ) : (
          content
        )}

        {reaction && (
          <div className="absolute -bottom-3 -right-2 bg-base-100 border border-base-200 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm z-10 animate-bounce-slow">
            {reaction}
          </div>
        )}
      </div>
      
      {isSelf && (
        <div className="chat-footer opacity-70 flex items-center gap-1 mt-1 text-[9px] sm:text-[10px]">
          Delivered <CheckCheck className="w-3 h-3 text-info" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
