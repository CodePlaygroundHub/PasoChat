import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Mail,
    Loader2,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const email =
        location.state?.email ||
        sessionStorage.getItem("pendingVerificationEmail") ||
        "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const otpValue = otp.join("");
    const isOtpComplete = /^\d{6}$/.test(otpValue);

    const {
        verifyEmailOtp,
        resendVerificationOtp,
        isVerifyingOtp,
        isSendingOtp,
    } = useAuthStore();

    const handleChange = (index, value) => {
        const digit = value.replace(/\D/g, "");

        if (!digit) {
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = digit[0];
        setOtp(newOtp);

        if (index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            const newOtp = [...otp];

            if (otp[index]) {
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                document.getElementById(`otp-${index - 1}`)?.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedData) return;

        const newOtp = ["", "", "", "", "", ""];

        pastedData.split("").forEach((digit, index) => {
            newOtp[index] = digit;
        });

        setOtp(newOtp);
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!isOtpComplete) return;

        const success = await verifyEmailOtp({
            email,
            otp: otpValue,
        });

        if (success) {
            sessionStorage.removeItem(
                "pendingVerificationEmail"
            );
            navigate("/login");
        }
    };

    const handleResend = async () => {
        const success = await resendVerificationOtp(email);

        if (success) {
            setOtp(["", "", "", "", "", ""]);
            document.getElementById("otp-0")?.focus();
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="text-center">
                    <p className="text-lg font-medium">
                        Email not found
                    </p>

                    <Link
                        to="/signup"
                        className="text-primary hover:underline"
                    >
                        Go back to Signup
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200 p-4">
            <div className="w-full max-w-md">
                <div className="bg-base-100/90 backdrop-blur-xl border border-base-300 rounded-3xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center">
                        <div className="size-20 rounded-3xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
                            <ShieldCheck className="size-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold mt-6">
                            Verify Your Email
                        </h1>

                        <p className="text-sm opacity-70 mt-2 text-center">
                            We've sent a 6-digit verification code
                            to
                        </p>

                        {/* Email Badge */}
                        <div className="mt-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 max-w-full">
                            <Mail
                                size={16}
                                className="text-primary shrink-0"
                            />
                            <span className="font-medium truncate">
                                {email}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs opacity-60">
                            <Sparkles size={14} />
                            Check your inbox and spam folder
                        </div>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleVerify}
                        className="mt-8"
                    >
                        <div
                            className="flex justify-center gap-3"
                            onPaste={handlePaste}
                        >
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    autoComplete={
                                        index === 0
                                            ? "one-time-code"
                                            : "off"
                                    }
                                    value={digit}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        handleKeyDown(
                                            index,
                                            e
                                        )
                                    }
                                    className="
                                        w-14
                                        h-16
                                        rounded-2xl
                                        border
                                        border-base-300
                                        bg-base-200/60
                                        text-center
                                        text-2xl
                                        font-bold
                                        transition-all
                                        duration-200
                                        focus:border-primary
                                        focus:ring-2
                                        focus:ring-primary/20
                                        focus:outline-none
                                    "
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={
                                !isOtpComplete ||
                                isVerifyingOtp ||
                                isSendingOtp
                            }
                            className="btn btn-primary w-full mt-8 h-12 text-base"
                        >
                            {isVerifyingOtp ? (
                                <>
                                    <Loader2 className="size-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Email"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="divider my-6 text-xs opacity-50">
                        Didn't receive the code?
                    </div>

                    <button
                        onClick={handleResend}
                        disabled={
                            isSendingOtp || isVerifyingOtp
                        }
                        className="btn btn-outline w-full"
                    >
                        {isSendingOtp ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Sending OTP...
                            </>
                        ) : (
                            "Resend OTP"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;