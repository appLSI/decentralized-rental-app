// src/features/booking/components/BookingWidget.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Loader2, AlertCircle, LogIn, X } from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore, startOfToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { BookingService } from '../services/booking.services';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { formatPrice } from '@/features/properties/types/properties.types';

interface BookingWidgetProps {
    propertyId: string;
    pricePerNight: number;
    maxGuests: number;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
    propertyId,
    pricePerNight,
    maxGuests
}) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    const nights = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isBefore(end, start) || format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) return 0;
        return Math.max(0, differenceInDays(end, start));
    }, [startDate, endDate]);

    const subtotal = pricePerNight * nights;
    const serviceFee = subtotal * 0.05;
    const total = subtotal + serviceFee;

    const handleReserve = async () => {
        if (!isAuthenticated || !user?.types.includes("CLIENT")) {
            setShowAuthDialog(true);
            return;
        }

        if (!startDate || !endDate) {
            setError("Please select check-in and check-out dates.");
            return;
        }

        if (nights <= 0) {
            setError("Check-out date must be after check-in date.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const booking = await BookingService.createBooking({
                propertyId,
                startDate,
                endDate
            });

            toast({
                title: "Booking Initiated",
                description: "Your reservation has been created. Please proceed to payment.",
            });

            navigate(`/payment/${booking.id}`);
        } catch (err: any) {
            setError(err.message || "Failed to create booking");
            toast({
                title: "Booking Error",
                description: err.message || "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const today = format(startOfToday(), 'yyyy-MM-dd');

    const handleSignIn = () => {
        setShowAuthDialog(false);
        navigate('/signin');
    };
    const handleSignUp = () => {
        setShowAuthDialog(false);
        navigate('/signup');
    };


    return (
        <Card className="sticky top-24 shadow-xl">
            <CardHeader>
                <div className="flex items-baseline justify-between">
                    <div>
                        <span className="text-2xl font-bold">{formatPrice(pricePerNight)}</span>
                        <span className="text-gray-600 font-medium"> / night</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="check-in" className="text-[10px] font-bold uppercase text-gray-900">CHECK-IN</Label>
                        <Input
                            id="check-in"
                            type="date"
                            min={today}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="check-out" className="text-[10px] font-bold uppercase text-gray-900">CHECK-OUT</Label>
                        <Input
                            id="check-out"
                            type="date"
                            min={startDate || today}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="guests" className="text-[10px] font-bold uppercase text-gray-900">GUESTS</Label>
                    <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
                        <SelectTrigger id="guests">
                            <Users className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                                <SelectItem key={n} value={n.toString()}>
                                    {n} {n === 1 ? 'guest' : 'guests'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <Button
                    onClick={handleReserve}
                    disabled={isLoading}
                    className="w-full h-12 mt-6 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        "Reserve"
                    )}
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">You won't be charged yet</p>

                {nights > 0 && (
                    <div className="mt-6 space-y-3 pt-6 border-t border-gray-100">
                        <div className="flex justify-between text-gray-600">
                            <span className="underline">{formatPrice(pricePerNight)} x {nights} nights</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span className="underline">Service fee</span>
                            <span>{formatPrice(serviceFee)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 text-lg pt-3 border-t border-gray-100">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                )}

                {showAuthDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Sign in to book</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAuthDialog(false)}
                                    className="h-6 w-6 p-0"
                                >
                                    ✕
                                </Button>
                            </div>
                            <p className="text-gray-600 mb-6">
                                You need to be signed in to make a reservation. Sign in or create an account to continue.                            </p>
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
            </CardContent>
        </Card>
    );
};
