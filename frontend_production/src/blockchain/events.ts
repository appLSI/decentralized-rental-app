import { ethers } from 'ethers';
import { WEB3_CONFIG } from './config';

export interface PaymentReceivedEvent {
    bookingId: bigint;
    from: string;
    amount: bigint;
    transactionHash: string;
    blockNumber: number;
}

export interface FundsReleasedEvent {
    bookingId: bigint;
    owner: string;
    ownerAmount: bigint;
    platformFee: bigint;
    transactionHash: string;
    blockNumber: number;
}

export interface CancelledEvent {
    bookingId: bigint;
    refundedTo: string;
    amount: bigint;
    transactionHash: string;
    blockNumber: number;
}

export async function waitForPaymentReceivedEvent(
    timeout: number = 60000
): Promise<PaymentReceivedEvent> {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const rentalEscrow = new ethers.Contract(
        WEB3_CONFIG.CONTRACT_ADDRESS,
        WEB3_CONFIG.RENTAL_ESCROW_ABI,
        provider
    );

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Timeout waiting for PaymentReceived event'));
        }, timeout);

        const filter = rentalEscrow.filters.PaymentReceived();

        const listener = (
            bookingId: bigint,
            from: string,
            amount: bigint,
            event: ethers.EventLog
        ) => {
            clearTimeout(timeoutId);
            rentalEscrow.off(filter, listener);

            resolve({
                bookingId,
                from,
                amount,
                transactionHash: event.transactionHash,
                blockNumber: event.blockNumber
            });
        };

        rentalEscrow.on(filter, listener);
    });
}

export async function getPaymentReceivedEvents(
    fromBlock: number = 0,
    toBlock: number | 'latest' = 'latest'
): Promise<PaymentReceivedEvent[]> {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const rentalEscrow = new ethers.Contract(
            WEB3_CONFIG.CONTRACT_ADDRESS,
            WEB3_CONFIG.RENTAL_ESCROW_ABI,
            provider
        );

        const events = await rentalEscrow.queryFilter(
            rentalEscrow.filters.PaymentReceived(),
            fromBlock,
            toBlock
        );

        return events.map(event => {
            const log = event as ethers.EventLog;
            const args = log.args || [];
            return {
                bookingId: args[0] || 0n,
                from: args[1] || '',
                amount: args[2] || 0n,
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber
            };
        });
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch PaymentReceived events');
    }
}

export async function listenToPaymentReceivedEvent(
    callback: (event: PaymentReceivedEvent) => void
): Promise<() => void> {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const rentalEscrow = new ethers.Contract(
        WEB3_CONFIG.CONTRACT_ADDRESS,
        WEB3_CONFIG.RENTAL_ESCROW_ABI,
        provider
    );

    const filter = rentalEscrow.filters.PaymentReceived();

    const listener = (
        bookingId: bigint,
        from: string,
        amount: bigint,
        event: ethers.EventLog
    ) => {
        callback({
            bookingId,
            from,
            amount,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
        });
    };

    rentalEscrow.on(filter, listener);

    return () => {
        rentalEscrow.off(filter, listener);
    };
}

export async function getFundsReleasedEvents(
    fromBlock: number = 0,
    toBlock: number | 'latest' = 'latest'
): Promise<FundsReleasedEvent[]> {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const rentalEscrow = new ethers.Contract(
            WEB3_CONFIG.CONTRACT_ADDRESS,
            WEB3_CONFIG.RENTAL_ESCROW_ABI,
            provider
        );

        const events = await rentalEscrow.queryFilter(
            rentalEscrow.filters.FundsReleased(),
            fromBlock,
            toBlock
        );

        return events.map(event => {
            const log = event as ethers.EventLog;
            const args = log.args || [];
            return {
                bookingId: args[0] || 0n,
                owner: args[1] || '',
                ownerAmount: args[2] || 0n,
                platformFee: args[3] || 0n,
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber
            };
        });
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch FundsReleased events');
    }
}

export async function getCancelledEvents(
    fromBlock: number = 0,
    toBlock: number | 'latest' = 'latest'
): Promise<CancelledEvent[]> {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const rentalEscrow = new ethers.Contract(
            WEB3_CONFIG.CONTRACT_ADDRESS,
            WEB3_CONFIG.RENTAL_ESCROW_ABI,
            provider
        );

        const events = await rentalEscrow.queryFilter(
            rentalEscrow.filters.Cancelled(),
            fromBlock,
            toBlock
        );

        return events.map(event => {
            const log = event as ethers.EventLog;
            const args = log.args || [];
            return {
                bookingId: args[0] || 0n,
                refundedTo: args[1] || '',
                amount: args[2] || 0n,
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber
            };
        });
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch Cancelled events');
    }
}
