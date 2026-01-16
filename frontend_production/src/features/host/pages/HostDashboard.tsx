import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, FileText, CheckCircle, EyeOff, Edit } from 'lucide-react';
import { useHostStore } from '../hooks/useHostStore';
import { PropertyStatus } from '@/features/properties/types/properties.types';

const HostDashboard: React.FC = () => {
    const navigate = useNavigate();
    const {
        myProperties,
        loading: isLoading,
        fetchMyProperties,
        getPropertyStatusInfo
    } = useHostStore();

    useEffect(() => {
        fetchMyProperties();
    }, [fetchMyProperties]);

    // Derive stats from properties
    const stats = useMemo(() => {
        const counts: Record<PropertyStatus, number> = {
            ACTIVE: 0,
            PENDING: 0,
            DRAFT: 0,
            HIDDEN: 0,
            DELETED: 0
        };

        myProperties.forEach(p => {
            if (counts[p.status] !== undefined) {
                counts[p.status]++;
            }
        });

        return counts;
    }, [myProperties]);

    const activeProperties = useMemo(() => {
        return [...myProperties]
            .filter(p => p.status === 'ACTIVE' || p.status === 'PENDING')
            .sort((a, b) => new Date(b.lastUpdateAt).getTime() - new Date(a.lastUpdateAt).getTime())
            .slice(0, 4);
    }, [myProperties]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-6 md:p-10">
            <div className="max-w-[1400px] mx-auto space-y-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-black tracking-tighter">
                            Dashboard
                        </h1>
                        <p className="text-gray-500 font-medium text-lg max-w-xl">
                            Welcome back. Here's what's happening with your properties today.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/host/properties/create')}
                        className="rounded-full px-10 h-14 bg-black hover:bg-gray-800 text-white font-bold shadow-2xl transition-all gap-3 text-base"
                    >
                        <Plus className="w-6 h-6" />
                        New Listing
                    </Button>
                </div>

                {/* Stats Grid - Ultra Premium High Contrast Card */}
                <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/10 transition-colors duration-1000"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                        {/* Total Portfolio */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/5">
                                    <Home className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Portfolio</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-white tracking-tighter">{myProperties.length}</p>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    Total Listings <span className="h-1 w-1 rounded-full bg-gray-700"></span> Global
                                </p>
                            </div>
                        </div>

                        {/* Active Performance */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/5">
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                </div>
                                <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Live</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-white tracking-tighter">{stats.ACTIVE}</p>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    Active Now <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span> Public
                                </p>
                            </div>
                        </div>

                        {/* Pipeline */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/5">
                                    <FileText className="w-6 h-6 text-amber-400" />
                                </div>
                                <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Pipeline</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-white tracking-tighter">{stats.PENDING}</p>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2 text-amber-500/80">
                                    Reviewing <span className="h-1 w-1 rounded-full bg-amber-500"></span> Pending
                                </p>
                            </div>
                        </div>

                        {/* Draft State */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/5">
                                    <EyeOff className="w-6 h-6 text-gray-400" />
                                </div>
                                <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Workroom</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-white tracking-tighter">{stats.DRAFT}</p>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    Drafts <span className="h-1 w-1 rounded-full bg-gray-700"></span> Internal
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 gap-12">

                    {/* Active Properties Section */}
                    <div>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div>
                                <h2 className="text-3xl font-black text-black tracking-tight">Recent Inventory</h2>
                                <p className="text-gray-500 font-medium">Monitoring your most recently updated listings.</p>
                            </div>
                            <Button
                                onClick={() => navigate('/host/properties')}
                                variant="ghost"
                                className="rounded-full px-8 h-12 font-bold hover:bg-gray-100 transition-all text-black border-2 border-gray-100"
                            >
                                View Portfolio
                            </Button>
                        </div>

                        {isLoading && myProperties.length === 0 ? (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="space-y-4">
                                        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : activeProperties.length > 0 ? (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {activeProperties.map((property) => (
                                    <Card
                                        key={property.propertyId}
                                        className="group rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
                                        onClick={() => navigate(`/host/properties/${property.propertyId}`)}
                                    >
                                        <div className="aspect-[4/5] relative overflow-hidden">
                                            {property.imageFolderPath?.length > 0 ? (
                                                <img
                                                    src={property.imageFolderPath?.[0]}
                                                    alt={property.title}
                                                    className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full bg-gray-50 text-gray-200">
                                                    <Home className="h-20 w-20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                            <div className="absolute top-6 right-6">
                                                <Badge className={`${getPropertyStatusInfo(property.status).bgColor} ${getPropertyStatusInfo(property.status).color} border-0 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md`}>
                                                    {getPropertyStatusInfo(property.status).label}
                                                </Badge>
                                            </div>

                                            <div className="absolute bottom-8 left-8 right-8 text-white space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{property.type}</p>
                                                <h3 className="font-bold text-xl leading-tight line-clamp-2">{property.title}</h3>
                                                <div className="flex items-center justify-between pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="font-black text-2xl tracking-tighter">€{property.pricePerNight}<span className="text-xs font-bold text-gray-400 ml-1">/night</span></p>
                                                    <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                                                        <Edit className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-gray-200 p-20 text-center space-y-8">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-white shadow-inner flex items-center justify-center mx-auto">
                                    <Home className="w-16 h-16 text-gray-200" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-black">Your portfolio is empty</h3>
                                    <p className="text-gray-500 font-medium max-w-sm mx-auto">Start your journey as a host by listing your first exceptional property.</p>
                                </div>
                                <Button
                                    onClick={() => navigate('/host/properties/create')}
                                    className="bg-black text-white hover:bg-gray-800 rounded-full px-12 h-14 font-black shadow-2xl text-lg transition-all"
                                >
                                    List Your Space
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostDashboard;
