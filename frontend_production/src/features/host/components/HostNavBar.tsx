import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Plus,
    Home,
    Menu,
    X,
    Settings,
    LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useProfileStore } from '@/features/settings/store/profile.store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/Logo';
import { WalletConnectButton } from '@/components/Layout/Navbar/WalletConnectButton';

const HostNavBar: React.FC = () => {
    const { user: profileUser } = useProfileStore();
    const { isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        {
            title: 'Dashboard',
            path: '/host/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'List Property',
            path: '/host/properties/create',
            icon: Plus,
        },
        {
            title: 'Portfolio',
            path: '/host/properties',
            icon: Home,
        },
    ];

    const handleLogout = () => {
        logout();
        window.location.replace('/signin');
    };

    if (!isAuthenticated) return null;

    return (
        <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 px-6 py-5 lg:px-10">
            <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Link to="/host/dashboard" className="transition-all hover:scale-105 active:scale-95">
                        <Logo size="md" textcolor='white' />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map(
                        (item) =>
                        (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/host/properties'}
                                className={({ isActive }) =>
                                    `px-6 py-2.5 rounded-full transition-all duration-500 text-[10px] font-black uppercase tracking-[0.2em] ${isActive
                                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`
                                }
                            >
                                {item.title}
                            </NavLink>

                        )
                    )}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-4">
                    <div className="scale-90 lg:scale-100">
                        <WalletConnectButton />
                    </div>

                    {/* Settings Button - Desktop */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex h-11 w-11 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                        onClick={() => navigate('/host/settings')}
                    >
                        <Settings className="h-5 w-5" />
                    </Button>


                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white hover:bg-white/10 rounded-2xl h-11 w-11 border border-white/10"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 border-b border-white/10 bg-black/95 backdrop-blur-2xl p-6 md:hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-3">
                        {navItems.map(
                            (item) =>
                            (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/host/properties'}
                                    className={({ isActive }) =>
                                        `px-6 py-2.5 rounded-full transition-all duration-500 text-[10px] font-black uppercase tracking-[0.2em] ${isActive
                                            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {item.title}
                                </NavLink>

                            )
                        )}

                        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-4 rounded-2xl px-5 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                                onClick={() => {
                                    navigate('/host/settings');
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-4 rounded-2xl px-5 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default HostNavBar;
