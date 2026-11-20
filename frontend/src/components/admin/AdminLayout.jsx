import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useAuthStore } from "../../store/useAuthStore";

const AdminLayout = ({ children }) => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef(null);

  const pathnames = location.pathname.split("/").filter((x) => x);
  const subSegments = pathnames.filter((segment) => segment !== "admin");

  useEffect(() => {
    setAvatarError(false);
  }, [authUser?.profilePic]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const userName = authUser?.fullName || "Admin User";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50/70 dark:bg-[#100F0F]">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-zinc-200/80 bg-white px-4 sm:px-6 lg:px-8 dark:border-zinc-800/80 dark:bg-[#100F0F]">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1.5 text-xs"
          >
            <Link
              to="/admin"
              className="shrink-0 font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Admin
            </Link>

            {subSegments.length === 0 ? (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 stroke-[1.75] text-zinc-400 dark:text-zinc-600" />
                <span className="truncate font-semibold text-zinc-950 dark:text-zinc-50">
                  Overview
                </span>
              </>
            ) : (
              subSegments.map((value, index) => {
                const isLast = index === subSegments.length - 1;
                const to = `/admin/${subSegments.slice(0, index + 1).join("/")}`;

                return (
                  <div key={to} className="flex min-w-0 items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 stroke-[1.75] text-zinc-400 dark:text-zinc-600" />
                    {isLast ? (
                      <span className="truncate font-semibold capitalize text-zinc-950 dark:text-zinc-50">
                        {value}
                      </span>
                    ) : (
                      <Link
                        to={to}
                        className="truncate font-medium capitalize text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        {value}
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </nav>

          {/* Profile Menu */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex h-9 cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200/80 bg-white px-2 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#141313] dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70"
            >
              {authUser?.profilePic && !avatarError ? (
                <img
                  src={authUser.profilePic}
                  alt={userName}
                  onError={() => setAvatarError(true)}
                  className="h-6 w-6 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  {userName.charAt(0).toUpperCase() || (
                    <User className="h-3.5 w-3.5 stroke-[1.75]" />
                  )}
                </span>
              )}

              <div className="hidden min-w-0 md:block">
                <p className="max-w-[140px] truncate text-xs font-medium leading-none text-zinc-900 dark:text-zinc-100">
                  {userName}
                </p>
                <p className="mt-1 text-[10px] font-medium leading-none text-zinc-500 dark:text-zinc-400">
                  Super admin
                </p>
              </div>

              <ChevronDown
                className={`h-3.5 w-3.5 stroke-[1.75] text-zinc-400 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-zinc-200/90 bg-white py-1 shadow-xl dark:border-zinc-800/90 dark:bg-[#141313]"
              >
                <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800/70 md:hidden">
                  <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {userName}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                    Super admin
                  </p>
                </div>

                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900/60 dark:hover:text-white"
                >
                  <User className="h-3.5 w-3.5 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
                  <span>Profile</span>
                </Link>

                {/* <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900/60 dark:hover:text-white"
                >
                  <Settings className="h-3.5 w-3.5 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
                  <span>Settings</span>
                </Link> */}

                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/70" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50/70 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-3.5 w-3.5 stroke-[1.75]" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;