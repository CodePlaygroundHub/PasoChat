import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
  GitPullRequest, // Added this for the logo
} from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { FaGithub } from "react-icons/fa";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const { selectedUser, selectedGroup } = useChatStore();

  const GITHUB_URL = "https://github.com/Akash504-ai/Chat-app.git";

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-base-300 bg-base-100/80 backdrop-blur 
      ${selectedUser || selectedGroup ? "hidden md:block" : "block"}`}
    >
      <div className="container mx-auto h-16 px-4">
        <div className="flex h-full items-center justify-between">
          <Link
            to={authUser ? "/chat" : "/"}
            className="flex items-center gap-3 text-lg font-semibold hover:opacity-80 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <span className="tracking-tighter">PASO</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm px-2"
              title="View Source"
            >
              <FaGithub className="h-5 w-5" />
            </a>

            <Link
              to="/contribute"
              className="btn btn-ghost btn-sm gap-2 group border border-transparent hover:border-primary/20"
            >
              <GitPullRequest className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
              <span className="group-hover:text-primary transition-colors">
                Contribute
              </span>
            </Link>

            <Link to="/settings" className="btn btn-ghost btn-sm gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>

            {authUser && (
              <>
                <div className="divider divider-horizontal mx-0"></div>
                <Link to="/profile" className="btn btn-ghost btn-sm gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-outline btn-error btn-sm gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden btn btn-ghost btn-sm"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-base-300 bg-base-100 px-4 py-4 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm justify-start gap-3 px-4"
            >
              <FaGithub className="h-4 w-4" />
              GitHub Repository
            </a>

            <Link
              to="/contribute"
              onClick={() => setOpen(false)}
              className="btn btn-ghost btn-sm justify-start gap-3 px-4 text-primary bg-primary/5"
            >
              <GitPullRequest className="h-4 w-4" />
              Contribute to PASO
            </Link>

            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="btn btn-ghost btn-sm justify-start gap-3 px-4"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            {authUser && (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost btn-sm justify-start gap-3 px-4"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="btn btn-error btn-sm justify-start gap-3 px-4 mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
