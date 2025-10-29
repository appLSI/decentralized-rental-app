// src/pages/VerifyOtp.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, ArrowLeft, Mail } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setSuccess(
        location.state.message ||
          "Please enter the verification code sent to your email."
      );
    } else {
      navigate("/signup");
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    try {
      const success = await verifyOtp(email, otpCode);
      if (success) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (error: any) {
      setError(error.message || "Verification failed. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError("");
    try {
      await resendOtp(email);
      setSuccess("Verification code resent to your email!");
      setCountdown(60); // 60 seconds countdown
    } catch (error: any) {
      setError(error.message || "Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={() => navigate("/signup")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#edbf6d] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign up
          </button>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-[#edbf6d] p-2 rounded-full">
              <Building2 className="h-8 w-8 text-[#1b2e3f]" />
            </div>
            <span className="text-3xl font-bold text-[#1b2e3f]">RentChain</span>
          </div>

          <div className="bg-[#edbf6d] p-3 rounded-full inline-flex mb-4">
            <Mail className="h-8 w-8 text-[#1b2e3f]" />
          </div>

          <h2 className="text-3xl font-bold text-[#1b2e3f] mb-4">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-2">Enter the 6-digit code sent to</p>
          <p className="font-semibold text-[#1b2e3f] mb-6">{email}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors"
                pattern="\d*"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#edbf6d] text-[#1b2e3f] py-3 rounded-lg font-semibold hover:bg-[#edbf6d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#1b2e3f] border-t-transparent rounded-full animate-spin" />
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </button>

          <div className="text-center">
            <span className="text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="text-[#edbf6d] hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
