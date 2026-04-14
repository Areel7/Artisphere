import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Camera,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../redux/api/user.js";

/* ─── Shared style tokens ─────────────────────────────────────────────────── */
const inputBase =
  "w-full bg-zinc-900/60 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all duration-200";
const labelBase = "block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2";
const iconBase = "absolute left-3.5 top-[2.6rem] w-4 h-4 text-zinc-600 pointer-events-none";

/* ─── Component ───────────────────────────────────────────────────────────── */
const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);

  /* Pre-fill from Redux / API — prefer fresh API data, fall back to Redux cache */
  useEffect(() => {
    const source = profile ?? userInfo;
    if (!source) return;

    setForm((prev) => ({
      ...prev,
      username: source.username ?? source.name ?? "",
      email: source.email ?? "",
    }));

    if (source.avatar) setAvatarPreview(source.avatar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?._id, userInfo?._id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus({ type: "", message: "" });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (form.password && form.password !== form.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      const payload = {
        username: form.username,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
      };

      const updated = await updateProfile(payload).unwrap();
      dispatch(setCredentials(updated));
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setStatus({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.data?.message || "Failed to update profile.",
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-100 flex items-center justify-center p-6 pt-28">
      <div className="w-full max-w-lg">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 tracking-tight text-zinc-900 dark:text-white">
            MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500 italic">
                PROFILE.
              </span>
          </h1>
          <p className="text-sm text-zinc-500">Manage your account details</p>
        </div>

        <div
          className="relative rounded-3xl p-8 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(24,24,27,0.97) 0%, rgba(15,15,18,0.99) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset",
          }}
        >
          {/* Subtle glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-9 h-9 text-white/40" />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-xs text-zinc-600">Click avatar to change photo</p>
            </div>

            {/* Username */}
            <div className="relative">
              <label className={labelBase} htmlFor="username">
                Username
              </label>
              <User className={iconBase} />
              <input
                id="username"
                type="text"
                name="username"
                placeholder="your_username"
                className={inputBase}
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label className={labelBase} htmlFor="email">
                Email Address
              </label>
              <Mail className={iconBase} />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                className={inputBase}
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {/* Role */}
            <div className="relative">
              <label className={labelBase}>Role</label>
              <Shield className={iconBase} />
              <div className={`${inputBase} flex items-center cursor-default select-none`}>
                <span className="capitalize text-zinc-300">
                  {(profile?.role ?? userInfo?.role) || "—"}
                </span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                  {(profile?.role ?? userInfo?.role) || ""}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600 uppercase tracking-widest">
                Change Password
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* New Password */}
            <div className="relative">
              <label className={labelBase} htmlFor="password">
                New Password
              </label>
              <Lock className={iconBase} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Leave blank to keep current"
                className={`${inputBase} pr-11`}
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-[2.6rem] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className={labelBase} htmlFor="confirmPassword">
                Confirm Password
              </label>
              <Lock className={iconBase} />
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Repeat new password"
                className={`${inputBase} pr-11`}
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3.5 top-[2.6rem] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Status Banner */}
            {status.message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
                  status.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {status.message}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={updating}
              className="w-full bg-white text-black font-semibold py-4 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 group mt-2"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
