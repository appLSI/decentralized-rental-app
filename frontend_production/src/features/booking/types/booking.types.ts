export type BookingStatus =
    | 'AWAITING_PAYMENT'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'PENDING';

export interface Booking {
    id: number;
    propertyId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
    status: BookingStatus;
    tenantWalletAddress: string;
    contractAddress?: string;
    pricePerNight: number;
    totalPrice: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookingSummary {
    id: number;
    propertyId: string;
    startDate: string;
    endDate: string;
    status: BookingStatus;
    totalPrice: number;
    currency: string;
    createdAt: string;
}

export interface CreateBookingInput {
    propertyId: string;
    startDate: string;
    endDate: string;
}

export interface BookingCountResponse {
    count: number;
    userId: string;
    message: string;
}

export const BOOKING_CONSTANTS = {
    STATUS: {
        AWAITING_PAYMENT: 'AWAITING_PAYMENT' as BookingStatus,
        CONFIRMED: 'CONFIRMED' as BookingStatus,
        CANCELLED: 'CANCELLED' as BookingStatus,
        PENDING: 'PENDING' as BookingStatus,
    },
    CURRENCY: {
        ETH: 'ETH',
    }
} as const;

export interface BookingError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
}
