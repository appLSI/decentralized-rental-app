import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Menu,
    X,
    Home,
    Settings,
    LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/Logo';

const AdminNavbar: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = user?.roles?.includes('ADMIN');

    const navItems = [
        {
            title: 'Dashboard',
            path: '/admin/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Propriétés',
            path: '/admin/properties',
            icon: Home,
            hidden: !isAdmin,
        },
        {
            title: 'Agents',
            path: '/admin/agents',
            icon: Users,
            hidden: !isAdmin,
        },
    ];

    const handleLogout = () => {
        logout();
        window.location.replace('/signin');
    };

    return (
        <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 px-6 py-5 lg:px-10">
            <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Link to="/admin/dashboard" className="transition-all hover:scale-105 active:scale-95">
                        <Logo size="md" textcolor='white' />
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-2">
                    {navItems.map(
                        (item) =>
                            !item.hidden && (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
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

                    {/* Settings Button - Desktop */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex h-11 w-11 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                        onClick={() => navigate('/admin/settings')}
                    >
                        <Settings className="h-5 w-5" />
                    </Button>

                    {/* Profile Avatar */}
                    <Button
                        variant="ghost"
                        className="relative h-11 w-11 rounded-full p-0 hover:bg-white/10 transition-all"
                        onClick={() => navigate('/admin/settings')}
                    >
                        <Avatar className="h-11 w-11 border-2 border-white/10">
                            <AvatarImage src="" alt={user?.firstname} />
                            <AvatarFallback className="bg-white text-black font-bold">
                                {user?.firstname?.[0]}
                                {user?.lastname?.[0]}
                            </AvatarFallback>
                        </Avatar>
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
                                !item.hidden && (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
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
                                    navigate('/admin/settings');
                                    setIsMobileMenuOpen(false);
                                }}
                            >
                                <Settings className="h-4 w-4" />
                                Paramètres
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-4 rounded-2xl px-5 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default AdminNavbar;
