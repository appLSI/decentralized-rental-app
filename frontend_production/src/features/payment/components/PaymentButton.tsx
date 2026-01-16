import React, { useState } from 'react';
import { Loader2, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createBooking, payRent } from '@/blockchain/rentalEscrow';
import { waitForPaymentReceivedEvent } from '@/blockchain/events';
import { toast } from '@/components/ui/use-toast';
import { useWalletStore } from '@/shared/stores/wallet.store';
import { PropertiesService } from '@/features/properties/services/properties.services';

interface PaymentButtonProps {
    bookingId: number;
    propertyId: string;      // new
    amount: string;
    onSuccess: (txHash: string) => void;
    onError: (error: string) => void;
}


export const PaymentButton: React.FC<PaymentButtonProps> = ({
    bookingId,
    propertyId,
    amount,
    onSuccess,
    onError
}) => {
    const { isConnected, connect, walletAddress } = useWalletStore();
    const [status, setStatus] = useState<'idle' | 'processing' | 'waiting' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!window.ethereum) {
            toast({
                title: "MetaMask Required",
                description: "Please install MetaMask to make a payment",
                variant: "destructive"
            });
            return;
        }

        if (!isConnected) {
            try {
                await connect();
            } catch (err: unknown) {
                const error = err as { message?: string };
                toast({
                    title: "Wallet Connection Failed",
                    description: error.message || "Could not connect wallet",
                    variant: "destructive"
                });
                return;
            }
        }

        if (!amount || bookingId === 0) {
            toast({
                title: "Invalid Payment Details",
                description: "Booking ID or amount is missing.",
                variant: "destructive"
            });
            return;
        }

        setStatus('processing');
        try {
            const bookingId = Date.now(); // unique for each booking

            // const ownerAddress = await PropertiesService.getOwnerWalletByPropertyId(propertyId);
            // 1️⃣ Create the booking on-chain
            console.log(bookingId, walletAddress, "0xf129b3e7278b58226371b363ba28b13435c538b7", amount);

            await createBooking(bookingId, walletAddress, "0xf129b3e7278b58226371b363ba28b13435c538b7", amount);

            // 2️⃣ Pay rent
            const receipt = await payRent(bookingId, amount);
            setTxHash(receipt.txHash);
            setStatus('waiting');

            await waitForPaymentReceivedEvent();

            setStatus('success');
            onSuccess(receipt.txHash);

            toast({
                title: "Payment Confirmed",
                description: "Your payment has been successfully processed on the blockchain.",
            });
        } catch (err: unknown) {
            console.error("Payment error:", err);
            setStatus('error');
            const error = err as { message?: string };
            const errorMessage = error.message || "An error occurred during the transaction";
            onError(errorMessage);
            toast({
                title: "Payment Failed",
                description: errorMessage,
                variant: "destructive"
            });
        }

    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <Button
                onClick={handlePayment}
                disabled={status === 'processing' || status === 'waiting' || status === 'success'}
                className={`w-full h-14 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${status === 'success'
                    ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                    : 'bg-[#00AEEF] hover:bg-[#0096ce] shadow-cyan-500/20'
                    }`}
            >
                {status === 'idle' && (
                    <span className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Pay {amount} ETH
                    </span>
                )}
                {status === 'processing' && (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirming in Wallet...
                    </span>
                )}
                {status === 'waiting' && (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Waiting for Chain...
                    </span>
                )}
                {status === 'success' && (
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Payment Confirmed
                    </span>
                )}
                {status === 'error' && (
                    <span className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Retry Payment
                    </span>
                )}
            </Button>

            {status === 'waiting' && (
                <p className="text-xs text-center text-gray-500 animate-pulse font-medium">
                    Transaction sent: {txHash?.slice(0, 10)}...{txHash?.slice(-8)}
                    <br />
                    Please wait while the block is being mined.
                </p>
            )}
        </div>
    );
};
