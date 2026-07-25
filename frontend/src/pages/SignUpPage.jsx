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
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    for (let q of formData.securityQuestions) {
      if (!q.answer.trim())
        return toast.error("All security answers are required");
    }

    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    const result = await signup(formData);
    if (result) {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 px-4 py-8 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-secondary/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10 my-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl md:rounded-3xl bg-base-100/80 backdrop-blur-2xl shadow-2xl border border-base-content/10 overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Column: Primary Auth Details */}
          <div className="flex-[1.2] p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="mb-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <div className="size-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <MessageSquare className="size-6 text-primary-content" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Create Account</h1>
                </div>
                <p className="text-base-content/60 text-xs sm:text-sm font-medium">
                  Secure your journey in a few simple steps.
                </p>
              </div>

              {/* Basic Fields */}
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold text-xs uppercase opacity-70">Full Name</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40" />
                    <input
                      type="text"
                      className="input input-bordered w-full pl-11 bg-base-200/50 border-none focus:ring-2 ring-primary/20 h-11 text-sm transition-all"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold text-xs uppercase opacity-70">Email</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40" />
                    <input
                      type="email"
                      className="input input-bordered w-full pl-11 bg-base-200/50 border-none focus:ring-2 ring-primary/20 h-11 text-sm transition-all"
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold text-xs uppercase opacity-70">Password</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input input-bordered w-full pl-11 pr-11 bg-base-200/50 border-none focus:ring-2 ring-primary/20 h-11 text-sm transition-all"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Login Divider */}
              <div className="mt-6 mb-2">
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
                      toast.error("Google signup failed.");
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
            </div>
          </div>

          {/* Right Column: Security Questions & Actions */}
          <div className="flex-1 bg-base-200/30 p-6 sm:p-8 lg:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-base-content/5">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="size-5 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-base-content/70">
                  Account Recovery Questions
                </h3>
              </div>

              <div className="space-y-4">
                {formData.securityQuestions.map((q, index) => (
                  <div key={index} className="form-control">
                    <label className="label py-0.5">
                      <span className="label-text-alt text-xs font-medium text-base-content/80">
                        {q.question}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary h-10 text-sm transition-all"
                      placeholder="Your answer"
                      value={q.answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <button
                type="submit"
                disabled={isSigningUp}
                className="btn btn-primary w-full h-12 shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold text-base"
              >
                {isSigningUp ? <Loader2 className="animate-spin size-5" /> : "Create Account"}
              </button>

              <p className="text-center text-xs sm:text-sm text-base-content/60">
                Already a member?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">
                  Log in
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