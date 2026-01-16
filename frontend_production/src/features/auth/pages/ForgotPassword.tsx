// src/pages/ForgotPassword.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await forgotPassword({ email: email });
      setSuccess("Password reset instructions have been sent to your email!");

      // Redirect to reset password page with email as state
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1000);
    } catch (error: any) {
      setError(
        error.message || "Failed to send reset instructions. Please try again."
      );
    }
  };

  const handleBackToLogin = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-6">
      {/* Logo outside the card at top center */}
      <div className="flex justify-center mb-8">
        <Logo size="lg" className="text-navy-deep" />
      </div>

      <Card className="w-full max-w-md border border-slate-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-navy-deep">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Enter your email address and we'll send you instructions to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8 px-6">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-white border-slate-300 focus:border-navy-deep focus:ring-2 focus:ring-navy-deep/20"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-navy-deep text-white hover:bg-navy-deep/90 h-11 text-sm font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Instructions...
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>

            <div className="text-center pt-4">
              <span className="text-sm text-slate-500">
                Remember your password?{" "}
                <Link
                  to="/signin"
                  className="text-navy-deep hover:text-navy-deep/80 font-semibold hover:underline"
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

export default ForgotPassword;