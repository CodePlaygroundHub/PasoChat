import { NavLink } from "react-router-dom";
import { FileBarChart, LayoutDashboard, Shield, Users } from "lucide-react";

const AdminSidebar = () => {
  const navItems = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/admin/users",
      label: "Users",
      icon: Users,
    },
    {
      to: "/admin/reports",
      label: "Reports",
      icon: FileBarChart,
    },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white select-none dark:border-zinc-800/80 dark:bg-[#100F0F]">
      {/* Brand Header */}
      <div className="border-b border-zinc-200/80 px-4 py-4 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            <Shield className="h-4 w-4 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              AdminPanel
            </h2>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              Workspace management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        <p className="px-2.5 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "border border-zinc-200/90 bg-zinc-100 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-50"
                    : "border border-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-4 w-4 shrink-0 stroke-[1.75] ${
                      isActive
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;