// src/pages/SignUp.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, ArrowLeft, Eye, EyeOff, User, Mail } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

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

    // Validation
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
        // Redirect to OTP verification page
        navigate("/verify-otp", {
          state: {
            email: formData.email,
            message:
              "Registration successful! Please check your email for verification code.",
          },
        });
      }
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Form */}
      <div className="w-1/3 flex items-center justify-center px-12 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-[#edbf6d] transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </button>

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-[#edbf6d] p-2 rounded-full">
                <Building2 className="h-8 w-8 text-[#1b2e3f]" />
              </div>
              <span className="text-3xl font-bold text-[#1b2e3f]">
                RentChain
              </span>
            </div>

            <h2 className="text-3xl font-bold text-[#1b2e3f] mb-4">
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Join thousands of users transforming real estate with blockchain
              technology
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="firstname"
                    type="text"
                    required
                    value={formData.firstname}
                    onChange={(e) =>
                      handleInputChange("firstname", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors"
                    placeholder="First name"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastname"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name *
                </label>
                <input
                  id="lastname"
                  type="text"
                  required
                  value={formData.lastname}
                  onChange={(e) =>
                    handleInputChange("lastname", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors pr-12"
                    placeholder="Min. 6 characters"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#edbf6d] focus:border-[#edbf6d] transition-colors"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#edbf6d] text-[#1b2e3f] py-3 rounded-lg font-semibold hover:bg-[#edbf6d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#1b2e3f] border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center">
              <span className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-[#edbf6d] hover:underline font-semibold"
                >
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="hidden lg:block flex-1">
        <img
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Modern Architecture"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default SignUp;
