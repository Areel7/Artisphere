import React, { useState, useEffect, useRef } from "react";
import {
  Box,
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
} from "lucide-react";
import SignInandSignUp from "../pages/Auth/SignInandSignUp";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "../redux/features/auth/authSlice";
import { useLogoutMutation } from "../redux/api/user";
import { useGetUserCartQuery } from "../redux/api/cart";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");

  // Profile Dropdown State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const { data: cartData } = useGetUserCartQuery();
  const cartItemCount = cartData?.cartItems?.length || 0;

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
          label: "Create Exhibition",
          to: "/curator/create-exhibition",
        },
        userInfo.role === "curator" && {
          icon: Building2,
          label: "My Exhibitions",
          to: "/curator/my-exhibitions",
        },
        { icon: Package, label: "My Orders", to: "/order-detail" },
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
            ? "bg-zinc-950/80 backdrop-blur-lg border-b border-white/5 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <Box
              onClick={() => navigate("/")}
              className="w-7 h-7 text-white group-hover:rotate-180 transition-transform duration-700"
            />
            <span className="text-xl font-bold tracking-widest uppercase">
              Artisphere
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 bg-white/5 px-8 py-3 rounded-full border border-white/5 backdrop-blur-md">
            {["Discovery", "Exhibitions", "3D Spaces", "Artists"].map(
              (item) => (
                <Link
                  key={item}
                  to={`/gallery`}
                  className="text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              ),
            )}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button className="text-white/70 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="text-white/70 hover:text-white transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </button>
            {!userInfo && (
              <Link to="/auth/login">
                <button
                  onClick={() => openAuth("signin")}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </button>
              </Link>
            )}

            {userInfo && (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 hover:border-white/30 transition-all duration-200 group"
                >
                  {userInfo.avatar ? (
                    <img
                      src={userInfo.avatar}
                      alt="avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-zinc-950" />
                </button>

                {/* Profile Dropdown */}
                <div
                  className={`absolute right-0 mt-3 w-64 origin-top-right transition-all duration-200 ${
                    isProfileDropdownOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(24,24,27,0.97) 0%, rgba(15,15,18,0.99) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    boxShadow:
                      "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* User Info Header */}
                  <div className="px-4 pt-4 pb-3 border-b border-white/6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white/70" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {userInfo.username || userInfo.name || "Artist"}
                        </p>
                        <p className="text-xs text-white/40 truncate">
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
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/6 transition-all duration-150 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/4 group-hover:bg-white/8 flex items-center justify-center transition-colors flex-shrink-0">
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
                    <div className="my-2 border-t border-white/6" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/5 group-hover:bg-red-500/12 flex items-center justify-center transition-colors flex-shrink-0">
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
            className="md:hidden text-white"
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
        className={`fixed inset-0 bg-zinc-950/95 backdrop-blur-xl z-40 transition-transform duration-500 flex flex-col items-center justify-center ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center gap-8 text-2xl font-light">
          {["Discovery", "Exhibitions", "3D Spaces", "Artists", "Cart"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-white/60 transition-colors"
              >
                {item}
              </a>
            ),
          )}
          {userInfo ? (
            <button>
              <User className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => openAuth("signin")}
              className="hover:text-white/60 transition-colors"
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
