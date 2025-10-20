// src/components/AuthModal.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  X,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Home,
  Key,
} from "lucide-react";

// Define Zod schemas for form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const registerSchema = z.object({
  firstname: z.string().min(1, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
});

const otpSchema = z.object({
  code: z.string().length(6, { message: "OTP must be 6 digits" }),
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [activeForm, setActiveForm] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Registration form state
  const [registerData, setRegisterData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    date_of_birth: "",
    address: "",
  });

  const navigate = useNavigate();
  const { login, register, verifyOtp, resendOtp } = useAuthStore();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  const validation = loginSchema.safeParse({ email, password });

  if (!validation.success) {
    validation.error.errors.forEach((error) => {
      toast({
        title: "Validation Error",
        description: error.message,
        variant: "destructive",
      });
    });
    setIsSubmitting(false);
    return;
  }

  try {
    const success = await login(email, password);
    if (success) {
      toast({
        title: "Welcome to RentChain!",
        description: "You have successfully logged in to your account.",
      });
      onClose();
      navigate("/browse");
    }
  } catch (error: any) {
    // This will now show the specific error message from the auth store
    toast({
      title: "Login Failed",
      description: error.message, // This will be the specific error message
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = registerSchema.safeParse(registerData);

    if (!validation.success) {
      validation.error.errors.forEach((error) => {
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive",
        });
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await register(registerData);
      if (success) {
        setEmail(registerData.email);
        setActiveForm('verify');
        toast({
          title: "Registration Successful!",
          description: "Please check your email for the verification code.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again with different credentials.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = otpSchema.safeParse({ code: otpCode });

    if (!validation.success) {
      validation.error.errors.forEach((error) => {
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive",
        });
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await verifyOtp(email, otpCode);
      if (success) {
        toast({
          title: "Email Verified!",
          description: "Your email has been verified. You can now login.",
        });
        setActiveForm('login');
        setOtpCode('');
        // Reset registration form
        setRegisterData({
          firstname: "",
          lastname: "",
          email: "",
          password: "",
          phone: "",
          country: "",
          city: "",
          state: "",
          date_of_birth: "",
          address: "",
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email);
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend",
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderAuthForm = () => {
    switch (activeForm) {
      case 'login':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold mb-2">Sign in to RentChain</h2>
              <p className="text-gray-300 text-base">
                Access your account to manage properties, rentals, and investments securely
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-xl text-base font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
              <p className="text-sm text-center text-gray-300 mt-4">
                New to RentChain?{" "}
                <button
                  type="button"
                  onClick={() => setActiveForm('register')}
                  disabled={isSubmitting}
                  className="text-indigo-400 hover:underline font-medium disabled:opacity-50"
                >
                  Create an account
                </button>
              </p>
            </form>
          </div>
        );

      case 'register':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveForm('login')}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <h2 className="text-3xl font-extrabold text-center flex-1">Join RentChain</h2>
            </div>
            <p className="text-gray-300 text-base text-center">
              Create your account to start managing properties and investments
            </p>
            <form onSubmit={handleRegister} className="space-y-4 max-h-96 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={registerData.firstname}
                    onChange={(e) => setRegisterData({...registerData, firstname: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    required
                    disabled={isSubmitting}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={registerData.lastname}
                    onChange={(e) => setRegisterData({...registerData, lastname: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    required
                    disabled={isSubmitting}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  required
                  disabled={isSubmitting}
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  required
                  disabled={isSubmitting}
                  placeholder="At least 8 characters"
                />
                <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters long</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <Phone className="inline h-3 w-3 mr-1" />
                    Phone
                  </label>
                  <input
                    type="text"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    disabled={isSubmitting}
                    placeholder="+212612345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    Country
                  </label>
                  <input
                    type="text"
                    value={registerData.country}
                    onChange={(e) => setRegisterData({...registerData, country: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    disabled={isSubmitting}
                    placeholder="Morocco"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={registerData.city}
                    onChange={(e) => setRegisterData({...registerData, city: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    disabled={isSubmitting}
                    placeholder="Casablanca"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    State/Region
                  </label>
                  <input
                    type="text"
                    value={registerData.state}
                    onChange={(e) => setRegisterData({...registerData, state: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    disabled={isSubmitting}
                    placeholder="Casablanca-Settat"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={registerData.date_of_birth}
                  onChange={(e) => setRegisterData({...registerData, date_of_birth: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <Home className="inline h-3 w-3 mr-1" />
                  Address
                </label>
                <input
                  type="text"
                  value={registerData.address}
                  onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  disabled={isSubmitting}
                  placeholder="123 Avenue Mohammed V"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-xl text-base font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
              
              <p className="text-sm text-center text-gray-300 mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveForm('login')}
                  disabled={isSubmitting}
                  className="text-indigo-400 hover:underline font-medium disabled:opacity-50"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        );

      case 'verify':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveForm('register')}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <h2 className="text-3xl font-extrabold text-center flex-1">Verify Your Email</h2>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-300 text-base mb-2">
                We sent a verification code to
              </p>
              <p className="text-indigo-400 font-semibold text-base">{email}</p>
            </div>
            
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Enter 6-digit verification code
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  required
                  disabled={isSubmitting}
                  maxLength={6}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || otpCode.length !== 6}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-xl text-base font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </button>
              
              <div className="text-center space-y-2">
                <p className="text-gray-300 text-sm">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSubmitting}
                    className="text-indigo-400 hover:underline font-medium disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => setActiveForm('login')}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        {renderAuthForm()}
      </div>
    </div>
  );
};

export default AuthModal;