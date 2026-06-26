import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Loader2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";
    const [otp, setOtp] = useState("");
    const { verifyEmailOtp, resendVerificationOtp, isVerifyingOtp, isSendingOtp } = useAuthStore();

    const handleVerify = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            return;
        }

        const success = await verifyEmailOtp({ email, otp });

        if (success) {
            navigate("/login");
        }
    };


    const handleResend = async () => {
        const success = await resendVerificationOtp(email);

        if (success) {
            setOtp("");
        }
    };
    if (!email) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <p>Email not found</p>
                    <Link className="text-primary" to="/signup">
                        Go back to Signup
                    </Link>
                </div>
            </div>
        );
    }
    return (
        <div className="h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-xl p-8">

                <div className="flex flex-col items-center mb-8">
                    <div className="size-14 rounded-xl bg-primary flex items-center justify-center">
                        <ShieldCheck className="text-primary-content" />
                    </div>

                    <h1 className="text-3xl font-bold mt-4">Verify Email</h1>

                    <p className="text-center opacity-70 mt-2">Enter the OTP sent to</p>

                    <p className="font-semibold mt-1 flex items-center gap-2">
                        <Mail size={18} />
                        {email}
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-5">

                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="input input-bordered w-full text-center text-xl tracking-[8px]"
                    />

                    <button className="btn btn-primary w-full"
                        disabled={isVerifyingOtp}
                    >
                        {isVerifyingOtp ? (
                            <>
                                <Loader2 className="animate-spin size-5" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </button>
                </form>
                <button
                    className="btn btn-ghost w-full mt-4" onClick={handleResend} disabled={isSendingOtp}
                >
                    {isSendingOtp ? "Sending..." : "Resend OTP"}
                </button>
            </div>
        </div>
    );
};

export default VerifyEmailPage;