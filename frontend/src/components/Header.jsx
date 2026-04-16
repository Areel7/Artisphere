import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  User,
  Heart,
  Palette,
  Image,
  Building2,
  Package,
  LogOut,
  ChevronRight,
  Boxes,
  Sun,
  Moon,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import SignInandSignUp from "../pages/Auth/SignInandSignUp";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "../redux/features/auth/authSlice";
import { useLogoutMutation } from "../redux/api/user";
import { useGetUserCartQuery } from "../redux/api/cart";
import { useTheme } from "../context/ThemeContext.jsx";
import { setArtFilter } from "../redux/features/artwork/artSlice";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");

  // Profile Dropdown State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const { userInfo } = useSelector((state) => state.auth);
  const { artFilter } = useSelector((state) => state.artworks);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  const [logoutApiCall] = useLogoutMutation();
  const { data: cartData } = useGetUserCartQuery(undefined, {
    skip: !userInfo?.token,
  });
  const cartItemCount = cartData?.cartItems?.length || 0;
  const { theme, toggleTheme } = useTheme();

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logOut());
      setIsProfileDropdownOpen(false);
      navigate("/");
    } catch {
      dispatch(logOut());
      setIsProfileDropdownOpen(false);
      navigate("/");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const profileMenuItems = userInfo
    ? [
        { icon: User, label: "My Profile", to: "/profile" },
        userInfo.role === "superadmin" && {
          icon: LayoutDashboard,
          label: "Dashboard",
          to: "/admin",
        },
        { icon: Heart, label: "Favorites", to: "/favorites" },
        { icon: Image, label: "All Artworks", to: "/artworks" },
        { icon: Boxes, label: "3D Gallery", to: "/gallery" },
        userInfo.role === "artist" && {
          icon: Palette,
          label: "Create Artwork",
          to: "/artist/create-artwork",
        },
        userInfo.role === "artist" && {
          icon: Image,
          label: "My Artworks",
          to: "/artist/my-artworks",
        },
        userInfo.role === "curator" && {
          icon: Building2,
          label: "Add Exhibition",
          to: "/curator/select-exhibition-artworks",
        },
        userInfo.role === "curator" && {
          icon: Building2,
          label: "My Exhibitions",
          to: "/curator/my-exhibitions",
        },
        userInfo.role === "curator" && {
          icon: Building2,
          label: "Requests",
          to: "/curator/requests",
        },
      ].filter(Boolean)
    : [];

  return (
    <>
      <SignInandSignUp
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />

      {/* Minimal Chrome Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200/80 dark:border-white/5 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-1.5 cursor-pointer group select-none"
            onClick={() => navigate("/")}
          >
            {/* Stylised A lettermark */}
            <svg
              width="36" height="36" viewBox="0 0 36 36" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110"
            >
              <defs>
                <linearGradient id="aGradH" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
                <linearGradient id="aGradV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
              {/* Left leg */}
              <path d="M5 30L18 5L31 30" stroke="url(#aGradV)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Crossbar */}
              <path d="M10.5 21H25.5" stroke="url(#aGradH)" strokeWidth="2" strokeLinecap="round" />
              {/* Apex dot */}
              <circle cx="18" cy="5" r="2" fill="#d946ef" />
            </svg>

            <span
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-lg font-semibold tracking-[0.15em] uppercase bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-violet-400 bg-clip-text text-transparent"
            >
              rtisphere
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 bg-zinc-900/5 dark:bg-white/5 px-8 py-3 rounded-full border border-zinc-200/70 dark:border-white/5 backdrop-blur-md">
            {[
              { name: "Discovery", path: "/search" },
              { name: "3D Spaces", path: "/gallery" },
              { name: "Artists", path: "/artists" }
            ].map(
              (item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-zinc-900 dark:bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              ),
            )}
            <button
               onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("exhibitions");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate("/");
                  setTimeout(() => {
                    document.getElementById("exhibitions")?.scrollIntoView({ behavior: "smooth" });
                  }, 300);
                }
              }}
              className="text-xs font-semibold uppercase tracking-widest text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white transition-colors relative group"
            >
              Exhibitions
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-zinc-900 dark:bg-white transition-all duration-300 group-hover:w-full" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full p-2.5 border border-zinc-200/90 bg-white/70 text-zinc-800 shadow-sm hover:bg-zinc-100 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            {/* Search: inline input on /search page, icon elsewhere */}
            {isSearchPage ? (
              <div className="relative flex items-center group">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-violet-600/25 to-fuchsia-600/25 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />
                <div className="relative flex items-center gap-2 pl-4 pr-3 py-2 rounded-full bg-zinc-100/80 dark:bg-white/6 border border-zinc-200 dark:border-white/10 backdrop-blur-md min-w-[220px] xl:min-w-[300px] transition-all">
                  <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-white/30 shrink-0 group-focus-within:text-violet-500 transition-colors" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    autoFocus
                    value={artFilter.searchTerm}
                    onChange={(e) => dispatch(setArtFilter({ searchTerm: e.target.value }))}
                    placeholder="Search artworks, artists…"
                    className="flex-1 bg-transparent text-xs text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 outline-none"
                  />
                  {artFilter.searchTerm && (
                    <button
                      onClick={() => dispatch(setArtFilter({ searchTerm: "" }))}
                      className="shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/search")}
                aria-label="Search"
                className="text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => navigate("/cart")}
              className="text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-zinc-900 text-white dark:bg-white dark:text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </button>
            {!userInfo && (
              <Link to="/auth/login">
                <button
                  onClick={() => openAuth("signin")}
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white transition-colors"
                >
                  Sign In
                </button>
              </Link>
            )}

            {userInfo && (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full bg-zinc-200/80 border border-zinc-300 hover:bg-zinc-300/90 dark:bg-white/10 dark:border-white/15 dark:hover:bg-white/20 dark:hover:border-white/30 transition-all duration-200 group"
                >
                  {userInfo.avatar ? (
                    <img
                      src={userInfo.avatar}
                      alt="avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-zinc-700 group-hover:text-zinc-900 dark:text-white/80 dark:group-hover:text-white transition-colors" />
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-zinc-950" />
                </button>

                {/* Profile Dropdown */}
                <div
                  className={`absolute right-0 mt-3 w-64 origin-top-right transition-all duration-200 rounded-2xl border shadow-2xl backdrop-blur-xl border-zinc-200 bg-white/95 text-zinc-900 dark:border-white/10 dark:bg-gradient-to-br dark:from-zinc-900/97 dark:to-zinc-950/99 dark:text-white ${
                    isProfileDropdownOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                  style={{
                    boxShadow:
                      "0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04) inset",
                  }}
                >
                  {/* User Info Header */}
                  <div className="px-4 pt-4 pb-3 border-b border-zinc-200 dark:border-white/6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/25 to-fuchsia-500/25 border border-zinc-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-zinc-600 dark:text-white/70" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                          {userInfo.username || userInfo.name || "Artist"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-white/40 truncate">
                          {userInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 px-2">
                    {profileMenuItems.map(({ icon, label, to }) => {
                      const Icon = icon;
                      return (
                        <Link
                          key={label}
                          to={to}
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/6 transition-all duration-150 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-zinc-200 dark:bg-white/4 dark:group-hover:bg-white/8 flex items-center justify-center transition-colors flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium flex-1">
                            {label}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                        </Link>
                      );
                    })}

                    {/* Divider */}
                    <div className="my-2 border-t border-zinc-200 dark:border-white/6" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600/90 hover:text-red-700 hover:bg-red-500/10 dark:text-red-400/80 dark:hover:text-red-400 dark:hover:bg-red-500/8 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 group-hover:bg-red-500/15 dark:bg-red-500/5 dark:group-hover:bg-red-500/12 flex items-center justify-center transition-colors flex-shrink-0">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium flex-1 text-left">
                        Logout
                      </span>
                    </button>
                  </div>

                  {/* Bottom padding */}
                  <div className="h-1" />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="md:hidden text-zinc-900 dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-zinc-50/98 dark:bg-zinc-950/95 backdrop-blur-xl z-40 transition-transform duration-500 flex flex-col items-center justify-center ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center gap-8 text-2xl font-light text-zinc-800 dark:text-white">
            {[
              { name: "Discovery", path: "/artworks" },
              { name: "Exhibitions", path: "/#exhibitions" },
              { name: "3D Spaces", path: "/gallery" },
              { name: "Artists", path: "/artists" },
              { name: "Cart", path: "/cart" }
            ].map(
            (item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-zinc-500 dark:hover:text-white/60 transition-colors"
              >
                {item.name}
              </a>
            ),
          )}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
            }}
            className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-base font-medium text-zinc-800 hover:bg-zinc-100 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          {userInfo ? (
            <div className="flex flex-col items-center gap-3 text-lg">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-zinc-500 dark:hover:text-white/60 transition-colors"
              >
                My Profile
              </Link>
              {userInfo.role === "superadmin" && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-zinc-500 dark:hover:text-white/60 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-zinc-500 dark:hover:text-white/60 transition-colors"
              >
                Favorites
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-red-600 dark:text-red-400 text-lg"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("signin")}
              className="hover:text-zinc-500 dark:hover:text-white/60 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
