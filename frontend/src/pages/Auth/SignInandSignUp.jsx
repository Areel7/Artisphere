import React, { useState } from "react";
import { X, User, Mail, Lock } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice.js";
import { useLoginMutation, useRegisterMutation } from "../../redux/api/user";
import { toast } from "react-toastify";
import Loader from "../../components/Loader.jsx";

const SignInandSignUp = ({
  isAuthModalOpen,
  setIsAuthModalOpen,
  authMode,
  setAuthMode,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading: loginLoading }] = useLoginMutation();

  const [register, { isLoading: registerLoading }] = useRegisterMutation();


  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  // Redirect already handled in submitHandler after login/register

  const submitHandler = async (e) => {
    e.preventDefault();

    if (authMode === "signup") {
      if (password !== confirmPassword) {
        toast.error("Password do not match");
        return;
      } else {
        try {
          const res = await register({ username, email, password }).unwrap();
          dispatch(setCredentials({ ...res }));
          navigate(redirect);
          toast.success("Registration Successful");
          setIsAuthModalOpen(false);
        } catch (error) {
          toast.error(error?.data?.errors[0]?.msg || error.message);
        }
      }
    } else {
      try {
        const res = await login({ email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        toast.success("Login Successful");
        setIsAuthModalOpen(false);
      } catch (error) {
        toast.error(error?.data?.errors[0]?.msg || error.message);
      }
    }
  };

  return (
    <>
      {/* Auth Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <Link to="/">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </Link>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {authMode === "signin" ? "Welcome Back" : "Join Artisphere"}
              </h2>
              <p className="text-white/50 text-sm font-light">
                {authMode === "signin"
                  ? "Enter your details to access your collection."
                  : "Create an account to start collecting and sharing art."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={submitHandler}>
              {authMode === "signup" && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {authMode === "signup" && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type="password"
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
              <button className="w-full py-4 mt-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors">
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </button>
              {loginLoading || (registerLoading && <Loader />)}
            </form>

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-sm text-white/50">
                {authMode === "signin"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Link
                  to={`/auth/${authMode === "signin" ? "register" : "login"}`}
                >
                  <button
                    onClick={() =>
                      setAuthMode(authMode === "signin" ? "signup" : "signin")
                    }
                    className="text-white hover:text-zinc-300 font-semibold underline underline-offset-4"
                  >
                    {authMode === "signin" ? "Sign Up" : "Sign In"}
                  </button>
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignInandSignUp;
