import React, { useState, useEffect, useCallback } from "react";
import { X, User, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice.js";
import {
  useLoginMutation,
  useRegisterMutation,
  useLazyGetRecentlyViewedQuery,
  useSyncRecentlyViewedMutation,
} from "../../redux/api/user";
import { useCreateRequestMutation } from "../../redux/api/request";
import {
  getRecentlyViewedArtworkIds,
  mergeRecentlyViewedIds,
  setRecentlyViewedArtworkIds,
} from "../../utils/recentlyViewed.js";
import { toast } from "react-toastify";
import Loader from "../../components/Loader.jsx";
import * as Yup from "yup";

/** Matches backend `registerValidation` / `loginValidation` in Helper/validations.js */
const signInSchema = Yup.object({
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Please provide a valid email"),
  password: Yup.string().required("Password is required"),
});

const signUpSchema = Yup.object({
  username: Yup.string()
    .trim()
    .required("Username is required")
    .min(2, "Username must be at least 2 characters")
    .max(64, "Username must be at most 64 characters"),
  email: Yup.string()
    .trim()
    .required("Email is required")
    .email("Please provide a valid email"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  acceptTerms: Yup.boolean().oneOf(
    [true],
    "You must accept the Terms & Privacy to continue",
  ),
});

/**
 * Flattens Yup ValidationError (including nested `inner`) into { [fieldPath]: message }.
 */
function flattenYupValidationError(err) {
  const acc = {};
  const walk = (node) => {
    if (!node) return;
    const path =
      node.path != null && node.path !== ""
        ? String(node.path)
        : node.params?.path != null
          ? String(node.params.path)
          : null;
    if (path && node.message && !(path in acc)) {
      acc[path] = node.message;
    }
    if (Array.isArray(node.inner) && node.inner.length > 0) {
      node.inner.forEach(walk);
    }
  };
  walk(err);
  if (Object.keys(acc).length === 0 && Array.isArray(err?.errors) && err.errors.length > 0) {
    acc.form = err.errors.filter(Boolean).join(" ");
  }
  return acc;
}

/** RTK Query / fetchBaseQuery rejection from unwrap() */
function getApiErrorMessage(error) {
  const data = error?.data;
  const first = data?.errors?.[0];
  if (typeof first?.msg === "string") return first.msg;
  if (typeof data?.message === "string") return data.message;
  if (typeof error?.message === "string" && error.message !== "Rejected") {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

const ROLE_OPTIONS = [
  { value: "visitor", label: "Visitor", description: "Browse & collect art" },
  { value: "artist", label: "Artist", description: "Showcase your artworks" },
  { value: "curator", label: "Curator", description: "Manage exhibitions" },
];

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
  const [selectedRole, setSelectedRole] = useState("visitor");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [createRequest, { isLoading: requestLoading }] = useCreateRequestMutation();
  const [fetchRecentlyViewed] = useLazyGetRecentlyViewedQuery();
  const [syncRecentlyViewed] = useSyncRecentlyViewedMutation();

  const isLoading = loginLoading || registerLoading || requestLoading;

  const mergeGuestHistoryToAccount = async () => {
    const local = getRecentlyViewedArtworkIds();
    if (!local.length) return;
    try {
      const serverList = await fetchRecentlyViewed().unwrap();
      const merged = mergeRecentlyViewedIds(
        local,
        (serverList || []).map((a) => a._id),
      );
      await syncRecentlyViewed({ ids: merged }).unwrap();
      setRecentlyViewedArtworkIds(merged);
    } catch {
      /* keep local only if network fails */
    }
  };

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  const clearFieldError = useCallback((key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAcceptedTerms(false);
    setSelectedRole("visitor");
    setIsRoleDropdownOpen(false);
  }, [authMode, isAuthModalOpen]);

  const runValidation = async () => {
    try {
      if (authMode === "signin") {
        await signInSchema.validate(
          { email, password },
          { abortEarly: false },
        );
      } else {
        await signUpSchema.validate(
          {
            username,
            email,
            password,
            confirmPassword,
            acceptTerms: acceptedTerms,
          },
          { abortEarly: false },
        );
      }
      setFieldErrors({});
      return true;
    } catch (e) {
      const mapped = flattenYupValidationError(e);
      if (Object.keys(mapped).length > 0) {
        setFieldErrors(mapped);
      } else if (e && typeof e.message === "string") {
        setFieldErrors({ form: e.message });
      } else {
        setFieldErrors({
          form: "Validation failed. Please check your details.",
        });
      }
      return false;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const ok = await runValidation();
    if (!ok) return;

    if (authMode === "signup") {
      // Artist / Curator → send application request, no immediate login
      if (selectedRole === "artist" || selectedRole === "curator") {
        try {
          const res = await createRequest({
            username: username.trim(),
            email: email.trim(),
            password,
            role: selectedRole,
          }).unwrap();
          toast.success(
            res.msg ||
              `Application submitted! A superadmin will review and activate your ${selectedRole} account.`,
            { autoClose: 6000 },
          );
          setIsAuthModalOpen(false);
        } catch (error) {
          toast.error(getApiErrorMessage(error));
        }
        return;
      }

      // Visitor → register normally
      try {
        const res = await register({
          username: username.trim(),
          email: email.trim(),
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        await mergeGuestHistoryToAccount();
        navigate(redirect);
        toast.success("Registration Successful");
        setIsAuthModalOpen(false);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    } else {
      try {
        const res = await login({ email: email.trim(), password }).unwrap();
        dispatch(setCredentials({ ...res }));
        await mergeGuestHistoryToAccount();
        navigate(redirect);
        toast.success("Login Successful");
        setIsAuthModalOpen(false);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    }
  };

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === selectedRole);

  return (
    <>
      {/* Auth Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.12)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] text-zinc-900 dark:text-white">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
                {authMode === "signin" ? "Welcome Back" : "Join Artisphere"}
              </h2>
              <p className="text-zinc-600 dark:text-white/50 text-sm font-light">
                {authMode === "signin"
                  ? "Enter your details to access your collection."
                  : "Create an account to start collecting and sharing art."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={submitHandler} noValidate>
              {fieldErrors.form && (
                <p
                  className="text-rose-600 dark:text-rose-400 text-sm text-center bg-rose-500/10 border border-rose-500/20 rounded-lg py-2 px-3"
                  role="alert"
                >
                  {fieldErrors.form}
                </p>
              )}

              {/* ─── Sign-up only fields ─── */}
              {authMode === "signup" && (
                <>
                  {/* Role Selector */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/50 mb-2 font-semibold">
                      I am a
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        id="auth-role-selector"
                        onClick={() => setIsRoleDropdownOpen((v) => !v)}
                        className="w-full flex items-center justify-between bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg px-4 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none hover:border-violet-500/50 dark:hover:border-white/30 transition-colors"
                      >
                        <span className="flex flex-col items-start text-left">
                          <span className="font-medium">{selectedRoleOption?.label}</span>
                          <span className="text-[11px] text-zinc-500 dark:text-white/40">
                            {selectedRoleOption?.description}
                          </span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                            isRoleDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isRoleDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
                          {ROLE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSelectedRole(opt.value);
                                setIsRoleDropdownOpen(false);
                              }}
                              className={`w-full flex flex-col items-start px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-white/5 ${
                                selectedRole === opt.value
                                  ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400"
                                  : "text-zinc-800 dark:text-white/80"
                              }`}
                            >
                              <span className="font-medium">{opt.label}</span>
                              <span className="text-[11px] text-zinc-500 dark:text-white/40">
                                {opt.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Info banner for artist/curator */}
                    {(selectedRole === "artist" || selectedRole === "curator") && (
                      <p className="mt-2 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 rounded-lg px-3 py-2">
                        ⚠️ Artist &amp; Curator accounts require superadmin approval.
                        You'll be able to log in once your request is accepted.
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      htmlFor="auth-username"
                      className="block text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/50 mb-2 font-semibold"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-white/40" />
                      <input
                        id="auth-username"
                        name="username"
                        autoComplete="name"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          clearFieldError("username");
                        }}
                        type="text"
                        aria-invalid={Boolean(fieldErrors.username)}
                        className={`w-full bg-zinc-50 dark:bg-white/5 border rounded-lg pl-12 pr-4 py-3.5 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 transition-colors text-sm ${
                          fieldErrors.username
                            ? "border-rose-500 focus:border-rose-500"
                            : "border-zinc-200 dark:border-white/10 focus:border-violet-500/50 dark:focus:border-white/50"
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 ml-0.5">
                        {fieldErrors.username}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/50 mb-2 font-semibold"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-white/40" />
                  <input
                    id="auth-email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError("email");
                    }}
                    type="email"
                    inputMode="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`w-full bg-zinc-50 dark:bg-white/5 border rounded-lg pl-12 pr-4 py-3.5 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 transition-colors text-sm ${
                      fieldErrors.email
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-zinc-200 dark:border-white/10 focus:border-violet-500/50 dark:focus:border-white/50"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 ml-0.5">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/50 mb-2 font-semibold"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-white/40 pointer-events-none" />
                  <input
                    id="auth-password"
                    name="password"
                    autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError("password");
                      if (authMode === "signup") clearFieldError("confirmPassword");
                    }}
                    type={showPassword ? "text" : "password"}
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`w-full bg-zinc-50 dark:bg-white/5 border rounded-lg pl-12 pr-12 py-3.5 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 transition-colors text-sm ${
                      fieldErrors.password
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-zinc-200 dark:border-white/10 focus:border-violet-500/50 dark:focus:border-white/50"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 ml-0.5">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password (signup only) */}
              {authMode === "signup" && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="block text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/50 mb-2 font-semibold"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-white/40 pointer-events-none" />
                    <input
                      id="auth-confirm-password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearFieldError("confirmPassword");
                      }}
                      type={showConfirmPassword ? "text" : "password"}
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      className={`w-full bg-zinc-50 dark:bg-white/5 border rounded-lg pl-12 pr-12 py-3.5 text-zinc-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/10 transition-colors text-sm ${
                        fieldErrors.confirmPassword
                          ? "border-rose-500 focus:border-rose-500"
                          : "border-zinc-200 dark:border-white/10 focus:border-violet-500/50 dark:focus:border-white/50"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-rose-600 dark:text-rose-400 text-xs mt-1.5 ml-0.5">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Terms (signup only) */}
              {authMode === "signup" && (
                <div className="space-y-1.5">
                  <div className="flex items-start gap-3">
                    <input
                      id="auth-accept-terms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        clearFieldError("acceptTerms");
                      }}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-900 focus:ring-violet-500 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:ring-violet-400"
                      aria-invalid={Boolean(fieldErrors.acceptTerms)}
                      aria-describedby={
                        fieldErrors.acceptTerms
                          ? "auth-accept-terms-error"
                          : undefined
                      }
                    />
                    <label
                      htmlFor="auth-accept-terms"
                      className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug cursor-pointer select-none"
                    >
                      I have read and agree to the{" "}
                      <Link
                        to="/terms"
                        className="font-medium text-violet-700 underline underline-offset-2 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300"
                        onClick={() => setIsAuthModalOpen(false)}
                      >
                        Terms &amp; Privacy
                      </Link>
                      .
                    </label>
                  </div>
                  {fieldErrors.acceptTerms && (
                    <p
                      id="auth-accept-terms-error"
                      className="text-rose-600 dark:text-rose-400 text-xs ml-7"
                    >
                      {fieldErrors.acceptTerms}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors disabled:opacity-60 disabled:pointer-events-none"
              >
                {authMode === "signin"
                  ? "Sign In"
                  : selectedRole === "visitor"
                  ? "Create Account"
                  : `Submit ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Application`}
              </button>
              {isLoading && <Loader />}
            </form>

            <div className="mt-8 text-center border-t border-zinc-200 dark:border-white/10 pt-6">
              <p className="text-sm text-zinc-600 dark:text-white/50">
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
                    className="text-zinc-900 hover:text-violet-700 dark:text-white dark:hover:text-zinc-300 font-semibold underline underline-offset-4"
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
