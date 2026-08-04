import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

import StatusSidebar from "../components/StatusSidebar";
import StatusViewer from "../components/StatusViewer";
import Navbar from "../components/Navbar"; // 1. Import Navbar here

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();
  const isChatOpen = selectedUser || selectedGroup;

  const [activeTab, setActiveTab] = useState("chats"); // chats | status

  return (
    <div className="flex h-full w-full bg-base-200 overflow-hidden items-center justify-center p-0 md:p-3 lg:p-4">
      <StatusViewer />

      {/* MOBILE LAYOUT (< md) */}
      <div className="flex flex-col h-full w-full md:hidden">
        {/* On mobile, Navbar sits on top when no chat is open */}
        {!isChatOpen && <Navbar />}

        <div className="flex-1 min-h-0">
          {!isChatOpen ? (
            activeTab === "status" ? (
              <StatusSidebar setActiveTab={setActiveTab} />
            ) : (
              <Sidebar setActiveTab={setActiveTab} />
            )
          ) : (
            <ChatContainer />
          )}
        </div>
      </div>

      {/* DESKTOP LAYOUT (>= md) */}
      <div className="hidden md:flex h-full w-full max-w-6xl">
        <div className="flex flex-col h-full w-full bg-base-100 rounded-2xl shadow-xl overflow-hidden border border-base-300">
          
          {/* 2. Embedded Header inside the application container card */}
          <Navbar />

          {/* Main Content Area */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Sidebar Column */}
            <div className="w-[288px] border-r border-base-300 flex-shrink-0">
              {activeTab === "status" ? (
                <StatusSidebar setActiveTab={setActiveTab} />
              ) : (
                <Sidebar setActiveTab={setActiveTab} />
              )}
            </div>

            {/* Chat View Area */}
            <div className="flex-1 overflow-hidden">
              {!isChatOpen ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;