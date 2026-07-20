import { useState, useRef } from "react";
import ChatWindow from "./ChatWindow";
import AIModerationWidget from "./AIModerationWidget";
import HealthWidget from "./HealthWidget";
import OnlineUsersWidget from "./OnlineUsersWidget";
import AnalyticsWidget from "./AnalyticsWidget";
import VoiceCallWidget from "./VoiceCallWidget";
import NotificationToast from "./NotificationToast";
import { MousePointer2 } from "lucide-react";

const HeroDashboard = () => {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt between -5 and 5 degrees
    const xPct = (x / rect.width - 0.5) * 2;
    const yPct = (y / rect.height - 0.5) * 2;
    
    setTilt({
      x: -yPct * 6, // max 6 degrees
      y: xPct * 6
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-square max-w-[580px] mx-auto perspective-1200 h-[500px] sm:h-[600px] flex items-center justify-center"
    >
      
      {/* Background Decorative Mesh / Glows */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[90%] h-[90%] bg-primary/20 rounded-full blur-[100px] animate-spin-slow"></div>
        <div className="absolute w-[70%] h-[70%] bg-secondary/15 rounded-full blur-[80px] animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }}></div>
      </div>

      {/* Main Dashboard Container with Interactive Tilt */}
      <div 
        className="relative w-full h-full max-w-[380px] sm:max-w-[480px] mx-auto transition-transform duration-300 ease-out z-10 flex items-center justify-center"
        style={{ 
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d' 
        }}
      >
        
        {/* Soft gradient edge lighting */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 rounded-2xl blur-md -z-10 transform translate-y-2 scale-[1.02]"></div>
        
        <ChatWindow />
        
        <div style={{ transform: 'translateZ(40px)' }} className="absolute -right-10 top-20 z-30">
          <AIModerationWidget />
        </div>
        
        <div style={{ transform: 'translateZ(60px)' }} className="absolute -left-14 bottom-16 z-30">
          <HealthWidget />
        </div>
        
        <div style={{ transform: 'translateZ(30px)' }} className="absolute -left-8 top-32 z-20">
          <OnlineUsersWidget />
        </div>
        
        <div style={{ transform: 'translateZ(50px)' }} className="absolute left-6 -top-6 z-10">
          <AnalyticsWidget />
        </div>
        
        <div style={{ transform: 'translateZ(70px)' }} className="absolute right-2 -top-4 z-40">
          <VoiceCallWidget />
        </div>
        
        {/* Fake Live Cursor */}
        <div 
          className="absolute z-50 animate-float pointer-events-none drop-shadow-xl" 
          style={{ transform: 'translateZ(100px)', top: '60%', left: '40%', animationDuration: '8s' }}
        >
          <MousePointer2 className="w-5 h-5 text-base-content fill-base-content/50 transform -rotate-12" />
          <div className="bg-primary text-primary-content text-[8px] px-2 py-0.5 rounded-full absolute top-5 left-3 font-medium whitespace-nowrap shadow-sm shadow-primary/20">
            Alex typing...
          </div>
        </div>

      </div>

      {/* Toast is outside the tilt so it slides in cleanly */}
      <NotificationToast />

    </div>
  );
};

export default HeroDashboard;
