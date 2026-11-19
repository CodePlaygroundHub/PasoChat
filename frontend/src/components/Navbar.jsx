import {
  GitPullRequest,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const GITHUB_URL = "https://github.com/Akash504-ai/Chat-app.git";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { selectedUser, selectedGroup } = useChatStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#100F0F]/90 backdrop-blur-md ${
        selectedUser || selectedGroup ? "hidden md:block" : "block"
      }`}
    >
      <div className="w-full px-4 lg:px-6 h-14 flex items-center justify-between">
        {/* Brand Mark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <MessageSquare className="h-3.5 w-3.5 stroke-[2]" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            PASO
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-1.5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            title="GitHub Repository"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <FaGithub className="h-4 w-4" />
          </a>

          {/* <Link
            to="/contribute"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            <GitPullRequest className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>Contribute</span>
          </Link> */}

          {/* <Link
            to="/settings"
            aria-label="Settings"
            title="Settings"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <Settings className="h-4 w-4 stroke-[1.75]" />
          </Link> */}

          {authUser && (
            <>
              <div className="mx-1.5 h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
                >
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt={authUser.fullName || "User Avatar"}
                    className="h-7 w-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  />
                  <span className="max-w-[120px] truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {authUser.fullName}
                  </span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141313] py-1.5 shadow-lg z-50">
                    <div className="border-b border-zinc-100 dark:border-zinc-800/80 px-3.5 py-2.5">
                      <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {authUser.fullName}
                      </p>
                      <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {authUser.email}
                      </p>
                    </div>

                    <div className="px-1.5 py-1 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-zinc-500" />
                        <span>My Profile</span>
                      </Link>
                      {/* <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
                      >
                        <Settings className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Settings</span>
                      </Link> */}
                    </div>

                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

                    <div className="px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#100F0F] px-4 py-3 space-y-1">
          {authUser && (
            <div className="flex items-center gap-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 mb-2">
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt={authUser.fullName || "User Avatar"}
                className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {authUser.fullName}
                </p>
                <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {authUser.email}
                </p>
              </div>
            </div>
          )}

          <Link
            to="/contribute"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
          >
            <GitPullRequest className="h-3.5 w-3.5 text-zinc-500" />
            <span>Contribute to PASO</span>
          </Link>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
          >
            <FaGithub className="h-3.5 w-3.5 text-zinc-500" />
            <span>GitHub Repository</span>
          </a>

          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-zinc-500" />
            <span>Settings</span>
          </Link>

          {authUser && (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-zinc-500" />
                <span>Profile</span>
              </Link>

              <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;