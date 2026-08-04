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
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const { selectedUser, selectedGroup } = useChatStore();

  const GITHUB_URL = "https://github.com/Akash504-ai/Chat-app.git";

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-base-300 bg-base-100/80 backdrop-blur ${
        selectedUser || selectedGroup ? "hidden md:block" : "block"
      }`}
    >
      {/* Reduced px-4 to px-6/px-8 and matched height cleanly */}
      <div className="w-full px-4 lg:px-6 h-16">
        <div className="flex h-full items-center justify-between">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="group flex items-center gap-3 text-lg font-bold tracking-tight text-base-content hover:opacity-90 transition-all"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            </div>
            <span className="text-xl font-extrabold tracking-tight">PASO</span>
          </Link>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content"
              title="GitHub Repository"
            >
              <FaGithub className="h-5 w-5" />
            </a>

            <Link
              to="/contribute"
              className="btn btn-ghost btn-sm gap-2 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-primary-content transition-all duration-200 border border-primary/20"
            >
              <GitPullRequest className="h-4 w-4" />
              <span>Contribute</span>
            </Link>

            <Link
              to="/settings"
              className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>

            {authUser && (
              <>
                <div className="h-5 w-[1px] bg-base-300 mx-1"></div>

                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar border border-base-300 hover:border-primary/50 transition-all"
                  >
                    <div className="w-9 rounded-full">
                      <img
                        src={authUser.profilePic || "/avatar.png"}
                        alt={authUser.fullName || "User Avatar"}
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-2xl w-56 border border-base-200 space-y-1"
                  >
                    <li className="menu-title px-3 py-2 border-b border-base-200 mb-1">
                      <p className="font-semibold text-base-content text-sm truncate">
                        {authUser.fullName}
                      </p>
                      <p className="text-xs text-base-content/50 font-normal truncate">
                        {authUser.email}
                      </p>
                    </li>
                    <li>
                      <Link to="/profile" className="py-2 rounded-xl">
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="py-2 rounded-xl">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </li>
                    <div className="divider my-1"></div>
                    <li>
                      <button
                        onClick={logout}
                        className="py-2 rounded-xl text-error font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden btn btn-ghost btn-sm btn-circle"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-t border-base-300 bg-base-100 px-4 py-4 space-y-2">
          {authUser && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50 mb-2">
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt={authUser.fullName}
                className="h-9 w-9 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-base-content truncate">
                  {authUser.fullName}
                </p>
                <p className="text-xs text-base-content/50 truncate">
                  {authUser.email}
                </p>
              </div>
            </div>
          )}

          <Link
            to="/contribute"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm"
          >
            <GitPullRequest className="h-4 w-4" />
            <span>Contribute to PASO</span>
          </Link>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium hover:bg-base-200"
          >
            <FaGithub className="h-4 w-4" />
            <span>GitHub Repository</span>
          </a>

          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium hover:bg-base-200"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>

          {authUser && (
            <>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl text-sm font-medium hover:bg-base-200"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 p-2.5 rounded-xl text-error bg-error/10 text-sm font-semibold mt-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;