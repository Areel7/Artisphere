import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Users,
  Image,
  Building2,
  BarChart3,
  Shield,
} from "lucide-react";

const nav = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/artworks", label: "Artworks", icon: Image },
  { to: "/admin/exhibitions", label: "Exhibitions", icon: Building2 },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const AdminLayout = () => {
  return (
    <div className="pt-28 pb-16 px-4 md:px-6 max-w-[100rem] mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-12rem)]">
        <aside className="w-full md:w-56 shrink-0">
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 shadow-sm">
            <div className="flex items-center gap-2 px-2 pb-4 mb-4 border-b border-zinc-200 dark:border-white/10">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-white/50">
                  Super Admin
                </p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Control center
                </p>
              </div>
            </div>
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-white/70 dark:hover:bg-white/8",
                    ].join(" ")
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
