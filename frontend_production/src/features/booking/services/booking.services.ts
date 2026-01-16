import { privateApiClient } from "@/lib/api/privateApiClient";
import {
    Booking,
    CreateBookingInput,
    BookingCountResponse,
    BOOKING_CONSTANTS
} from "../types/booking.types";

export const BookingService = {
    createBooking: async (bookingData: CreateBookingInput): Promise<Booking> => {
        try {
            const response = await privateApiClient.post('/bookings', bookingData);
            return response.data as Booking;
        } catch (error: any) {
            console.error("Failed to create booking:", error);

            if (error.response?.status === 400) {
                const message = error.response.data.message || error.response.data.error;
                if (message?.includes("Wallet Not Connected")) {
                    throw new Error("Please connect your MetaMask wallet before booking");
                }
            }

            if (error.response?.status === 409) {
                throw new Error("Property not available for these dates");
            }

            throw new Error(error?.response?.data?.message || "Failed to create booking");
        }
    },

    cancelBooking: async (bookingId: number): Promise<Booking> => {
        try {
            const response = await privateApiClient.patch(`/bookings/${bookingId}/cancel`);
            return response.data as Booking;
        } catch (error: any) {
            console.error("Failed to cancel booking:", error);
            if (error.response?.status === 403) {
                throw new Error("You are not authorized to cancel this booking");
            }
            if (error.response?.status === 404) {
                throw new Error("Booking not found");
            }
            throw new Error(error?.response?.data?.message || "Failed to cancel booking");
        }
    },

    getMyBookings: async (): Promise<Booking[]> => {
        try {
            const response = await privateApiClient.get('/bookings/my-bookings');
            return response.data as Booking[];
        } catch (error: any) {
            console.error("Failed to fetch bookings:", error);
            throw new Error(error?.response?.data?.message || "Failed to fetch your bookings");
        }
    },

    getBookingById: async (bookingId: number): Promise<Booking> => {
        try {
            const response = await privateApiClient.get(`/bookings/${bookingId}`);
            return response.data as Booking;
        } catch (error: any) {
            console.error("Failed to fetch booking details:", error);
            if (error.response?.status === 403) {
                throw new Error("You are not authorized to view this booking");
            }
            if (error.response?.status === 404) {
                throw new Error("Booking not found");
            }
            throw new Error(error?.response?.data?.message || "Failed to fetch booking details");
        }
    },

    getClientActiveBookingsCount: async (userId: string): Promise<BookingCountResponse> => {
        try {
            const response = await privateApiClient.get(`/bookings/client/${userId}/active-count`);
            return response.data as BookingCountResponse;
        } catch (error: any) {
            console.error("Failed to count active bookings:", error);
            throw new Error(error?.response?.data?.message || "Failed to count active bookings");
        }
    },

    getHostFutureBookingsCount: async (userId: string): Promise<BookingCountResponse> => {
        try {
            const response = await privateApiClient.get(`/bookings/host/${userId}/future-count`);
            return response.data as BookingCountResponse;
        } catch (error: any) {
            console.error("Failed to count future host bookings:", error);
            throw new Error(error?.response?.data?.message || "Failed to count future host bookings");
        }
    },

    getStatusDisplayName: (status: string): string => {
        const displayNames: Record<string, string> = {
            AWAITING_PAYMENT: 'Awaiting Payment',
            CONFIRMED: 'Confirmed',
            CANCELLED: 'Cancelled',
            PENDING: 'Pending'
        };
        return displayNames[status] || status;
    },

    getStatusBadgeClass: (status: string): string => {
        const badgeClasses: Record<string, string> = {
            AWAITING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
            PENDING: 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return badgeClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
};
