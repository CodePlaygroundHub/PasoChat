import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    securityQuestions: [
      { question: "Mother's maiden name?", answer: "" },
      { question: "First school name?", answer: "" },
      { question: "Childhood nickname?", answer: "" },
    ],
  });

  const {
    signup,
    googleLogin,
    isSigningUp,
    isGoogleLoggingIn,
  } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
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
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    for (const q of formData.securityQuestions) {
      if (!q.answer.trim()) {
        toast.error("All security answers are required");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    const result = await signup(formData);
    if (result) {
      // A development OTP bypass returns an authenticated session directly.
      // Only show the verification screen when the backend requests it.
      if (result.token) {
        navigate("/");
        return;
      }

      const email = result.email || formData.email.trim();
      sessionStorage.setItem("pendingVerificationEmail", email);
      navigate("/verify-email", { state: { email } });
    }
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...formData.securityQuestions];
    updated[index].answer = value;
    setFormData({ ...formData, securityQuestions: updated });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-[#100F0F] px-4 py-10">
      <div className="w-full max-w-4xl">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141313] shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12"
        >
          {/* Left Column: Account Credentials & OAuth */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                    <MessageSquare className="h-4 w-4 stroke-[1.75]" />
                  </span>
                  <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    PASO
                  </span>
                </div>

                <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  Create your account
                </h1>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Set up your credentials and recovery answers to get started.
                </p>
              </div>

              {/* Credential Fields */}
              <div className="space-y-3.5">
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                    <input
                      id="signup-name"
                      type="text"
                      className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-9 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                    <input
                      id="signup-email"
                      type="email"
                      className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-9 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
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
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-9 pr-9 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
              </div>

              {/* Google OAuth */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-zinc-200/80 dark:bg-zinc-800/80" />
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  or
                </span>
                <div className="h-[1px] flex-1 bg-zinc-200/80 dark:bg-zinc-800/80" />
              </div>

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
                    toast.error("Google signup failed.");
                  }}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  width="320"
                />
              </div>

              {isGoogleLoggingIn && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Connecting with Google...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recovery Questions & Submit */}
          <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-4 w-4 text-zinc-500 dark:text-zinc-400 stroke-[1.75]" />
                <h2 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Account recovery questions
                </h2>
              </div>

              <div className="space-y-3.5">
                {formData.securityQuestions.map((q, index) => (
                  <div key={index}>
                    <label
                      htmlFor={`recovery-q-${index}`}
                      className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1"
                    >
                      {q.question}
                    </label>
                    <input
                      id={`recovery-q-${index}`}
                      type="text"
                      className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                      placeholder="Your answer"
                      value={q.answer}
                      onChange={(e) =>
                        handleAnswerChange(index, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 space-y-3.5">
              <button
                type="submit"
                disabled={isSigningUp}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </button>

              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;