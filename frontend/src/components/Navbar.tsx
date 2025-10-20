import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Wallet,
  User,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useWallet } from "@/contexts/WalletContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuthStore(); // Assuming you have user data in authStore
  const { walletAddress, connectWallet, disconnectWallet, isConnected } =
    useWallet();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: "Browse Properties", path: "/browse" },
    { name: "My Properties", path: "/my-properties" },
    { name: "Add Property", path: "/add-property" },
    { name: "Statistique", path: "/dashboard" },
    { name: "Rental History", path: "/rental-history" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 border-b">
      <div className="px-20 px-3">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/browse" className="flex items-center space-x-2">
            <div className="gradient-primary h-10 w-10 rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-xl font-bold text-primary-foreground">
                R
              </span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RentChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={isActive(item.path) ? "gradient-primary" : ""}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle - Optional: Remove if you don't want it */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Wallet Button */}
            <Button
              variant={isConnected ? "outline" : "default"}
              size="sm"
              onClick={isConnected ? disconnectWallet : connectWallet}
              className={!isConnected ? "gradient-accent" : ""}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnected
                ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`
                : "Connect Wallet"}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.firstname || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
              >
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive(item.path) ? "gradient-primary" : ""
                  }`}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            {/* Mobile Profile Options */}
            <div className="pt-2 border-t">
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
