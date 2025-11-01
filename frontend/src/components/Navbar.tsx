import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Wallet,
  Settings,
  LogOut,
  UserCircle,
  Home,
  Plus,
  BarChart3,
  Newspaper,
  History,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useWallet } from "@/contexts/WalletContext";
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
  const { logout, user } = useAuthStore();
  const { walletAddress, connectWallet, disconnectWallet, isConnected } =
    useWallet();

  const navItems = [
    { name: "Browse Properties", path: "/browse", icon: Home },
    { name: "My Properties", path: "/my-properties", icon: Newspaper },
    { name: "Add Property", path: "/add-property", icon: Plus },
    { name: "Statistique", path: "/dashboard", icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#182a3a] sticky top-0 z-50 border-b border-[#2d4458] shadow-lg">
      <div className="px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/browse" className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-[#e7ae4c] flex items-center justify-center shadow-md">
              <span className="text-xl font-bold text-[#1b2e3f]">R</span>
            </div>
            <span className="text-2xl font-bold text-[#edbf6d] tracking-tight">
              RentChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-full px-4 font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d] hover:text-[#1b2e3f] shadow-md"
                        : "text-white hover:bg-[#2d4458] hover:text-[#edbf6d]"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-5">
            {/* Wallet Button */}
            <Button
              variant={isConnected ? "outline" : "default"}
              size="sm"
              onClick={isConnected ? disconnectWallet : connectWallet}
              className={`rounded-full font-medium border-2 transition-all duration-200 ${
                isConnected
                  ? "border-[#edbf6d] text-[#edbf6d] hover:bg-[#2d4458] hover:text-[#edbf6d]"
                  : "bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d] hover:text-[#1b2e3f] border-[#edbf6d] shadow-md"
              }`}
            >
              <Wallet className="h-4 w-4 mr-2" />
              {isConnected
                ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`
                : "Connect Wallet"}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <UserCircle className="text-white h-[36px] w-full cursor-pointer" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 bg-[#1b2e3f] border-[#2d4458] text-white"
              >
                <DropdownMenuLabel className="bg-[#2d4458]">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-[#edbf6d]">
                      {user?.firstname || "User"}
                    </p>
                    <p className="text-xs text-gray-300">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#2d4458]" />
                <DropdownMenuItem
                  asChild
                  className="text-white hover:bg-[#2d4458] hover:text-[#edbf6d] focus:bg-[#2d4458] focus:text-[#edbf6d]"
                >
                  <Link to="/profile" className="cursor-pointer">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="text-white hover:bg-[#2d4458] hover:text-[#edbf6d] focus:bg-[#2d4458] focus:text-[#edbf6d]"
                >
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2d4458]" />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-400 hover:bg-[#2d4458] hover:text-red-300 focus:bg-[#2d4458] focus:text-red-300 cursor-pointer"
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
              className="lg:hidden rounded-full hover:bg-[#2d4458] hover:text-[#edbf6d] transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-[#edbf6d]" />
              ) : (
                <Menu className="h-6 w-6 text-[#edbf6d]" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 bg-[#1b2e3f] border-t border-[#2d4458]">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`w-full justify-start rounded-lg font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-[#edbf6d] text-[#1b2e3f] hover:bg-[#edbf6d] hover:text-[#1b2e3f]"
                        : "text-white hover:bg-[#2d4458] hover:text-[#edbf6d]"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
            {/* Mobile Profile Options */}
            <div className="pt-4 border-t border-[#2d4458] space-y-2">
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-[#2d4458] hover:text-[#edbf6d] rounded-lg"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-[#2d4458] hover:text-[#edbf6d] rounded-lg"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start text-red-400 hover:bg-[#2d4458] hover:text-red-300 border-[#2d4458] rounded-lg"
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
