// src/features/booking/pages/MyBookingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Loader2, AlertCircle, ChevronRight, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Navbar } from '@/components/Layout/Navbar/Navbar';
import { BookingService } from '../services/booking.services';
import { Booking } from '../types/booking.types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { formatPrice } from '@/features/properties/types/properties.types';
import { Badge } from '@/components/ui/badge';

export default function MyBookingsPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    const isAdminOrHost = user?.roles?.some(role => ['ADMIN', 'AGENT', 'OWNER'].includes(role));
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchBookings = async () => {
            try {
                const data = await BookingService.getMyBookings();
                // Sort by creation date descending
                setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err: any) {
                setError(err.message || 'Failed to fetch bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [isAuthenticated, navigate]);

    const handleCancel = async (bookingId: number) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await BookingService.cancelBooking(bookingId);
            toast({
                title: "Booking Cancelled",
                description: "Your reservation has been successfully cancelled.",
            });
            // Update local state
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
        } catch (err: any) {
            toast({
                title: "Cancellation Failed",
                description: err.message || "Failed to cancel booking",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <Loader2 className="w-12 h-12 text-[#00AEEF] animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight">My Bookings</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage your reservations and payment status.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 text-red-700 mb-8">
                        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold">Error loading bookings</h3>
                            <p className="text-sm opacity-90">{error}</p>
                            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-3 border-red-200 hover:bg-red-100">
                                Try again
                            </Button>
                        </div>
                    </div>
                )}

                {!error && bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Calendar className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">No bookings yet</h2>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                            You haven't made any reservations. Explore properties to start booking!
                        </p>
                        <Button
                            onClick={() => navigate('/properties')}
                            className="mt-8 bg-[#00AEEF] hover:bg-[#0096ce] text-white px-8 py-6 rounded-2xl font-bold text-lg shadow-lg shadow-cyan-500/20"
                        >
                            Explore Properties
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
                            >
                                <div className="p-8 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-400 font-mono">#{booking.id}</span>
                                            <Badge className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${BookingService.getStatusBadgeClass(booking.status)}`}>
                                                {BookingService.getStatusDisplayName(booking.status)}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-gray-900">{formatPrice(booking.totalPrice)}</span>
                                            <p className="text-xs font-bold text-gray-400 uppercase mt-1">Total {booking.currency}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PROPERTY ID</p>
                                            <p className="font-bold text-gray-900 truncate max-w-[200px]">{booking.propertyId}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DATES</p>
                                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                                <span>{format(new Date(booking.startDate), 'MMM dd')}</span>
                                                <ChevronRight className="w-3 h-3 text-gray-300" />
                                                <span>{format(new Date(booking.endDate), 'MMM dd, yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">RESERVED ON</p>
                                            <p className="font-bold text-gray-700">{format(new Date(booking.createdAt), 'MMMM dd, yyyy')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-6 md:w-56 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100">
                                    {booking.status === 'AWAITING_PAYMENT' && (
                                        <Button
                                            onClick={() => navigate(`/payment/${booking.id}`)}
                                            className="w-full bg-[#00AEEF] hover:bg-[#0096ce] text-white font-bold rounded-2xl h-12"
                                        >
                                            Pay Now
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => isAdminOrHost ? navigate(`/host/properties/${booking.propertyId}/preview`) : navigate(`/properties/${booking.propertyId}`)}
                                        className="w-full border-gray-200 hover:bg-white text-gray-700 font-bold rounded-2xl h-12"
                                    >
                                        View Property
                                    </Button>
                                    {(booking.status === 'CONFIRMED' || booking.status === 'AWAITING_PAYMENT') && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="text-red-500 hover:text-red-600 text-sm font-bold mt-2 flex items-center justify-center gap-2 hover:underline transition-all"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <footer className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-400 text-sm">
                <p>© 2026 Decentralized Rentals. Security & Transparency via Blockchain.</p>
            </footer>
        </div>
    );
}
