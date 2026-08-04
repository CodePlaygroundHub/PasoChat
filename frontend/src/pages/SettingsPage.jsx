import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { ArrowLeft, Check, Palette, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just testing out this new theme.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full bg-base-200 overflow-hidden items-center justify-center p-0 md:p-3 lg:p-4">
      <div className="flex flex-col h-full w-full max-w-6xl bg-base-100 md:rounded-2xl shadow-xl overflow-hidden border border-base-300">
        
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 custom-scrollbar">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-base-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
                title="Back to Chats"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-base-content flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Settings & Appearance
                </h1>
                <p className="text-xs text-base-content/60">
                  Customize theme colors and look of your chat interface
                </p>
              </div>
            </div>
          </div>

          {/* Theme Grid Selection */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-base-content">Themes</h2>
              <p className="text-xs text-base-content/60">Choose a color palette for PASO</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {THEMES.map((t) => {
                const isActive = theme === t;

                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`group relative flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all duration-200 text-left ${
                      isActive
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                        : "border-base-300 hover:border-base-content/30 hover:bg-base-200/50"
                    }`}
                  >
                    <div
                      className="h-10 w-full rounded-lg overflow-hidden border border-base-300 shadow-inner mb-2"
                      data-theme={t}
                    >
                      <div className="grid grid-cols-4 gap-px p-1 h-full bg-base-100">
                        <div className="bg-primary rounded-sm"></div>
                        <div className="bg-secondary rounded-sm"></div>
                        <div className="bg-accent rounded-sm"></div>
                        <div className="bg-neutral rounded-sm"></div>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11px] font-semibold truncate capitalize text-base-content/80 group-hover:text-base-content">
                        {t}
                      </span>
                      {isActive && (
                        <span className="p-0.5 rounded-full bg-primary text-primary-content">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Theme Preview Card */}
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-base font-semibold text-base-content">Live Preview</h2>
              <p className="text-xs text-base-content/60">See how messages and controls look in real-time</p>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4 lg:p-6 shadow-inner">
              <div className="mx-auto max-w-lg">
                <div className="rounded-2xl overflow-hidden bg-base-100 shadow-lg border border-base-300">
                  
                  {/* Chat Header Preview */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          J
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-base-100" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">John Doe</p>
                        <p className="text-[11px] text-base-content/60">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Preview Body */}
                  <div className="p-4 space-y-3 bg-base-100 min-h-[200px] flex flex-col justify-end">
                    {PREVIEW_MESSAGES.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`rounded-2xl px-3.5 py-2 max-w-[80%] text-sm shadow-sm ${
                            m.isSent
                              ? "bg-primary text-primary-content rounded-br-none"
                              : "bg-base-200 text-base-content rounded-bl-none"
                          }`}
                        >
                          <p className="leading-relaxed">{m.content}</p>
                          <p className="text-[10px] mt-1 text-right opacity-70">
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Preview Footer */}
                  <div className="border-t border-base-300 p-3 bg-base-100 flex gap-2">
                    <input
                      className="input input-bordered flex-1 h-10 text-sm rounded-xl focus:outline-none"
                      value="This is a preview message..."
                      readOnly
                    />
                    <button className="btn btn-primary h-10 min-h-0 btn-square rounded-xl shadow-sm">
                      <Send size={16} />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;