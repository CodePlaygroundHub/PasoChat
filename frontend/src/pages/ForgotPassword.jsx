import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2, Lock, Mail, ArrowLeft, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const {
    sendOtp,
    verifyOtp,
    resetPassword,
    isSendingOtp,
    isVerifyingOtp,
    isResettingPassword,
  } = useAuthStore();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const success = await sendOtp(email);
    if (success) {
      setStep(2);
      setCooldown(60);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error("Please enter a 6-digit OTP");
    }
    const success = await verifyOtp({ email, otp });
    if (success) setStep(3);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    const success = await resetPassword({
      email,
      newPassword: passwords.newPassword,
    });

    if (success) {
      toast.success("Password reset successfully!");
      navigate("/login");
    }
  };

  const handleBack = () => {
    if (step === 1) navigate("/login");
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-base-200 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl bg-base-100/80 backdrop-blur-2xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-500">
          <div className="p-6 md:p-8">
            <button
              type="button"
              onClick={handleBack}
              className="group flex items-center gap-2 text-xs font-bold text-base-content/40 hover:text-primary transition-colors mb-6 uppercase tracking-widest"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex size-12 rounded-2xl bg-primary/10 items-center justify-center mb-4">
                {step === 1 && <Mail className="size-6 text-primary" />}
                {step === 2 && <ShieldCheck className="size-6 text-primary" />}
                {step === 3 && <KeyRound className="size-6 text-primary" />}
              </div>
              <h1 className="text-2xl font-black tracking-tight">Account Recovery</h1>
              <p className="text-base-content/50 text-xs mt-1">
                {step === 1 && "Verify your email to continue"}
                {step === 2 && "Enter the 6-digit OTP sent to your email"}
                {step === 3 && "Set your new account password"}
              </p>
            </div>

            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    step >= s ? "bg-primary" : "bg-base-300"
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">Email Address</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-30" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="input input-bordered w-full pl-12 bg-base-200/50 border-none focus:ring-2 focus:ring-primary/20 h-12 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" disabled={isSendingOtp} className="btn btn-primary w-full h-12 shadow-lg shadow-primary/20">
                  {isSendingOtp ? <Loader2 className="animate-spin" /> : "Send OTP"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">Verification Code</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-30" />
                      <input
                        type="text"
                        maxLength="6"
                        required
                        placeholder="Enter 6-digit OTP"
                        className="input input-bordered w-full pl-12 bg-base-200/50 border-none focus:ring-2 focus:ring-primary/20 h-12 transition-all tracking-[0.25em] text-center font-bold text-lg placeholder:tracking-normal placeholder:text-center"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    {cooldown > 0 ? (
                      <p className="text-xs text-base-content/40">
                        Resend OTP in <span className="font-semibold text-primary">{cooldown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="text-xs font-bold text-primary hover:underline focus:outline-none"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={isVerifyingOtp} className="btn btn-primary w-full h-12 shadow-lg shadow-primary/20">
                  {isVerifyingOtp ? <Loader2 className="animate-spin" /> : "Verify OTP"}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleReset} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-bold text-[10px] uppercase opacity-60">New Password</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-30" />
                      <input
                        type="password"
                        required
                        className="input input-bordered w-full pl-12 bg-base-200/50 border-none focus:ring-2 focus:ring-primary/20 h-12"
                        placeholder="••••••••"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label py-1"><span className="label-text font-bold text-[10px] uppercase opacity-60">Confirm Password</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-30" />
                      <input
                        type="password"
                        required
                        className="input input-bordered w-full pl-12 bg-base-200/50 border-none focus:ring-2 focus:ring-primary/20 h-12"
                        placeholder="••••••••"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isResettingPassword} className="btn btn-primary w-full h-12 shadow-lg shadow-primary/20 mt-2">
                  {isResettingPassword ? <Loader2 className="animate-spin" /> : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;