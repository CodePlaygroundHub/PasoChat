import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const {
    login,
    googleLogin,
    isLoggingIn,
    isGoogleLoggingIn,
  } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email address is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    login(formData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 my-auto">
        <div className="w-full rounded-3xl bg-base-100/80 backdrop-blur-2xl shadow-2xl border border-base-content/10 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">

            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="flex flex-col items-center gap-3">
                <div className="size-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <MessageSquare className="size-7 text-primary-content" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content">
                    Welcome Back
                  </h1>
                  <p className="text-base-content/60 font-medium text-xs sm:text-sm mt-1">
                    Sign in to continue your conversations
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-xs uppercase opacity-70">
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40" />
                  <input
                    type="email"
                    className="input input-bordered w-full pl-12 bg-base-200/50 border-none focus:ring-2 ring-primary/20 transition-all h-12 text-sm"
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-control">
                <div className="flex justify-between items-center mb-1 px-1">
                  <label className="label p-0">
                    <span className="label-text font-bold text-xs uppercase opacity-70">
                      Password
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-primary hover:underline transition-all"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pl-12 pr-12 bg-base-200/50 border-none focus:ring-2 ring-primary/20 transition-all h-12 text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn btn-primary w-full h-12 shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold text-base"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            {/* Google OAuth Section */}
            <div className="my-6">
              <div className="divider text-xs uppercase opacity-60">OR</div>

              <div className="flex justify-center mt-4">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (!credentialResponse.credential) {
                      toast.error("Google authentication failed.");
                      return;
                    }

                    await googleLogin(credentialResponse.credential);
                  }}
                  onError={() => {
                    toast.error("Google login failed.");
                  }}
                  useOneTap={false}
                />
              </div>

              {isGoogleLoggingIn && (
                <div className="flex justify-center mt-3">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-base-content/60 font-medium">
                Don&apos;t have an account?
                <Link
                  to="/signup"
                  className="text-primary font-bold ml-1.5 hover:underline transition-all"
                >
                  Create account
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;