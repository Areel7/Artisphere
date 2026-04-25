import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Users,
  Image,
  Building2,
  BarChart3,
  Shield,
  ClipboardList,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useLogoutMutation } from "../../redux/api/user";
import { logOut } from "../../redux/features/auth/authSlice";
import { useTheme } from "../../context/ThemeContext.jsx";

const nav = [
  { to: "/admin/dashboard/users", label: "Users", icon: Users },
  { to: "/admin/dashboard/artworks", label: "Artworks", icon: Image },
  { to: "/admin/dashboard/exhibitions", label: "Exhibitions", icon: Building2 },
  { to: "/admin/dashboard/requests", label: "Requests", icon: ClipboardList },
  { to: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart3 },

];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logOut());
      navigate("/");
    } catch {
      dispatch(logOut());
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-zinc-50 dark:bg-zinc-950/40">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col h-auto md:h-full border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-900/70 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 p-6 border-b border-zinc-200 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
              Artisphere
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-white/40">
              Super Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-x-auto md:overflow-y-auto p-4 flex flex-row md:flex-col gap-1.5 scrollbar-hide">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 group",
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-white/10 hidden md:flex md:flex-col gap-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors group"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100" />
                Dark Mode
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600/90 hover:text-red-700 hover:bg-red-50 dark:text-red-400/80 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors group"
          >
            <LogOut className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto relative">
        <div className="absolute inset-0 bg-grid-zinc-900/[0.04] dark:bg-grid-white/[0.02] bg-[length:32px_32px] pointer-events-none" />
        <div className="p-6 md:p-8 max-w-[100rem] mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
