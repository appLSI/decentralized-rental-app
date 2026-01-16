import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Loader2,
    ShieldCheck,
    CreditCard,
    ArrowLeft,
    Info,
    CheckCircle2,
    AlertCircle,
    Copy,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

import { Navbar } from '@/components/Layout/Navbar/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

import { BookingService } from '@/features/booking/services/booking.services';
import { Booking } from '@/features/booking/types/booking.types';
import { validatePaymentWithRetry } from '../services/payment.services';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { PaymentButton } from '../components/PaymentButton';
import { formatPrice } from '@/features/properties/types/properties.types';

import { WEB3_CONFIG } from '@/blockchain/config';
import { getETHPrice, convertFiatToETH } from '@/blockchain/converter';
import { ContractStatus } from '@/features/payment/types/payment.types';

export default function PaymentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [ethPrice, setEthPrice] = useState<number>(0);
    const [ethAmount, setEthAmount] = useState<string>("0.0000");

    useEffect(() => {
        if (!id) return;

        const fetchBookingAndPrice = async () => {
            try {
                const [bookingData, price] = await Promise.all([
                    BookingService.getBookingById(parseInt(id)),
                    getETHPrice('mad')
                ]);

                setBooking(bookingData);
                setEthPrice(price);

                const totalInFiat = bookingData.totalPrice * 1.05;
                const ethAmount = await convertFiatToETH(totalInFiat, 'usd');
                setEthAmount(ethAmount);

                if (bookingData.status === 'CONFIRMED') {
                    setPaymentSuccess(true);
                }
            } catch (err: unknown) {
                const error = err as { message?: string };
                setError(error.message || 'Failed to fetch payment details');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingAndPrice();
    }, [id]);

    const handlePaymentSuccess = async (txHash: string) => {
        if (!booking || !token || !id) return;

        setIsValidating(true);
        try {
            const totalPayment = booking.totalPrice * 1.05;
            await validatePaymentWithRetry({
                bookingId: parseInt(id),
                transactionHash: txHash,
                contractAddress: WEB3_CONFIG.CONTRACT_ADDRESS,
                expectedAmount: totalPayment
            }, token);

            setPaymentSuccess(true);
            toast({
                title: "Payment Verified",
                description: "The backend has confirmed your payment. Your booking is now confirmed!",
            });
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast({
                title: "Validation Error",
                description: error.message || "Failed to verify payment with backend. Please contact support with your TX Hash.",
                variant: "destructive"
            });
        } finally {
            setIsValidating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Address copied to clipboard",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFDFD]">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                    <Loader2 className="w-12 h-12 text-[#00AEEF] animate-spin" />
                    <p className="mt-4 text-gray-500 font-medium">Securing your payment session...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-[#FDFDFD]">
                <Navbar />
                <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl shadow-xl border border-gray-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                    <p className="text-gray-500 mb-8">{error || "Booking not found"}</p>
                    <Button onClick={() => navigate('/my-bookings')} className="w-full bg-gray-900 hover:bg-black rounded-2xl h-12">
                        Back to My Bookings
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 font-semibold group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Bookings
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout</h1>
                            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-cyan-200 bg-cyan-50 text-cyan-700 font-bold">
                                SECURE ESCROW
                            </Badge>
                        </div>

                        {paymentSuccess ? (
                            <Card className="border-green-100 bg-green-50/30 rounded-3xl overflow-hidden shadow-sm">
                                <CardContent className="p-10 text-center">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-4">Payment Successful!</h2>
                                    <p className="text-gray-600 max-w-sm mx-auto mb-8 text-lg">
                                        Your booking for property <span className="font-bold text-gray-900">#{booking.propertyId}</span> is now fully confirmed on the blockchain.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button
                                            onClick={() => navigate(`/properties/${booking.propertyId}`)}
                                            className="bg-gray-900 hover:bg-black text-white px-8 h-12 rounded-2xl font-bold"
                                        >
                                            View Property
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate('/my-bookings')}
                                            className="border-gray-200 hover:bg-white text-gray-700 px-8 h-12 rounded-2xl font-bold"
                                        >
                                            Manage Bookings
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-4 text-gray-900">
                                        <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-[#00AEEF]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold italic">Blockchain Transaction</h3>
                                            <p className="text-sm text-gray-500 font-medium">Funds will be held in a secure Escrow contract</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Contract Address</span>
                                            <div className="flex items-center gap-2">
                                                <code className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-mono text-slate-600">
                                                    {WEB3_CONFIG.CONTRACT_ADDRESS.slice(0, 6)}...{WEB3_CONFIG.CONTRACT_ADDRESS.slice(-4)}
                                                </code>
                                                <button onClick={() => copyToClipboard(WEB3_CONFIG.CONTRACT_ADDRESS)} className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-400">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Network</span>
                                            <span className="font-bold text-slate-900">Sepolia (ETH)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-medium">Booking ID</span>
                                            <span className="font-bold text-slate-900">{booking.id}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        {isValidating ? (
                                            <div className="text-center py-6 space-y-4">
                                                <Loader2 className="w-10 h-10 text-[#00AEEF] animate-spin mx-auto" />
                                                <p className="font-bold text-gray-900">Confirming Payment on Server...</p>
                                                <p className="text-sm text-gray-500">This may take a few seconds as we verify the block.</p>
                                            </div>
                                        ) : (
                                            <PaymentButton
                                                bookingId={booking.id}
                                                propertyId={booking.propertyId}
                                                amount={ethAmount}
                                                onSuccess={handlePaymentSuccess}
                                                onError={(err) => console.log("UI error handler:", err)}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-800 text-sm">
                                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
                                    <div>
                                        <p className="font-bold mb-1">How it works</p>
                                        <p className="opacity-80">Your funds are deposited into a <span className="font-bold">RentalEscrowMulti</span> smart contract. They are only released to the host once the lease completes and no disputes are raised.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
                            <div className="bg-gray-900 p-8 text-white">
                                <h3 className="text-xl font-bold mb-1 italic tracking-tight">Order Summary</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Booking #{booking.id}</p>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Price per night</span>
                                        <span className="font-bold text-gray-900">{formatPrice(booking.pricePerNight)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Dates</span>
                                        <span className="font-bold text-gray-900">
                                            {format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Service Fee (5%)</span>
                                        <span className="font-bold text-gray-900">{formatPrice(booking.totalPrice * 0.05)}</span>
                                    </div>
                                </div>

                                <Separator className="bg-gray-100" />

                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-black text-gray-900 italic">Total</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-[#00AEEF] tracking-tighter">{ethAmount} ETH</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            1 ETH ≈ {formatPrice(ethPrice)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-0">
                                <div className="w-full bg-gray-50 p-6 flex items-center justify-center gap-2 border-t border-gray-100">
                                    <ShieldCheck className="w-4 h-4 text-green-500" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trustless Blockchain verification</span>
                                </div>
                            </CardFooter>
                        </Card>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Powered by</p>
                            <div className="flex justify-center items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all cursor-default pb-2">
                                <img src="https://cryptologos.cc/logos/etherscan-logo.png" alt="Etherscan" className="h-4" />
                                <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="Ethereum" className="h-5" />
                                <img src="https://cryptologos.cc/logos/metamask-logo.png" alt="MetaMask" className="h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
