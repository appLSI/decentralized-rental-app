// src/pages/SignUp.tsx
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

const SignUp = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.firstname || !formData.lastname || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const success = await register({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
      });

      if (success) {
        navigate("/verify-otp", {
          state: {
            email: formData.email,
            message: "Registration successful! Please check your email for verification code.",
          },
        });
      }
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50">
      {/* Left Section - Shared Carousel */}
      <AuthCarousel />

      {/* Right Section - Form */}
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
        {/* Card without shadow or glass effect */}
        <div className="w-full max-w-[500px] p-8 md:p-12 rounded-3xl relative bg-white overflow-y-auto max-h-[90vh]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Logo size="md" className="text-navy-deep" />
          </div>

          <div className="mb-8">
            <h2 className="text-slate-900 tracking-tight text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-slate-500 text-base">Join the decentralized future of real estate.</p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-slate-700 text-sm font-semibold ml-1" htmlFor="firstname">
                  First Name
                </Label>
                <Input
                  id="firstname"
                  type="text"
                  required
                  value={formData.firstname}
                  onChange={(e) => handleInputChange("firstname", e.target.value)}
                  className="rounded-xl h-12 px-4 bg-white border border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20 transition-all"
                  placeholder="First name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-slate-700 text-sm font-semibold ml-1" htmlFor="lastname">
                  Last Name
                </Label>
                <Input
                  id="lastname"
                  type="text"
                  required
                  value={formData.lastname}
                  onChange={(e) => handleInputChange("lastname", e.target.value)}
                  className="rounded-xl h-12 px-4 bg-white border border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20 transition-all"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email */}
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
                className="rounded-xl h-12 px-4 bg-white border border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20 transition-all"
                placeholder="name@example.com"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-slate-700 text-sm font-semibold ml-1" htmlFor="password">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="rounded-xl h-12 px-4 pr-10 bg-white border border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20 transition-all"
                    placeholder="Min. 6 chars"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-slate-700 text-sm font-semibold ml-1" htmlFor="confirmPassword">
                  Confirm
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="rounded-xl h-12 px-4 bg-white border border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20 transition-all"
                  placeholder="Confirm"
                />
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
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-bold text-navy-deep hover:underline transition-all ml-1"
              >
                Sign in
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

export default SignUp;