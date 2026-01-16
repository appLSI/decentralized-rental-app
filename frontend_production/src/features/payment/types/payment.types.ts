export enum PaymentStatus {
    VALIDATED = 'VALIDATED',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
}

export interface PaymentValidationRequestDTO {
    bookingId: number;
    transactionHash: string;
    contractAddress: string;
    expectedAmount: number;
}

export interface PaymentResponseDTO {
    paymentId: number;
    bookingId: number;
    transactionHash: string;
    contractAddress: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    fromAddress: string;
    blockNumber: number;
    validatedAt: string;
    createdAt: string;
    errorMessage?: string;
}

export interface PaymentResult {
    success: boolean;
    payment?: PaymentResponseDTO;
    error?: string;
}

export enum ContractStatus {
    AWAITING_PAYMENT = 0,
    PAID = 1,
    COMPLETED = 2,
    CANCELLED = 3,
    DISPUTED = 4
}

export interface ContractBookingDetails {
    tenant: string;
    owner: string;
    amount: string;
    platformFee: string;
    leaseStart: number;
    leaseEnd: number;
    status: ContractStatus;
}
