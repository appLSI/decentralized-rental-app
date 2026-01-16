// src/pages/SignIn.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Logo from "@/components/Logo";
import { AuthCarousel } from "../components/AuthCarousel";

const SignIn = () => {
  const navigate = useNavigate();
  const { login, isLoading, resendOtp } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const user = await login({
        email: formData.email,
        password: formData.password,
      });

      if (!user) return;

      if (user?.roles?.includes("ADMIN") || user?.roles?.includes("AGENT")) {
        navigate("/admin/dashboard", { replace: true });
      } else if (user?.types?.includes("HOST")) {
        navigate("/host/dashboard", { replace: true });
      } else {
        navigate("/properties", { replace: true });
      }
    } catch (error: any) {
      if (error.message === "VERIFICATION_REQUIRED") {
        try {
          await resendOtp(formData.email);
          navigate("/verify-otp", {
            state: {
              email: formData.email,
              message: "Your account is not verified. A new verification code has been sent."
            }
          });
        } catch (resendError: any) {
          setError("Account not verified. Failed to resend verification code.");
        }
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50">
      <AuthCarousel />

      {/* Right Section */}
      <div
        className="
      w-full lg:w-1/2
      relative z-10
      flex items-center justify-center
      p-6 bg-white
      lg:-ml-24
      rounded-l-[3rem]
    "
      >
        <div className="w-full max-w-[500px] p-8 md:p-12 bg-white">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Logo size="md" className="text-navy-deep" />
          </div>

          <div className="mb-8">
            <h2 className="text-slate-900 tracking-tight text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-slate-500 text-base">Enter your details to access your dashboard.</p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <Label className="text-slate-700 text-sm font-semibold ml-1" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full rounded-xl h-12 px-4 bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20 transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-slate-700 text-sm font-semibold" htmlFor="password">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-navy-deep hover:text-navy-deep/80 text-xs font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full rounded-xl h-12 px-4 bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-navy-deep py-3.5 h-auto text-white text-base font-bold hover:bg-navy-deep/90 active:scale-[0.98] transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                "Sign In to Account"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-navy-deep hover:underline transition-all ml-1"
              >
                Create free account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-6 flex gap-6 text-xs text-slate-400 font-medium">
          <a href="#" className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-600 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;