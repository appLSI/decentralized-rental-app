import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Key } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Logo from "@/components/Logo";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get email from navigation state or query params AND enforce flow
  useEffect(() => {
    // 1. Try to get email from state
    let retrievedEmail = location.state?.email;

    // 2. Alternatively, try to get email from URL query params (for link-based resets)
    const urlParams = new URLSearchParams(location.search);
    const emailFromParams = urlParams.get('email');

    if (emailFromParams) {
      retrievedEmail = emailFromParams;
    }

    // 3. Set email or enforce redirect
    if (retrievedEmail) {
      setEmail(retrievedEmail);
    } else {
      // If no email is found in state or URL params, redirect to signin
      navigate("/signin", { replace: true });
    }
  }, [location, navigate]); // Added navigate to dependency array for useEffect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.token || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!email) {
      // This error should theoretically be caught by useEffect, 
      // but it's a good safety net for form submission
      setError("Email is required. Redirecting to sign in...");
      setTimeout(() => navigate("/signin", { replace: true }), 1000);
      return;
    }

    try {
      await resetPassword({
        email: email,
        code: formData.token,
        newPassword: formData.password,
      });

      setSuccess("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Failed to reset password. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleBackToForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-4">
      {/* Back Button */}
      <div className="w-full max-w-sm mb-2">
        <Button
          variant="ghost"
          onClick={handleBackToForgotPassword}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forgot Password
        </Button>
      </div>

      {/* Logo outside the card at top center */}
      <div className="flex justify-center mb-4">
        <Logo size="md" className="text-navy-deep" />
      </div>

      <Card className="w-full max-w-sm border border-slate-200 shadow-lg">
        <CardHeader className="text-center pb-2 space-y-1">
          <CardTitle className="text-xl font-bold text-navy-deep">
            Reset Password
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            {email ? `Enter the reset token sent to ${email}` : "Enter your reset token and new password"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-6 px-4">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-4 py-2">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200 py-2">
              <AlertDescription className="text-green-800 text-sm">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reset Token Field */}
            <div className="space-y-1">
              <Label htmlFor="token" className="text-xs font-medium text-slate-700">
                Reset Token
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
                <Input
                  id="token"
                  type="text"
                  required
                  value={formData.token}
                  onChange={(e) => handleInputChange("token", e.target.value)}
                  className="pl-8 h-9 text-sm bg-white border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20"
                  placeholder="Enter reset token"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-8 pr-10 h-9 text-sm bg-white border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20"
                  placeholder="Min. 6 characters"
                  minLength={6}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-8 pr-10 h-9 text-sm bg-white border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20"
                  placeholder="Confirm password"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-navy-deep text-white hover:bg-navy-deep/90 h-9 text-sm font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">
                Remember your password?{" "}
                <Link
                  to="/signin"
                  className="text-navy-deep hover:text-navy-deep/80 font-semibold hover:underline text-xs"
                >
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;