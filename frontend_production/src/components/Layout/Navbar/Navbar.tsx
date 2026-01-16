// Navbar.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Menu,
  Home,
  Calendar,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProfileStore } from "@/features/settings/store/profile.store";

import Logo from "@/components/Logo";
import { BecomeHost } from "./BecomeHost";
import { WalletConnectButton } from "./WalletConnectButton";

export const Navbar = () => {
  const navigate = useNavigate();
  const [showBecomeHost, setShowBecomeHost] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { user: profileUser } = useProfileStore();

  const handleBecomeHost = () => {
    if (isAuthenticated) {
      setShowBecomeHost(true);
    } else {
      setShowSignInPopup(true);
    }
  };

  const handleSignIn = () => {
    setShowBecomeHost(false);
    setShowSignInPopup(false);
    navigate("/signin");
  };

  const handleSignUp = () => {
    setShowBecomeHost(false);
    setShowSignInPopup(false);
    navigate("/signup");
  };

  const handleSettings = () => navigate("/settings");

  const handleMyBookings = () => navigate("/my-bookings");

  const handleDisconnect = () => {
    logout();
    window.location.href = '/';

  };

  // Safely get display email with fallbacks
  const getDisplayEmail = (): string => {
    if (profileUser?.email) {
      return profileUser.email;
    }
    return "user@example.com";
  };

  // Safely get display initial with fallbacks
  const getDisplayInitial = (): string => {
    if (profileUser?.firstname) {
      return profileUser.firstname.charAt(0).toUpperCase();
    }

    const email = getDisplayEmail();
    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }

    return "U";
  };

  // Safely get display name
  const getDisplayName = (): string => {
    return profileUser?.firstname || "User";
  };

  const displayEmail = getDisplayEmail();
  const displayInitial = getDisplayInitial();
  const displayName = getDisplayName();

  return (
    <>
      <nav className="relative z-50 flex items-center justify-between bg-gradient-to-r from-[#0F172A] to-slate-900 px-6 py-4 lg:px-10">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <Logo size="md" textcolor="white" iconColor="#22d3ee" />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Wallet Connect Button - Always visible */}
          <WalletConnectButton
            onUnauthenticatedClick={() => setShowSignInPopup(true)}
          />

          {isAuthenticated && user?.types.includes("CLIENT") ? (
            // AUTHENTICATED UI
            <div className="flex items-center gap-4">


              {/* Profile Dropdown Menu with Hamburger Icon */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 p-0 flex items-center justify-center text-white hover:bg-white/10 rounded-full"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-brand-blue text-white text-sm font-semibold">
                          {displayInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col leading-none">
                        <span className="text-sm font-medium text-foreground">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {displayEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleMyBookings}
                    className="text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 mr-2" /> My Bookings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleBecomeHost}
                    className="text-primary hover:bg-primary/10 cursor-pointer"
                  >
                    <Home className="w-4 h-4 mr-2" /> Become Host
                  </DropdownMenuItem>


                  <DropdownMenuItem
                    onClick={handleSettings}
                    className="text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </DropdownMenuItem>


                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    className="text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            // NOT AUTHENTICATED UI - Only Hamburger Menu
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="
        h-10 w-10 p-0 flex items-center justify-center
        text-white
        hover:bg-white/10
        rounded-full
        transition-colors
      "
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="
      w-64
      bg-navy-deep
      border border-white/10
      rounded-xl
      shadow-xl
      p-2
    "
              >
                {/* User Info */}
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className="
              bg-primary-cyan/20
              text-primary-cyan
              text-sm
              font-semibold
            "
                      >
                        ?
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-white">
                        Guest
                      </span>
                      <span className="text-xs text-white/60">
                        Not signed in
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-white/10 my-2" />

                {/* Actions */}
                <DropdownMenuItem
                  onClick={handleSignIn}
                  className="
        text-white
        rounded-lg
        px-3 py-2
        cursor-pointer
        transition-colors
        hover:bg-white/10
      "
                >
                  Sign In
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleSignUp}
                  className="
        mt-1
        text-primary-cyan
        font-medium
        rounded-lg
        px-3 py-2
        cursor-pointer
        transition-all
        hover:bg-primary-cyan/15
      "
                >
                  Sign Up
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          )}
        </div>
      </nav>

      {showBecomeHost && (
        <BecomeHost
          onClose={() => setShowBecomeHost(false)}
          onSignIn={handleSignIn}
          isAuthenticated={isAuthenticated}
          onContinue={() => {
            setShowBecomeHost(false);
            navigate("/become-host/properties/create");
          }}
        />
      )}

      {/* Sign In Popup for Wallet Connect */}
      {showSignInPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Connect Wallet</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignInPopup(false)}
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
            <p className="text-gray-600 mb-6">
              Please sign in to connect your wallet and access all features.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleSignIn}
                className="w-full bg-navy-deep text-white hover:bg-navy-deep/90"
              >
                Sign In
              </Button>
              <Button
                onClick={handleSignUp}
                className="w-full bg-White text-black border-primary"
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};