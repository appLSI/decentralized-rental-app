import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Home, CheckCircle, Clock, DollarSign, Eye, TrendingUp, MoreVertical, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAdminStore } from '../hooks/useAdminStore';
import { PropertiesService } from '@/features/properties/services/properties.services';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const { fetchPendingProperties, fetchAgents, pendingProperties, agents, loading, validateProperty, rejectProperty } = useAdminStore();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalProperties: 0,
        pendingProperties: 0,
        totalAgents: 0,
    });

    // Dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: 'approve' | 'reject' | null;
        propertyId: string | null;
        title: string;
    }>({
        open: false,
        type: null,
        propertyId: null,
        title: '',
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                if (user?.roles?.[0] === 'ADMIN') {
                    const [pendingResp, agents, totalCount] = await Promise.all([
                        fetchPendingProperties(0, 5),
                        fetchAgents(),
                        PropertiesService.getTotalPropertiesCount()
                    ]);

                    setStats(prev => ({
                        ...prev,
                        totalProperties: totalCount,
                        pendingProperties: pendingResp.totalElements,
                        totalAgents: agents.length,
                    }));
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };
        if (user) loadData();
    }, [user, fetchPendingProperties, fetchAgents]);


    const handleApproveClick = (id: string, title: string) => {
        setConfirmDialog({
            open: true,
            type: 'approve',
            propertyId: id,
            title,
        });
    };

    const handleRejectClick = (id: string, title: string) => {
        setConfirmDialog({
            open: true,
            type: 'reject',
            propertyId: id,
            title,
        });
    };

    const handleConfirmAction = async () => {
        const { type, propertyId } = confirmDialog;
        if (!propertyId) return;

        if (type === 'approve') {
            await validateProperty(propertyId);
        } else if (type === 'reject') {
            await rejectProperty(propertyId, { reason: 'Refusé depuis le tableau de bord' });
        }

        setConfirmDialog({ open: false, type: null, propertyId: null, title: '' });
    };

    if (!user) return null;

    const isAdmin = user.roles[0] === 'ADMIN';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-6 md:p-10">
            <div className="max-w-[1400px] mx-auto space-y-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-black tracking-tighter">
                            Admin Console
                        </h1>
                        <p className="text-gray-500 font-medium text-lg max-w-xl">
                            Bonjour, {user.firstname}. Monitoring platform performance and pending approvals.
                        </p>
                    </div>
                    {isAdmin && (
                        <Button
                            onClick={() => navigate('/admin/agents')}
                            className="rounded-full px-10 h-14 bg-black hover:bg-gray-800 text-white font-bold shadow-2xl transition-all gap-3 text-base"
                        >
                            <Users className="w-6 h-6" />
                            Manage Agents
                        </Button>
                    )}
                </div>

                {/* Stats Grid - Ultra Premium High Contrast Card */}
                <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/10 transition-colors duration-1000"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
                        {/* Portfolio */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/5">
                                    <Home className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Portfolio</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-white tracking-tighter">{stats.totalProperties}</p>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    Total Listings <span className="h-1 w-1 rounded-full bg-gray-700"></span> Global
                                </p>
                            </div>
                        </div>

                        {/* Pipeline */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/5">
                                    <Clock className="w-6 h-6 text-amber-400" />
                                </div>
                                <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Pipeline</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-white tracking-tighter">{stats.pendingProperties}</p>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2 text-amber-500/80">
                                    Reviewing <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse"></span> Pending
                                </p>
                            </div>
                        </div>

                        {/* Team */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/5">
                                    <Users className="w-6 h-6 text-cyan-400" />
                                </div>
                                <span className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Team</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-5xl font-black text-white tracking-tighter">{stats.totalAgents}</p>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                    Active Agents <span className="h-1 w-1 rounded-full bg-cyan-500"></span> Staff
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Pending Properties Section */}
                    <div className="w-full space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h2 className="text-3xl font-black text-black tracking-tight">Pending Approvals</h2>
                                <p className="text-gray-500 font-medium font-medium">Verify and validate new property listings.</p>
                            </div>
                            <Button
                                onClick={() => navigate('/admin/properties')}
                                variant="ghost"
                                className="rounded-full px-8 h-12 font-bold hover:bg-gray-100 transition-all text-black border-2 border-gray-100"
                            >
                                View All
                            </Button>
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/20 shadow-xl overflow-hidden">
                            <div className="p-8">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((n) => (
                                            <Skeleton key={n} className="h-24 w-full rounded-2xl" />
                                        ))}
                                    </div>
                                ) : pendingProperties.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Property</th>
                                                    <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Location</th>
                                                    <th className="text-left py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rate</th>
                                                    <th className="text-right py-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {pendingProperties.slice(0, 5).map((property) => (
                                                    <tr key={property.propertyId} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-6 px-4">
                                                            <div>
                                                                <p className="font-bold text-black text-lg">{property.title}</p>
                                                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">{property.type}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <p className="text-gray-600 font-medium">{property.city}, {property.country}</p>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <p className="font-black text-black">€{property.pricePerNight}</p>
                                                        </td>
                                                        <td className="py-6 px-4 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <Button
                                                                    onClick={() => handleApproveClick(property.propertyId, property.title)}
                                                                    className="bg-black text-white hover:bg-gray-800 rounded-full px-6 h-10 font-bold text-xs shadow-lg"
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleRejectClick(property.propertyId, property.title)}
                                                                    variant="ghost"
                                                                    className="rounded-full px-6 h-10 font-bold text-xs border-2 border-gray-100 hover:bg-gray-100"
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 space-y-6">
                                        <div className="h-20 w-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mx-auto">
                                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-black text-black">Inbox Cleared</h3>
                                            <p className="text-gray-500 font-medium">All properties have been processed.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
            >
                <AlertDialogContent className="rounded-[2.5rem] bg-white/95 backdrop-blur-2xl border-white/20 shadow-2xl p-10 max-w-md">
                    <AlertDialogHeader className="space-y-6">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${confirmDialog.type === 'approve' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                            }`}>
                            <AlertCircle className="h-8 h-8" />
                        </div>
                        <div className="space-y-2 text-center">
                            <AlertDialogTitle className="text-2xl font-black text-black tracking-tight">
                                {confirmDialog.type === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500 font-medium text-base">
                                Êtes-vous sûr de vouloir {confirmDialog.type === 'approve' ? 'approuver' : 'rejeter'} la propriété <span className="text-black font-bold">"{confirmDialog.title}"</span> ?
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-4 sm:justify-center pt-8">
                        <AlertDialogCancel className="flex-1 rounded-full h-12 font-bold border-2 border-gray-100 hover:bg-gray-100 text-black">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmAction}
                            className={`flex-1 rounded-full h-12 font-bold text-white shadow-xl ${confirmDialog.type === 'approve'
                                ? 'bg-black hover:bg-gray-800'
                                : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {confirmDialog.type === 'approve' ? 'Approuver' : 'Rejeter'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminDashboard;
