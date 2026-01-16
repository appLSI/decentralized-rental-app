import { ethers } from 'ethers';
import { WEB3_CONFIG } from './config';

export enum ContractStatus {
    AWAITING_PAYMENT = 0,
    PAID = 1,
    COMPLETED = 2,
    CANCELLED = 3,
    DISPUTED = 4
}

export async function switchToSepolia() {
    console.log('[switchToSepolia] Starting chain switch...');
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const SEPOLIA_CHAIN_ID = '0xAA36A7';

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        console.log('[switchToSepolia] Switched to Sepolia successfully');
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            console.log('[switchToSepolia] Sepolia not found. Adding chain...');
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: SEPOLIA_CHAIN_ID,
                        chainName: 'Sepolia Test Network',
                        rpcUrls: [WEB3_CONFIG.RPC_URL],
                        nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                        blockExplorerUrls: [WEB3_CONFIG.BLOCK_EXPLORER_URL],
                    },
                ],
            });
            console.log('[switchToSepolia] Sepolia added and switched successfully');
        } else {
            console.error('[switchToSepolia] Error switching chain:', switchError);
            throw switchError;
        }
    }
}

export async function createBooking(
    bookingId: number,
    tenant: string,
    owner: string,
    amountInEth: string,
    leaseStart = 0,
    leaseEnd = 0
) {
    console.log('[createBooking] Creating booking:', bookingId);
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    console.log('[createBooking] Signer obtained');

    const rentalEscrow = new ethers.Contract(
        WEB3_CONFIG.CONTRACT_ADDRESS,
        WEB3_CONFIG.RENTAL_ESCROW_ABI,
        signer
    );

    const amountInWei = ethers.parseEther(amountInEth);
    console.log('[payRent] Sending value:', amountInEth.toString());

    try {
        const tx = await rentalEscrow.createBooking(
            bookingId,
            tenant,
            owner,
            amountInWei,
            leaseStart,
            leaseEnd
        );
        console.log('[createBooking] Transaction sent. Hash:', tx.hash);

        const receipt = await tx.wait();
        console.log('[createBooking] Booking created. Block number:', receipt.blockNumber);

        return {
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            status: receipt.status,
            bookingId,
            tenant,
            owner,
            amount: amountInEth,
            leaseStart,
            leaseEnd
        };
    } catch (error: any) {
        console.error('[createBooking] Error creating booking:', error);
        throw error;
    }
}


export async function validateContract(contractAddress: string): Promise<boolean> {
    console.log('[validateContract] Validating contract at', contractAddress);
    if (!window.ethereum) throw new Error('MetaMask not installed');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const code = await provider.getCode(contractAddress);
    const exists = code !== '0x';
    console.log('[validateContract] Contract exists:', exists);
    return exists;
}

export async function payRent(bookingId: number, amountInEth: string) {
    console.log('[payRent] Starting payment for booking', bookingId, 'amount', amountInEth, 'ETH');

    if (!window.ethereum) throw new Error('MetaMask not installed');

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Request accounts
    await provider.send('eth_requestAccounts', []);
    console.log('[payRent] MetaMask accounts requested');

    // Check network
    const network = await provider.getNetwork();
    console.log('[payRent] Current network chainId:', network.chainId.toString());
    if (network.chainId !== BigInt(WEB3_CONFIG.CHAIN_ID)) {
        console.log('[payRent] Switching network to Sepolia...');
        await switchToSepolia();
    }

    // Get signer
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('[payRent] Signer obtained:', signerAddress);

    // Connect contract
    const rentalEscrow = new ethers.Contract(WEB3_CONFIG.CONTRACT_ADDRESS, WEB3_CONFIG.RENTAL_ESCROW_ABI, signer);

    // Validate contract exists
    const exists = await validateContract(WEB3_CONFIG.CONTRACT_ADDRESS);
    console.log('[payRent] Contract exists:', exists);
    if (!exists) throw new Error('Contract does not exist on this network.');

    // Fetch booking details
    console.log('[payRent] Fetching booking details...');
    const bookingDetails = await rentalEscrow.getBookingDetails(bookingId);

    console.log('[payRent] Booking details:', {
        id: bookingDetails.id.toString(),
        tenant: bookingDetails.tenant,
        owner: bookingDetails.owner,
        amount: ethers.formatEther(bookingDetails.amount),
        platformFee: ethers.formatEther(bookingDetails.platformFee),
        leaseStart: bookingDetails.leaseStart.toString(),
        leaseEnd: bookingDetails.leaseEnd.toString(),
        status: bookingDetails.status,
    });

    const tenantAddress = bookingDetails.tenant;
    if (signerAddress.toLowerCase() !== tenantAddress.toLowerCase()) {
        throw new Error('Only the tenant can pay rent for this booking.');
    }

    // Convert amount to Wei
    const value = ethers.parseEther(amountInEth);
    console.log('[payRent] Amount in Wei to send:', value.toString());

    // Check exact amount match
    if (value !== bookingDetails.amount) {
        console.warn('[payRent] WARNING: Amount mismatch! Booking expects', bookingDetails.amount.toString(), 'Wei');
    }

    try {
        const tx = await rentalEscrow.payRent(bookingId, { value });
        console.log('[payRent] Transaction sent. Hash:', tx.hash);

        const receipt = await tx.wait();
        console.log('[payRent] Transaction confirmed. Block number:', receipt.blockNumber, 'Status:', receipt.status);

        return {
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            status: receipt.status,
            from: signerAddress,
            to: WEB3_CONFIG.CONTRACT_ADDRESS,
            bookingId
        };
    } catch (error: any) {
        console.error('[payRent] Payment error:', error);

        // If revert reason exists, log it
        if (error?.reason) {
            console.error('[payRent] Revert reason:', error.reason);
        }
        throw error;
    }
}


export async function getBookingDetails(bookingId: number) {
    console.log('[getBookingDetails] Fetching booking details for', bookingId);
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const rentalEscrow = new ethers.Contract(WEB3_CONFIG.CONTRACT_ADDRESS, WEB3_CONFIG.RENTAL_ESCROW_ABI, provider);

    try {
        const details = await rentalEscrow.getBookingDetails(bookingId);
        const status = await rentalEscrow.getBookingStatus(bookingId);
        console.log('[getBookingDetails] Booking details fetched successfully');

        return {
            tenant: details.tenant,
            owner: details.owner,
            amount: ethers.formatEther(details.amount),
            platformFee: ethers.formatEther(details.platformFee),
            leaseStart: Number(details.leaseStart),
            leaseEnd: Number(details.leaseEnd),
            status: Number(status) as ContractStatus
        };
    } catch (error) {
        console.error('[getBookingDetails] Error fetching booking details:', error);
        throw error;
    }
}

export async function getBookingStatus(bookingId: number): Promise<ContractStatus> {
    console.log('[getBookingStatus] Fetching status for booking', bookingId);
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const rentalEscrow = new ethers.Contract(WEB3_CONFIG.CONTRACT_ADDRESS, WEB3_CONFIG.RENTAL_ESCROW_ABI, provider);

    try {
        const status = await rentalEscrow.getBookingStatus(bookingId);
        console.log('[getBookingStatus] Status fetched:', Number(status));
        return Number(status) as ContractStatus;
    } catch (error) {
        console.error('[getBookingStatus] Error fetching status:', error);
        throw error;
    }
}

export async function isBookingExist(bookingId: number): Promise<boolean> {
    console.log('[isBookingExist] Checking if booking exists for', bookingId);
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const rentalEscrow = new ethers.Contract(WEB3_CONFIG.CONTRACT_ADDRESS, WEB3_CONFIG.RENTAL_ESCROW_ABI, provider);

    try {
        await rentalEscrow.getBookingDetails(bookingId);
        console.log('[isBookingExist] Booking exists');
        return true;
    } catch (error) {
        console.log('[isBookingExist] Booking does not exist');
        return false;
    }
}

export async function getContractBalance(): Promise<string> {
    console.log('[getContractBalance] Fetching contract balance...');
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(WEB3_CONFIG.CONTRACT_ADDRESS);
    const formatted = ethers.formatEther(balance);
    console.log('[getContractBalance] Contract balance:', formatted, 'ETH');
    return formatted;
}
