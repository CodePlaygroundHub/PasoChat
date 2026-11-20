import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const {
    fetchSecurityQuestions,
    verifySecurityAnswers,
    sendOtp,
    verifyOtp,
    resetPassword,
    securityQuestions,
    isFetchingQuestions,
    isVerifyingSecurity,
    isSendingOtp,
    isVerifyingOtp,
    isResettingPassword,
  } = useAuthStore();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [recoveryMethod, setRecoveryMethod] = useState("otp");

  const [answers, setAnswers] = useState([]);
  const [cooldown, setCooldown] = useState(0);
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
        return;
      }

      if (index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length - 1, 5);
    document.getElementById(`otp-${lastIndex}`)?.focus();
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      return toast.error("Email address is required");
    }
    const success = await sendOtp(email);
    if (success) {
      setRecoveryMethod("otp");
      setStep(2);
      setCooldown(60);
    }
  };

  const handleUseSecurityQuestions = async () => {
    if (!email.trim()) {
      return toast.error("Enter your email address first");
    }
    const success = await fetchSecurityQuestions(email);
    if (success) {
      const latestQuestions = useAuthStore.getState().securityQuestions || [];
      setRecoveryMethod("security");
      setAnswers(new Array(latestQuestions.length).fill(""));
      setStep(2);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      return toast.error("Please enter a 6-digit OTP");
    }
    const success = await verifyOtp({
      email,
      otp: otpValue,
    });
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
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-[#100F0F] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141313] p-6 sm:p-8 shadow-xs">
          {/* Top Navigation & Step Indicator */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[1.75]" />
              <span>Back</span>
            </button>

            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
              Step {step} of 3
            </span>
          </div>

          {/* Step Progress Bar */}
          <div className="mb-6 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  step >= s
                    ? "bg-zinc-900 dark:bg-zinc-100"
                    : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            ))}
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
              {step === 1 && <Mail className="h-4 w-4 stroke-[1.75]" />}
              {step === 2 && <ShieldCheck className="h-4 w-4 stroke-[1.75]" />}
              {step === 3 && <KeyRound className="h-4 w-4 stroke-[1.75]" />}
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {step === 1 && "Reset your password"}
              {step === 2 &&
                (recoveryMethod === "otp"
                  ? "Check your email"
                  : "Security verification")}
              {step === 3 && "Set a new password"}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {step === 1 &&
                "Enter your account email to receive a one-time code or answer recovery questions."}
              {step === 2 &&
                (recoveryMethod === "otp"
                  ? `Enter the 6-digit verification code sent to ${email}.`
                  : "Answer your saved recovery questions to verify ownership.")}
              {step === 3 && "Choose a strong password of at least 6 characters."}
            </p>
          </div>

          {/* Step 1: Identify Account */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label
                  htmlFor="recovery-email"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-9 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <span>Send verification code</span>
                )}
              </button>

              <button
                type="button"
                disabled={isFetchingQuestions}
                onClick={handleUseSecurityQuestions}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 px-4 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                {isFetchingQuestions ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Loading questions...</span>
                  </>
                ) : (
                  <span>Use security questions instead</span>
                )}
              </button>
            </form>
          )}

          {/* Step 2A: OTP Verification */}
          {step === 2 && recoveryMethod === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Verification code
                </label>

                <div className="grid grid-cols-6 gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      aria-label={`Digit ${index + 1}`}
                      className="h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none transition-colors tabular-nums"
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 dark:text-zinc-500">
                    Didn&apos;t receive a code?
                  </span>
                  {cooldown > 0 ? (
                    <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">
                      Resend in {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 disabled:opacity-50 cursor-pointer"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify code</span>
                )}
              </button>
            </form>
          )}

          {/* Step 2B: Security Questions */}
          {step === 2 && recoveryMethod === "security" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const success = await verifySecurityAnswers({
                  email,
                  answers,
                });
                if (success) {
                  setStep(3);
                }
              }}
              className="space-y-3.5"
            >
              {securityQuestions.map((question, index) => (
                <div key={index}>
                  <label
                    htmlFor={`security-q-${index}`}
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    {question}
                  </label>
                  <input
                    id={`security-q-${index}`}
                    type="text"
                    required
                    placeholder="Your answer"
                    className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    value={answers[index] || ""}
                    onChange={(e) => {
                      const updated = [...answers];
                      updated[index] = e.target.value;
                      setAnswers(updated);
                    }}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={isVerifyingSecurity}
                className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                {isVerifyingSecurity ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify answers</span>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleReset} className="space-y-3.5">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-9 pr-9 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    autoComplete="new-password"
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

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your password"
                    className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-9 pr-9 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5 stroke-[1.75]" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 stroke-[1.75]" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isResettingPassword}
                className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Update password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;