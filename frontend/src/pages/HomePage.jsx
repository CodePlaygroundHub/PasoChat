import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

import StatusSidebar from "../components/StatusSidebar";
import StatusViewer from "../components/StatusViewer";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();
  const isChatOpen = selectedUser || selectedGroup;

  const [activeTab, setActiveTab] = useState("chats"); // chats | status

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-50 dark:bg-[#100F0F]">
      <StatusViewer />

      {/* MOBILE LAYOUT (< md) */}
      <div className="flex h-full w-full flex-col md:hidden">
        {!isChatOpen && <Navbar />}

        <div className="flex-1 min-h-0 overflow-hidden">
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

      {/* DESKTOP LAYOUT (>= md) — Clean framed workspace */}
      <div className="hidden md:flex h-full w-full flex-col overflow-hidden p-2 lg:p-3">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-lg border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#100F0F]">
          <Navbar />

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Sidebar Column */}
            <div className="w-72 shrink-0 border-r border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
              {activeTab === "status" ? (
                <StatusSidebar setActiveTab={setActiveTab} />
              ) : (
                <Sidebar setActiveTab={setActiveTab} />
              )}
            </div>

            {/* Chat View Area */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {!isChatOpen ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;