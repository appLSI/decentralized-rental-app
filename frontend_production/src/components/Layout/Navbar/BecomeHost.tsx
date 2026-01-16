// Updated BecomeHost component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, CheckCircle, User, Info } from "lucide-react";

interface BecomeHostProps {
  onClose: () => void;
  onSignIn: () => void;
  isAuthenticated: boolean;
  onContinue: () => void;
}

export function BecomeHost({
  onClose,
  onSignIn,
  isAuthenticated,
  onContinue,
}: BecomeHostProps) {
  // Not authenticated - show simple sign in
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-[#182a3a] rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2">Become a Host</h3>
            <p className="text-gray-600 text-sm mb-4">
              Sign in to start hosting on DecentRent
            </p>
            <div className="space-y-2">
              <Button
                onClick={onSignIn}
                className="w-full bg-primary text-white hover:bg-primary/90"
              >
                Sign In
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-lg">Become a Host</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Section */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-xl">Welcome to Hosting</h3>
            <p className="text-gray-600">
              By using this feature, you'll be able to list your property and become a host.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Important Note:</p>
                  <p className="text-xs text-blue-700">
                    After you successfully create your first property, you will automatically become a verified host on our platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Set your own rental prices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Flexible availability calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Secure blockchain payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Automatic host verification</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            Continue to Create Property
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>

          <p className="text-xs text-gray-500 text-center">
            You can manage your host settings anytime from your profile
          </p>
        </CardContent>
      </Card>
    </div>
  );
}