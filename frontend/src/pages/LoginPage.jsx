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
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-[#100F0F] px-4 py-10">
      <div className="w-full max-w-[380px]">
        {/* Brand & Header */}
        <div className="mb-7">
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <MessageSquare className="h-4 w-4 stroke-[1.75]" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign in to PASO
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Enter your credentials to access your conversations.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141313] p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 stroke-[1.75]" />
                <input
                  id="email"
                  type="email"
                  className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/70 pl-9 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-colors"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 stroke-[1.75]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/70 pl-9 pr-9 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5 stroke-[1.75]" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-2 flex h-9 w-full items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              {isLoggingIn ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800/80" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white dark:bg-[#141313] px-2 text-zinc-400 dark:text-zinc-500">
                or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth */}
          <div className="flex justify-center">
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
              theme="outline"
              size="medium"
              width="330"
            />
          </div>

          {isGoogleLoggingIn && (
            <div className="mt-3 flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
            </div>
          )}
        </div>

        {/* Footer Link */}
        <p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
          New to PASO?{" "}
          <Link
            to="/signup"
            className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;